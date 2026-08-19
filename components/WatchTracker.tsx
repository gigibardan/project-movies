'use client';

import { useEffect } from 'react';
import { addToHistory } from '@/lib/watch-history';

interface WatchTrackerProps {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  season?: number;
  episode?: number;
  episodeTitle?: string;
}

export default function WatchTracker(props: WatchTrackerProps) {
  useEffect(() => {
    addToHistory({
      ...props,
      timestamp: Date.now(),
    });
  }, [props.id, props.type, props.season, props.episode]);

  return null;
}