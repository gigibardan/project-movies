'use client';

import { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import { getAvailableTVIds } from '@/lib/filesun';

interface WatchBadgeProps {
  tmdbId: number;
}

export default function WatchBadge({ tmdbId }: WatchBadgeProps) {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    getAvailableTVIds().then((set) => setAvailable(set.has(tmdbId)));
  }, [tmdbId]);

  if (!available) return null;

  return (
    <span className="absolute bottom-2 left-2 z-10 flex items-center gap-1.5 rounded-full bg-red-600/90 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-black/30 backdrop-blur-sm">
      <Play className="h-3 w-3 fill-current" />
      Available
    </span>
  );
}