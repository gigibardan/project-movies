'use client';

import { useState, useEffect, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { isInWatchlist, toggleWatchlist } from '@/lib/watchlist';
import { cn } from '@/lib/utils';

interface WatchlistButtonProps {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  vote_average: number;
  year: string;
  variant?: 'icon' | 'button';
}

export default function WatchlistButton({
  id, type, title, poster_path, vote_average, year, variant = 'button',
}: WatchlistButtonProps) {
  const [inList, setInList] = useState(false);

  const check = useCallback(() => {
    setInList(isInWatchlist(id, type));
  }, [id, type]);

  useEffect(() => {
    check();
    window.addEventListener('watchlist-update', check);
    return () => window.removeEventListener('watchlist-update', check);
  }, [check]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist({ id, type, title, poster_path, vote_average, year });
    check();
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          'absolute left-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-all',
          inList
            ? 'bg-red-600/90 text-white'
            : 'bg-black/50 text-white/70 opacity-0 group-hover:opacity-100 hover:bg-black/70 hover:text-white'
        )}
        aria-label={inList ? 'Remove from watchlist' : 'Add to watchlist'}
      >
        <Heart className={cn('h-4 w-4', inList && 'fill-current')} />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all active:scale-95',
        inList
          ? 'bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30'
          : 'bg-white/10 text-white border border-white/10 hover:bg-white/20'
      )}
    >
      <Heart className={cn('h-4 w-4', inList && 'fill-current')} />
      {inList ? 'In Watchlist' : 'Add to Watchlist'}
    </button>
  );
}