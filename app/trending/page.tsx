import { getTrending } from '@/lib/tmdb';
import MediaGrid from '@/components/MediaGrid';
import { TrendingUp } from 'lucide-react';
import type { Metadata } from 'next';

export const revalidate = 3600;

interface TrendingPageProps {
  searchParams: { page?: string; window?: string };
}

export const metadata: Metadata = { title: 'Trending — CineStream', description: 'See what\'s trending now.' };

export default async function TrendingPage({ searchParams }: TrendingPageProps) {
  const page = Math.max(1, Math.min(500, Number(searchParams.page) || 1));
  const window = searchParams.window === 'day' ? 'day' : 'week';

  const data = await getTrending(window, 'all');

  const items = data.results
    .filter((m) => m.poster_path && (m.media_type === 'movie' || m.media_type === 'tv'))
    .map((m) => ({ ...m, media_type: m.media_type as 'movie' | 'tv' }));

  return (
    <div className="mx-auto max-w-7xl px-4 pt-24 pb-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-3">
        <TrendingUp className="h-7 w-7 text-red-500" />
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Trending</h1>
      </div>

      <div className="mb-8 flex gap-2">
        <a
          href="/trending?window=week"
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            window === 'week' ? 'bg-red-600 text-white' : 'border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'
          }`}
        >
          This Week
        </a>
        <a
          href="/trending?window=day"
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            window === 'day' ? 'bg-red-600 text-white' : 'border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'
          }`}
        >
          Today
        </a>
      </div>

      <MediaGrid
        items={items}
        currentPage={page}
        totalPages={Math.min(data.total_pages, 500)}
        basePath={`/trending?window=${window}`}
      />
    </div>
  );
}
