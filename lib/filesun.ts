// lib/filesun.ts

interface FileSuNData {
  movies: { tmdbIds: number[] };
  tv: { tmdbIds: number[] };
}

let cache: { movies: Set<number>; tv: Set<number> } | null = null;

async function loadData(): Promise<{ movies: Set<number>; tv: Set<number> }> {
  if (cache) return cache;

  try {
    const base = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
    const res = await fetch(`${base}/data/filesun-ids.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: FileSuNData = await res.json();

    cache = {
      movies: new Set(data.movies.tmdbIds),
      tv: new Set(data.tv.tmdbIds),
    };
    return cache;
  } catch {
    return { movies: new Set(), tv: new Set() };
  }
}

export async function getAvailableMovieIds(): Promise<Set<number>> {
  const data = await loadData();
  return data.movies;
}

export async function getAvailableTVIds(): Promise<Set<number>> {
  const data = await loadData();
  return data.tv;
}