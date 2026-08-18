// lib/filesun.ts

let movieCache: Set<string> | null = null;
let tvCache: Set<number> | null = null;

async function loadIds(): Promise<{ movies: string[]; tv: string[] }> {
  try {
    const base = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
    const res = await fetch(`${base}/data/filesun-ids.json`);
    if (!res.ok) return { movies: [], tv: [] };
    return await res.json();
  } catch {
    return { movies: [], tv: [] };
  }
}

export async function getAvailableMovieIds(): Promise<Set<string>> {
  if (movieCache) return movieCache;
  const data = await loadIds();
  movieCache = new Set(data.movies);
  tvCache = new Set(data.tv.map(Number).filter((n) => !isNaN(n)));
  return movieCache;
}

export async function getAvailableTVIds(): Promise<Set<number>> {
  if (tvCache) return tvCache;
  const data = await loadIds();
  movieCache = new Set(data.movies);
  tvCache = new Set(data.tv.map(Number).filter((n) => !isNaN(n)));
  return tvCache;
}