// lib/filesun.ts

let movieCache: { set: Set<string>; ts: number } | null = null;
let tvCache: { set: Set<number>; ts: number } | null = null;
const TTL = 30 * 60 * 1000; // 30 min

function getBaseUrl() {
  if (typeof window !== 'undefined') return '';
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
}

async function fetchPage(type: 'movies' | 'tv', page: number): Promise<{ ids: string[]; pages: number }> {
  try {
    const base = getBaseUrl();
    const res = await fetch(`${base}/api/filesun?type=${type}&page=${page}`);
    if (!res.ok) return { ids: [], pages: 0 };
    return await res.json();
  } catch {
    return { ids: [], pages: 0 };
  }
}

async function fetchAllIds(type: 'movies' | 'tv'): Promise<string[]> {
  const first = await fetchPage(type, 1);
  if (first.ids.length === 0) return [];
  if (first.pages <= 1) return first.ids;

  const allIds = [...first.ids];
  for (let i = 2; i <= first.pages; i += 5) {
    const batch = Array.from(
      { length: Math.min(5, first.pages - i + 1) },
      (_, j) => fetchPage(type, i + j)
    );
    const results = await Promise.all(batch);
    allIds.push(...results.flatMap((r) => r.ids));
  }
  return allIds;
}

export async function getAvailableMovieIds(): Promise<Set<string>> {
  if (movieCache && Date.now() - movieCache.ts < TTL) return movieCache.set;
  const ids = await fetchAllIds('movies');
  const set = new Set(ids);
  if (set.size > 0) movieCache = { set, ts: Date.now() };
  return set;
}

export async function getAvailableTVIds(): Promise<Set<number>> {
  if (tvCache && Date.now() - tvCache.ts < TTL) return tvCache.set;
  const ids = await fetchAllIds('tv');
  const set = new Set(ids.map(Number).filter((n) => !isNaN(n)));
  if (set.size > 0) tvCache = { set, ts: Date.now() };
  return set;
}