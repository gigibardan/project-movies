// scripts/sync-filesun.js
const fs = require('fs');
const path = require('path');

const FILESUN_BASE = 'https://filesun.sbs/available';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const OUT_DIR = path.join(__dirname, '..', 'public', 'data');
const OUT_FILE = path.join(OUT_DIR, 'filesun-ids.json');
const MAPPING_FILE = path.join(OUT_DIR, 'imdb-tmdb-map.json');

// Load TMDB key from .env.local
require('fs')
  .readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8')
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
    if (movie) return { tmdbId: movie.id, title: movie.title };
    return null;
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

  // Process in batches of 35 (under TMDB's 40/s limit)
  const BATCH_SIZE = 35;

  for (let i = 0; i < newIds.length; i += BATCH_SIZE) {
    const batch = newIds.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map((id) => imdbToTmdb(id)));

    batch.forEach((imdbId, j) => {
      if (results[j]) {
        map[imdbId] = results[j].tmdbId;
        converted++;
      } else {
        map[imdbId] = null; // Mark as attempted but not found
        failed++;
      }
    });

    const done = Math.min(i + BATCH_SIZE, newIds.length);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
    const rate = (done / ((Date.now() - startTime) / 1000)).toFixed(1);
    const eta = (((newIds.length - done) / rate) / 60).toFixed(1);
    process.stdout.write(
      `\r  Progress: ${done}/${newIds.length} (${converted} ok, ${failed} failed) | ${rate}/s | ETA: ${eta}min`
    );

    // Wait 1.1 seconds between batches to stay under rate limit
    if (i + BATCH_SIZE < newIds.length) {
      await sleep(1100);
    }
  }

  console.log('\n');
  return map;
}

// --- Main ---

async function main() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  // Load existing mapping if available
  let existingMap = {};
  if (fs.existsSync(MAPPING_FILE)) {
    existingMap = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf-8'));
    console.log(`Loaded existing mapping: ${Object.keys(existingMap).length} entries`);
  }

  // Fetch all IDs from FileSuN
  const movieImdbIds = await fetchAllFileSuNIds('movies');
  const tvTmdbIds = await fetchAllFileSuNIds('tv');

  // Convert IMDb IDs to TMDB IDs
  const map = await convertImdbIds(movieImdbIds, existingMap);

  // Save the raw mapping for incremental updates
  fs.writeFileSync(MAPPING_FILE, JSON.stringify(map));
  console.log(`Mapping saved: ${Object.keys(map).length} entries`);

  // Build the final output: sets of TMDB IDs
  const movieTmdbIds = movieImdbIds
    .map((imdbId) => map[imdbId])
    .filter((id) => id != null);

  const output = {
    updated: new Date().toISOString(),
    movies: {
      tmdbIds: movieTmdbIds,
      count: movieTmdbIds.length,
    },
    tv: {
      tmdbIds: tvTmdbIds.map(Number).filter((n) => !isNaN(n)),
      count: tvTmdbIds.length,
    },
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(output));

  const sizeMB = (Buffer.byteLength(JSON.stringify(output)) / 1024 / 1024).toFixed(2);
  console.log(`\nOutput saved to ${OUT_FILE} (${sizeMB} MB)`);
  console.log(`Movies: ${output.movies.count} TMDB IDs (from ${movieImdbIds.length} IMDb IDs)`);
  console.log(`TV: ${output.tv.count} TMDB IDs`);
  console.log(`Updated: ${output.updated}`);
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});