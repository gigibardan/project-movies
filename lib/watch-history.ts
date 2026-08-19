// lib/watch-history.ts
'use client';

export interface WatchHistoryItem {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  season?: number;
  episode?: number;
  episodeTitle?: string;
  timestamp: number;
}

const KEY = 'cinestream_history';
const MAX_ITEMS = 50;

function getAll(): WatchHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function save(items: WatchHistoryItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('history-update'));
}

export function getWatchHistory(): WatchHistoryItem[] {
  return getAll().sort((a, b) => b.timestamp - a.timestamp);
}

export function addToHistory(item: WatchHistoryItem) {
  let list = getAll();
  // Remove existing entry for same title
  list = list.filter((i) => !(i.id === item.id && i.type === item.type));
  // Add to front
  list.unshift({ ...item, timestamp: Date.now() });
  // Trim
  if (list.length > MAX_ITEMS) list = list.slice(0, MAX_ITEMS);
  save(list);
}

export function getContinueWatching(): WatchHistoryItem[] {
  // Only TV shows (movies don't have "continue")
  return getAll()
    .filter((i) => i.type === 'tv')
    .sort((a, b) => b.timestamp - a.timestamp);
}

export function clearHistory() {
  save([]);
}