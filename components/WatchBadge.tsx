'use client';

import { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import { getAvailableMovieIds, getAvailableTVIds } from '@/lib/filesun';

interface WatchBadgeProps {
  tmdbId: number;
  type: 'movie' | 'tv';
}

export default function WatchBadge({ tmdbId, type }: WatchBadgeProps) {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    const check = type === 'movie' ? getAvailableMovieIds : getAvailableTVIds;
    check().then((set) => setAvailable(set.has(tmdbId)));
  }, [tmdbId, type]);

  if (!available) return null;

  return (
    <span className="absolute bottom-2 left-2 z-10 flex items-center gap-1.5 rounded-full bg-red-600/90 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-black/30 backdrop-blur-sm">
      <Play className="h-3 w-3 fill-current" />
      Play
    </span>
  );
}