import type { Metadata } from 'next';
import WatchlistGrid from '@/components/WatchlistGrid';

export const metadata: Metadata = {
  title: 'My Watchlist — CineStream',
  description: 'Your saved movies and TV shows.',
};

export default function WatchlistPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-24 pb-12 sm:px-6 lg:px-8">
      <WatchlistGrid />
    </div>
  );
}