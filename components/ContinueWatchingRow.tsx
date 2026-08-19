'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, History } from 'lucide-react';
import { getContinueWatching, type WatchHistoryItem } from '@/lib/watch-history';

export default function ContinueWatchingRow() {
  const [items, setItems] = useState<WatchHistoryItem[]>([]);

  const refresh = useCallback(() => {
    setItems(getContinueWatching().slice(0, 15));
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener('history-update', refresh);
    return () => window.removeEventListener('history-update', refresh);
  }, [refresh]);

  if (items.length === 0) return null;

  return (
    <section className="relative">
      <div className="mb-3 flex items-center gap-2 px-4 sm:px-6 lg:px-8">
        <History className="h-5 w-5 text-red-500" />
        <h2 className="text-lg font-bold text-white sm:text-xl">Continue Watching</h2>
      </div>

      <div className="flex gap-3 overflow-x-auto scroll-smooth px-4 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:gap-4 sm:px-6 lg:px-8">
        {items.map((item) => {
          const poster = item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : null;
          const nextEp = (item.episode || 0) + 1;
          const watchHref = `/watch/tv/${item.id}/${item.season || 1}/${nextEp}`;
          const detailHref = `/tv/${item.id}`;

          return (
            <div key={`cw-${item.id}`} className="group w-[180px] shrink-0 sm:w-[210px]">
              <Link href={watchHref} className="block">
                <div className="relative aspect-video overflow-hidden rounded-lg bg-zinc-900 shadow-md transition-all group-hover:shadow-xl">
                  {poster ? (
                    <Image src={poster} alt={item.title} fill sizes="210px" className="object-cover brightness-75 transition-all group-hover:brightness-100 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-zinc-600">No image</div>
                  )}

                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600/90 shadow-lg transition-transform group-hover:scale-110">
                      <Play className="h-5 w-5 text-white" fill="currentColor" />
                    </div>
                  </div>

                  {/* Episode badge */}
                  <div className="absolute bottom-2 left-2 rounded bg-black/80 px-2 py-0.5 text-xs font-bold text-white backdrop-blur-sm">
                    S{item.season || 1} E{nextEp}
                  </div>
                </div>
              </Link>
              <Link href={detailHref}>
                <h3 className="mt-2 line-clamp-1 text-sm font-medium text-zinc-200 group-hover:text-white">{item.title}</h3>
              </Link>
              <p className="text-xs text-zinc-500">Next: Episode {nextEp}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}