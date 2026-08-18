'use client';

import { useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MediaCard from './MediaCard';
import type { Movie, TVShow } from '@/lib/tmdb-types';
import { cn } from '@/lib/utils';

type MediaItem = (Movie | TVShow) & { media_type?: string };

interface ContentRowProps {
  title: string;
  items: MediaItem[];
  seeAllHref?: string;
}

export default function ContentRow({ title, items, seeAllHref }: ContentRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  }, []);

  if (!items?.length) return null;

  return (
    <section className="group/row relative">
      <div className="mb-3 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <h2 className="text-lg font-bold text-white sm:text-xl">{title}</h2>
        {seeAllHref && (
          <a
            href={seeAllHref}
            className="text-xs font-medium text-zinc-400 transition-colors hover:text-red-500"
          >
            See all →
          </a>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 z-20 hidden h-full w-12 items-center justify-center bg-gradient-to-r from-black/80 to-transparent text-white opacity-0 transition-opacity hover:from-black/90 group-hover/row:opacity-100 md:flex"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scroll-smooth px-4 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:gap-4 sm:px-6 lg:px-8"
        >
          {items.map((item) => (
            <div
              key={`${item.id}-${item.media_type ?? ''}`}
              className={cn('w-[140px] shrink-0 sm:w-[170px] lg:w-[190px]')}
            >
              <MediaCard item={item} />
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 z-20 hidden h-full w-12 items-center justify-center bg-gradient-to-l from-black/80 to-transparent text-white opacity-0 transition-opacity hover:from-black/90 group-hover/row:opacity-100 md:flex"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      </div>
    </section>
  );
}
