// lib/watchlist.ts
'use client';

export interface WatchlistItem {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  vote_average: number;
  year: string;
  addedAt: number;
}

const KEY = 'cinestream_watchlist';

function getAll(): WatchlistItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function save(items: WatchlistItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('watchlist-update'));
}

export function getWatchlist(): WatchlistItem[] {
  return getAll().sort((a, b) => b.addedAt - a.addedAt);
}

export function isInWatchlist(id: number, type: 'movie' | 'tv'): boolean {
  return getAll().some((item) => item.id === id && item.type === type);
}

export function addToWatchlist(item: Omit<WatchlistItem, 'addedAt'>) {
  const list = getAll();
  if (list.some((i) => i.id === item.id && i.type === item.type)) return;
  list.push({ ...item, addedAt: Date.now() });
  save(list);
}

export function removeFromWatchlist(id: number, type: 'movie' | 'tv') {
  const list = getAll().filter((i) => !(i.id === id && i.type === type));
  save(list);
}

export function toggleWatchlist(item: Omit<WatchlistItem, 'addedAt'>) {
  if (isInWatchlist(item.id, item.type)) {
    removeFromWatchlist(item.id, item.type);
  } else {
    addToWatchlist(item);
  }
}