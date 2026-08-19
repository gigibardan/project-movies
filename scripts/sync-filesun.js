// scripts/sync-filesun.js
const fs = require('fs');
const path = require('path');

const FILESUN_BASE = 'https://filesun.sbs/available';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const OUT_DIR = path.join(__dirname, '..', 'public', 'data');
const OUT_FILE = path.join(OUT_DIR, 'filesun-ids.json');
const CATALOG_FILE = path.join(OUT_DIR, 'filesun-catalog.json');
const MAPPING_FILE = path.join(OUT_DIR, 'imdb-tmdb-map.json');

// Load TMDB key from .env.local
fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8')
  .split('\n')
  .forEach((line) => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim();
  });

const TMDB_KEY = process.env.TMDB_API_KEY;
if (!TMDB_KEY) {
  console.error('TMDB_API_KEY not found in .env.local');
  process.exit(1);
}

// --- FileSuN fetching ---

async function fetchFileSuNPage(type, page) {
  const res = await fetch(`${FILESUN_BASE}/${type}?page=${page}`);
  if (!res.ok) throw new Error(`FileSuN HTTP ${res.status} for ${type} page ${page}`);
  return res.json();
}

async function fetchAllFileSuNIds(type) {
  console.log(`\n[FileSuN] Fetching ${type}...`);
  const first = await fetchFileSuNPage(type, 1);
  const allIds = [...first.ids];
  console.log(`  Page 1/${first.pages}: ${first.ids.length} ids`);

  for (let i = 2; i <= first.pages; i++) {
    const data = await fetchFileSuNPage(type, i);
    allIds.push(...data.ids);
    console.log(`  Page ${i}/${first.pages}: ${data.ids.length} ids`);
  }

  console.log(`  Total ${type}: ${allIds.length}`);
  return allIds;
}

