'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAvailableMovieIds, getAvailableTVIds } from '@/lib/filesun';

interface WatchButtonProps {
  type: 'movie' | 'tv';
  tmdbId: string;
  label?: string;
  watchHref: string;
}

export default function WatchButton({ type, tmdbId, label, watchHref }: WatchButtonProps) {
  const [status, setStatus] = useState<'loading' | 'available' | 'unavailable'>('loading');

  useEffect(() => {
    const check = type === 'movie' ? getAvailableMovieIds : getAvailableTVIds;
    check().then((set) => setStatus(set.has(Number(tmdbId)) ? 'available' : 'unavailable'));
  }, [type, tmdbId]);

  if (status === 'loading') {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-zinc-500 cursor-default animate-pulse">
        Checking...
      </span>
    );
  }

  if (status === 'available') {
    return (
      <Link
        href={watchHref}
        className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/25 transition-all hover:bg-red-500 hover:shadow-red-500/30 active:scale-95"
      >
        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
        {label || 'Watch Now'}
      </Link>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-zinc-400 cursor-default">
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
        <circle cx="12" cy="12" r="10" />
      </svg>
      Coming Soon
    </span>
  );
}