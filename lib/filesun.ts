// lib/filesun.ts

let movieCache: { set: Set<string>; ts: number } | null = null;
let tvCache: { set: Set<number>; ts: number } | null = null;
const TTL = 6 * 60 * 60 * 1000; // 6 ore

async function fetchPage(type: 'movies' | 'tv', page: number) {
  try {
    const res = await fetch(`https://filesun.sbs/available/${type}?page=${page}`, {
      next: { revalidate: 21600 },
    });
    if (!res.ok) return { ids: [] as string[], pages: 0 };
    const data = await res.json();
    return { ids: (data.ids || []) as string[], pages: data.pages || 0 };
  } catch {
    return { ids: [] as string[], pages: 0 };
  }
}

async function fetchAllIds(type: 'movies' | 'tv'): Promise<string[]> {
  const first = await fetchPage(type, 1);
  if (first.pages <= 1) return first.ids;

  const rest = await Promise.all(
    Array.from({ length: first.pages - 1 }, (_, i) => fetchPage(type, i + 2))
  );
  return [...first.ids, ...rest.flatMap((r) => r.ids)];
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