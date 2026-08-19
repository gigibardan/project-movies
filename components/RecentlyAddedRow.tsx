'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Play, Star } from 'lucide-react';

interface RecentItem {
  id: number;
  t: string;
  p: string | null;
  y: string;
  r: number;
}

export default function RecentlyAddedRow() {
  const [movies, setMovies] = useState<RecentItem[]>([]);
  const [tvShows, setTvShows] = useState<RecentItem[]>([]);

  useEffect(() => {
    fetch('/data/filesun-recent.json')
      .then((r) => r.json())
      .then((d) => {
        setMovies(d.newMovies || []);
        setTvShows(d.newTV || []);
      })
      .catch(() => {});
  }, []);

  const items = [...movies.map((m) => ({ ...m, type: 'movie' as const })), ...tvShows.map((t) => ({ ...t, type: 'tv' as const }))];

  if (items.length === 0) return null;

  return (
    <section className="relative">
      <div className="mb-3 flex items-center gap-2 px-4 sm:px-6 lg:px-8">
        <Sparkles className="h-5 w-5 text-yellow-400" />
        <h2 className="text-lg font-bold text-white sm:text-xl">Recently Added</h2>
        <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-400">New</span>
      </div>

      <div className="flex gap-3 overflow-x-auto scroll-smooth px-4 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:gap-4 sm:px-6 lg:px-8">
        {items.slice(0, 20).map((item) => {
          const poster = item.p ? `https://image.tmdb.org/t/p/w342${item.p}` : null;
          const href = item.type === 'movie' ? `/movie/${item.id}` : `/tv/${item.id}`;
          const watchHref = item.type === 'movie' ? `/watch/movie/${item.id}` : `/watch/tv/${item.id}/1/1`;

          return (
            <div key={`${item.type}-${item.id}`} className="group w-[140px] shrink-0 sm:w-[170px] lg:w-[190px]">
              <Link href={href} className="block">
                <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-zinc-900 shadow-md transition-all group-hover:shadow-xl group-hover:shadow-yellow-500/10">
                  {poster ? (
                    <Image src={poster} alt={item.t} fill sizes="190px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-zinc-600">No image</div>
                  )}

                  {item.r > 0 && (
                    <div className="absolute right-2 top-2 flex items-center gap-0.5 rounded bg-black/70 px-1.5 py-0.5 backdrop-blur-sm">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-bold text-white">{item.r}</span>
                    </div>
                  )}

                  <div className="absolute left-2 top-2 rounded bg-yellow-500/90 px-1.5 py-0.5 text-[10px] font-bold text-black">
                    NEW
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
                    <Play className="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100" fill="currentColor" />
                  </div>
                </div>
              </Link>
              <h3 className="mt-2 line-clamp-1 text-sm font-medium text-zinc-200 group-hover:text-white">{item.t}</h3>
              <p className="text-xs text-zinc-500">{item.y}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}