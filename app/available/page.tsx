import type { Metadata } from 'next';
import AvailableBrowser from '@/components/AvailableBrowser';

export const metadata: Metadata = {
  title: 'Available to Watch — CineStream',
  description: 'Browse all movies and TV shows available to stream.',
};

export default function AvailablePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-24 pb-12 sm:px-6 lg:px-8">
      <AvailableBrowser />
    </div>
  );
}