// --- TMDB conversion ---

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function imdbToTmdb(imdbId) {
  try {
    const res = await fetch(
      `${TMDB_BASE}/find/${imdbId}?api_key=${TMDB_KEY}&external_source=imdb_id`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const movie = data.movie_results?.[0];
    if (movie) {
      return {
        tmdbId: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date,
        popularity: movie.popularity,
      };
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchTVMeta(tmdbId) {
  try {
    const res = await fetch(
      `${TMDB_BASE}/tv/${tmdbId}?api_key=${TMDB_KEY}&language=en-US`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      id: data.id,
      name: data.name,
      poster_path: data.poster_path,
      vote_average: data.vote_average,
      first_air_date: data.first_air_date,
      popularity: data.popularity,
    };
  } catch {
    return null;
  }
}

async function convertImdbIds(imdbIds, existingMap) {
  const newIds = imdbIds.filter((id) => !(id in existingMap));
  console.log(`\n[TMDB] ${imdbIds.length} total IMDb IDs`);
  console.log(`[TMDB] ${Object.keys(existingMap).length} already mapped`);
  console.log(`[TMDB] ${newIds.length} new IDs to convert`);

  if (newIds.length === 0) return existingMap;

  const map = { ...existingMap };
  let converted = 0;
  let failed = 0;
  const startTime = Date.now();
  const BATCH_SIZE = 35;

  for (let i = 0; i < newIds.length; i += BATCH_SIZE) {
    const batch = newIds.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map((id) => imdbToTmdb(id)));

    batch.forEach((imdbId, j) => {
      if (results[j]) {
        map[imdbId] = results[j]; // Save full metadata now
        converted++;
      } else {
        map[imdbId] = null;
        failed++;
      }
    });

    const done = Math.min(i + BATCH_SIZE, newIds.length);
    const elapsed = (Date.now() - startTime) / 1000;
    const rate = (done / elapsed).toFixed(1);
    const eta = (((newIds.length - done) / (done / elapsed)) / 60).toFixed(1);
    process.stdout.write(
      `\r  Progress: ${done}/${newIds.length} (${converted} ok, ${failed} failed) | ${rate}/s | ETA: ${eta}min`
    );

    if (i + BATCH_SIZE < newIds.length) await sleep(1100);
  }

  console.log('\n');
  return map;
}

async function fetchTVMetadata(tvIds, existingCatalog) {
  const existingIds = new Set(existingCatalog.map((t) => t.id));
  const newIds = tvIds.filter((id) => !existingIds.has(Number(id)));

  console.log(`\n[TMDB TV] ${tvIds.length} total TV IDs`);
  console.log(`[TMDB TV] ${existingCatalog.length} already have metadata`);
  console.log(`[TMDB TV] ${newIds.length} new IDs to fetch`);

  if (newIds.length === 0) return existingCatalog;

  const results = [...existingCatalog];
  let fetched = 0;
  let failed = 0;
  const startTime = Date.now();
  const BATCH_SIZE = 35;

  for (let i = 0; i < newIds.length; i += BATCH_SIZE) {
    const batch = newIds.slice(i, i + BATCH_SIZE);
    const data = await Promise.all(batch.map((id) => fetchTVMeta(id)));

    data.forEach((item) => {
      if (item) {
        results.push({
          id: item.id,
          t: item.name,
          p: item.poster_path,
          y: item.first_air_date?.slice(0, 4) || '',
          r: Math.round((item.vote_average || 0) * 10) / 10,
          pop: item.popularity || 0,
        });
        fetched++;
      } else {
        failed++;
      }
    });

    const done = Math.min(i + BATCH_SIZE, newIds.length);
    const elapsed = (Date.now() - startTime) / 1000;
    const rate = (done / elapsed).toFixed(1);
    const eta = (((newIds.length - done) / (done / elapsed)) / 60).toFixed(1);
    process.stdout.write(
      `\r  TV Progress: ${done}/${newIds.length} (${fetched} ok, ${failed} failed) | ${rate}/s | ETA: ${eta}min`
    );

    if (i + BATCH_SIZE < newIds.length) await sleep(1100);
  }

  console.log('\n');
  return results;
}

// --- Main ---

async function main() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  // Load existing data
  let existingMap = {};
  if (fs.existsSync(MAPPING_FILE)) {
    existingMap = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf-8'));
    console.log(`Loaded existing mapping: ${Object.keys(existingMap).length} entries`);
  }

  let existingTVCatalog = [];
  if (fs.existsSync(CATALOG_FILE)) {
    try {
      const cat = JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf-8'));
      existingTVCatalog = cat.tv || [];
    } catch { }
  }

  // Fetch all IDs from FileSuN
  const movieImdbIds = await fetchAllFileSuNIds('movies');
  const tvTmdbIds = await fetchAllFileSuNIds('tv');

  // Convert IMDb IDs to TMDB IDs (with metadata)
  const map = await convertImdbIds(movieImdbIds, existingMap);

  // Save raw mapping
  fs.writeFileSync(MAPPING_FILE, JSON.stringify(map));
  console.log(`Mapping saved: ${Object.keys(map).length} entries`);

  // Fetch TV metadata
  const tvCatalog = await fetchTVMetadata(tvTmdbIds, existingTVCatalog);

  // Build movie catalog from mapping data
  const movieCatalog = movieImdbIds
    .map((imdbId) => {
      const entry = map[imdbId];
      if (!entry || !entry.tmdbId) return null;
      return {
        id: entry.tmdbId,
        t: entry.title,
        p: entry.poster_path,
        y: entry.release_date?.slice(0, 4) || '',
        r: Math.round((entry.vote_average || 0) * 10) / 10,
        pop: entry.popularity || 0,
      };
    })
    .filter(Boolean);

  // Build IDs file (for badges/buttons)
  const idsOutput = {
    updated: new Date().toISOString(),
    movies: { tmdbIds: movieCatalog.map((m) => m.id), count: movieCatalog.length },
    tv: { tmdbIds: tvCatalog.map((t) => t.id), count: tvCatalog.length },
  };
  fs.writeFileSync(OUT_FILE, JSON.stringify(idsOutput));

  // Build catalog file (for Available page)
  // Sort by popularity descending
  movieCatalog.sort((a, b) => (b.pop || 0) - (a.pop || 0));
  tvCatalog.sort((a, b) => (b.pop || 0) - (a.pop || 0));

  const catalogOutput = {
    updated: new Date().toISOString(),
    movies: movieCatalog.map(({ pop, ...rest }) => rest), // Remove pop from output to save space
    tv: tvCatalog.map(({ pop, ...rest }) => rest),
  };
  fs.writeFileSync(CATALOG_FILE, JSON.stringify(catalogOutput));

  // Build recently added diff
  const DIFF_FILE = path.join(OUT_DIR, 'filesun-recent.json');
  let previousIds = { movies: [], tv: [] };
  if (fs.existsSync(DIFF_FILE)) {
    try {
      const prev = JSON.parse(fs.readFileSync(DIFF_FILE, 'utf-8'));
      previousIds = { movies: prev.allMovieIds || [], tv: prev.allTVIds || [] };
    } catch { }
  }

  const prevMovieSet = new Set(previousIds.movies);
  const prevTVSet = new Set(previousIds.tv);

  const newMovies = movieCatalog
    .filter((m) => !prevMovieSet.has(m.id))
    .slice(0, 50);
  const newTV = tvCatalog
    .filter((t) => !prevTVSet.has(t.id))
    .slice(0, 50);

  const recentOutput = {
    updated: new Date().toISOString(),
    newMovies: newMovies.map(({ pop, ...rest }) => rest),
    newTV: newTV.map(({ pop, ...rest }) => rest),
    allMovieIds: movieCatalog.map((m) => m.id),
    allTVIds: tvCatalog.map((t) => t.id),
  };
  fs.writeFileSync(DIFF_FILE, JSON.stringify(recentOutput));
  console.log(`Recently added: ${newMovies.length} movies, ${newTV.length} TV shows`);

  const idSize = (Buffer.byteLength(JSON.stringify(idsOutput)) / 1024).toFixed(0);
  const catSize = (Buffer.byteLength(JSON.stringify(catalogOutput)) / 1024 / 1024).toFixed(2);
  console.log(`\nIDs file: ${idSize} KB`);
  console.log(`Catalog file: ${catSize} MB`);
  console.log(`Movies: ${movieCatalog.length} | TV: ${tvCatalog.length}`);
  console.log(`Updated: ${idsOutput.updated}`);
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});