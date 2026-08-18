'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import type { Video } from '@/lib/tmdb-types';
import { getTrailer } from '@/lib/tmdb';
import { cn } from '@/lib/utils';

interface TrailerSectionProps {
  videos: Video[];
  title: string;
}

export default function TrailerSection({ videos, title }: TrailerSectionProps) {
  const [open, setOpen] = useState(false);
  const trailer = getTrailer(videos);

  if (!trailer) return null;

  return (
    <div className="mt-10">
      <h2 className="mb-4 text-xl font-bold text-white sm:text-2xl">Trailer</h2>
      
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="group relative aspect-video w-full max-w-3xl overflow-hidden rounded-xl bg-zinc-900 shadow-lg"
        >
          {/* Imaginea de fundal de la YouTube */}
          <img
            src={`https://img.youtube.com/vi/${trailer.key}/maxresdefault.jpg`}
            alt={`Trailer for ${title}`}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Overlay întunecat pentru contrast */}
          <div className="absolute inset-0 bg-black/40 transition-colors group-hover:bg-black/20" />

          {/* Butonul de Play centrat */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600/90 shadow-xl shadow-black/50 backdrop-blur-sm transition-all group-hover:scale-110 group-hover:bg-red-500">
              <svg className="ml-1 h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="rounded-md bg-black/60 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-md">
              Play Trailer
            </span>
          </div>
        </button>
      ) : (
        <div className="aspect-video w-full max-w-3xl overflow-hidden rounded-xl bg-black shadow-lg">
          <iframe
            src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`}
            title={`${title} trailer`}
            className="h-full w-full"
            allow="accelerated-chrome; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}