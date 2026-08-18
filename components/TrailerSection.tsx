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
      <h2 className="mb-4 text-xl font-bold text-white sm:text-2xl">Videos</h2>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="group relative aspect-video w-full max-w-3xl overflow-hidden rounded-xl bg-zinc-900"
        >
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600/90 transition-all group-hover:scale-110 group-hover:bg-red-500">
                <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-zinc-300">Play trailer</p>
            </div>
          </div>
        </button>
      ) : (
        <div className="aspect-video w-full max-w-3xl overflow-hidden rounded-xl bg-black">
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
