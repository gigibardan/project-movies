'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Star, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Movie, TVShow } from '@/lib/tmdb-types';
import { IMG, ratingColor } from '@/lib/tmdb';
import { cn } from '@/lib/utils';

type MediaItem = (Movie | TVShow) & { media_type?: string };

interface HeroCarouselProps {
  items: MediaItem[];
}

export default function HeroCarousel({ items }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setIndex((i) => (i + 1) % items.length), [items.length]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + items.length) % items.length), [items.length]);

  useEffect(() => {
    if (paused || items.length <= 1) return;
    const t = setInterval(next, 8000);
    return () => clearInterval(t);
  }, [paused, next, items.length]);

  if (!items.length) return null;

  return (
    <section
      className="relative h-[78vh] min-h-[520px] w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {items.map((item, i) => {
        const isTV = item.media_type === 'tv' || ('name' in item && !('title' in item));
        const title = isTV ? (item as TVShow).name : (item as Movie).title;
        const date = isTV ? (item as TVShow).first_air_date : (item as Movie).release_date;
        const year = date ? date.slice(0, 4) : '';
        const href = isTV ? `/tv/${item.id}` : `/movie/${item.id}`;
        const backdrop = IMG.backdrop(item.backdrop_path, 'original');

        return (
          <div
            key={item.id}
            className={cn(
              'absolute inset-0 transition-opacity duration-1000',
              i === index ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}
          >
            {backdrop && (
              <Image
                src={backdrop}
                alt={title}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-zinc-950/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/40 to-transparent" />

            <div className="relative z-10 flex h-full items-end pb-16 sm:items-center sm:pb-0">
              <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl">
                  <div className="mb-3 flex items-center gap-3">
                    <span className={cn('flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 backdrop-blur-sm')}>
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span className={cn('text-sm font-bold', ratingColor(item.vote_average))}>
                        {item.vote_average?.toFixed(1)}
                      </span>
                    </span>
                    {year && <span className="text-sm font-medium text-zinc-300">{year}</span>}
                    <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-red-400">
                      {isTV ? 'TV' : 'Movie'}
                    </span>
                  </div>

                  <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
                    {title}
                  </h1>

                  <p className="mb-6 line-clamp-3 max-w-xl text-sm leading-relaxed text-zinc-300 sm:text-base">
                    {item.overview}
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={href}
                      className="flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/30 transition-all hover:bg-red-500 hover:shadow-red-500/40 active:scale-95"
                    >
                      <Play className="h-5 w-5 fill-current" />
                      View Details
                    </Link>
                    <Link
                      href={href}
                      className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95"
                    >
                      <Info className="h-5 w-5" />
                      More Info
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {items.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/70"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/70"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === index ? 'w-8 bg-red-500' : 'w-2 bg-white/40 hover:bg-white/70'
                )}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
