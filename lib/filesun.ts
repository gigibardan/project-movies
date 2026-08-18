// lib/filesun.ts

let movieCache: { set: Set<string>; ts: number } | null = null;
let tvCache: { set: Set<number>; ts: number } | null = null;
const TTL = 6 * 60 * 60 * 1000; // 6 ore

async function fetchPage(type: 'movies' | 'tv', page: number): Promise<{ ids: string[]; pages: number }> {
  const url = `https://filesun.sbs/available/${type}?page=${page}`;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 21600 },
      headers: { 'User-Agent': 'CineStream/1.0' },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.error(`[FileSuN] ${type} page ${page}: HTTP ${res.status}`);
      return { ids: [], pages: 0 };
    }

    const data = await res.json();
    console.log(`[FileSuN] ${type} page ${page}: ${(data.ids || []).length} ids, ${data.pages} total pages`);
    return { ids: (data.ids || []) as string[], pages: data.pages || 0 };
  } catch (err) {
    console.error(`[FileSuN] ${type} page ${page} FAILED:`, (err as Error).message);
    return { ids: [], pages: 0 };
  }
}

async function fetchAllIds(type: 'movies' | 'tv'): Promise<string[]> {
  const first = await fetchPage(type, 1);
  if (first.ids.length === 0) {
    console.warn(`[FileSuN] ${type}: first page returned 0 ids — API may be down`);
    return [];
  }
  if (first.pages <= 1) return first.ids;

  // Fetch remaining pages in batches of 5 to avoid overwhelming
  const allIds = [...first.ids];
  for (let i = 2; i <= first.pages; i += 5) {
    const batch = Array.from(
      { length: Math.min(5, first.pages - i + 1) },
      (_, j) => fetchPage(type, i + j)
    );
    const results = await Promise.all(batch);
    allIds.push(...results.flatMap((r) => r.ids));
  }

  console.log(`[FileSuN] ${type}: total ${allIds.length} ids loaded`);
  return allIds;
}

export async function getAvailableMovieIds(): Promise<Set<string>> {
  if (movieCache && Date.now() - movieCache.ts < TTL) return movieCache.set;
  const ids = await fetchAllIds('movies');
  const set = new Set(ids);
  movieCache = { set, ts: Date.now() };
  return set;
}

export async function getAvailableTVIds(): Promise<Set<number>> {
  if (tvCache && Date.now() - tvCache.ts < TTL) return tvCache.set;
  const ids = await fetchAllIds('tv');
  const set = new Set(ids.map(Number).filter((n) => !isNaN(n)));
  tvCache = { set, ts: Date.now() };
  return set;
}

export async function isMovieAvailable(imdbId: string | null | undefined): Promise<boolean> {
  if (!imdbId) return false;
  const set = await getAvailableMovieIds();
  return set.has(imdbId);
}

export async function isTVAvailable(tmdbId: number): Promise<boolean> {
  const set = await getAvailableTVIds();
  return set.has(tmdbId);
}