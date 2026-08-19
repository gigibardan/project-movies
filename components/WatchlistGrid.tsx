'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star, Trash2 } from 'lucide-react';
import { getWatchlist, removeFromWatchlist, type WatchlistItem } from '@/lib/watchlist';
import { cn } from '@/lib/utils';

export default function WatchlistGrid() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'movie' | 'tv'>('all');

  const refresh = useCallback(() => {
    setItems(getWatchlist());
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener('watchlist-update', refresh);
    return () => window.removeEventListener('watchlist-update', refresh);
  }, [refresh]);

  const filtered = filter === 'all' ? items : items.filter((i) => i.type === filter);

  const handleRemove = (id: number, type: 'movie' | 'tv') => {
    removeFromWatchlist(id, type);
    refresh();
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Heart className="h-7 w-7 text-red-500 fill-red-500" />
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">My Watchlist</h1>
          <p className="text-sm text-zinc-500">{items.length} saved titles</p>
        </div>
      </div>

      {items.length > 0 && (
        <div className="mb-6 flex gap-2">
          {(['all', 'movie', 'tv'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                filter === f
                  ? 'bg-red-600 text-white'
                  : 'border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'
              )}
            >
              {f === 'all' ? `All (${items.length})` : f === 'movie' ? `Movies (${items.filter((i) => i.type === 'movie').length})` : `TV (${items.filter((i) => i.type === 'tv').length})`}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-zinc-500">
          <Heart className="h-12 w-12 text-zinc-700" />
          <p>{items.length === 0 ? 'Your watchlist is empty. Browse movies and shows to add some!' : 'No matches for this filter.'}</p>
          {items.length === 0 && (
            <Link href="/" className="rounded-full bg-red-600 px-6 py-2 text-sm font-semibold text-white hover:bg-red-500">
              Browse
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((item) => {
            const poster = item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : null;
            const href = item.type === 'movie' ? `/movie/${item.id}` : `/tv/${item.id}`;
            return (
              <div key={`${item.type}-${item.id}`} className="group relative">
                <Link href={href} className="block">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-zinc-900 shadow-md transition-all group-hover:shadow-xl">
                    {poster ? (
                      <Image src={poster} alt={item.title} fill sizes="(max-width: 640px) 50vw, 20vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-zinc-600">No image</div>
                    )}
                    {item.vote_average > 0 && (
                      <div className="absolute right-2 top-2 flex items-center gap-0.5 rounded bg-black/70 px-1.5 py-0.5 backdrop-blur-sm">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-bold text-white">{item.vote_average.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </Link>
                <button
                  onClick={() => handleRemove(item.id, item.type)}
                  className="absolute left-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-zinc-400 opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100 hover:bg-red-600 hover:text-white"
                  aria-label="Remove from watchlist"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <h3 className="mt-2 line-clamp-1 text-sm font-medium text-zinc-200">{item.title}</h3>
                <p className="text-xs text-zinc-500">{item.year}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}