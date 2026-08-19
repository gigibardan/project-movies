'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ChevronRight } from 'lucide-react';
import { getWatchlist, type WatchlistItem } from '@/lib/watchlist';

export default function WatchlistRow() {
  const [items, setItems] = useState<WatchlistItem[]>([]);

  const refresh = useCallback(() => {
    setItems(getWatchlist().slice(0, 20));
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener('watchlist-update', refresh);
    return () => window.removeEventListener('watchlist-update', refresh);
  }, [refresh]);

  if (items.length === 0) return null;

  return (
    <section className="relative">
      <div className="mb-3 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500 fill-red-500" />
          <h2 className="text-lg font-bold text-white sm:text-xl">My Watchlist</h2>
        </div>
        <Link href="/watchlist" className="flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-red-500">
          See all <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto scroll-smooth px-4 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:gap-4 sm:px-6 lg:px-8">
        {items.map((item) => {
          const poster = item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : null;
          const href = item.type === 'movie' ? `/movie/${item.id}` : `/tv/${item.id}`;
          return (
            <Link key={`${item.type}-${item.id}`} href={href} className="group w-[140px] shrink-0 sm:w-[170px] lg:w-[190px]">
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-zinc-900 shadow-md transition-all group-hover:shadow-xl">
                {poster ? (
                  <Image src={poster} alt={item.title} fill sizes="190px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-zinc-600">No image</div>
                )}
              </div>
              <h3 className="mt-2 line-clamp-1 text-sm font-medium text-zinc-200 group-hover:text-white">{item.title}</h3>
              <p className="text-xs text-zinc-500">{item.year}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}