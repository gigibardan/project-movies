import { searchMulti } from '@/lib/tmdb';
import MediaGrid from '@/components/MediaGrid';
import { Search } from 'lucide-react';

export const revalidate = 300;

interface SearchPageProps {
  searchParams: { q?: string; page?: string };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const q = (searchParams.q || '').trim();
  const page = Math.max(1, Math.min(500, Number(searchParams.page) || 1));

  let results: Awaited<ReturnType<typeof searchMulti>> | null = null;
  if (q) {
    try {
      results = await searchMulti(q, page);
    } catch {
      results = null;
    }
  }

  const items = (results?.results || [])
    .filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
    .filter((r) => r.poster_path || r.backdrop_path);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-24 pb-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-3">
        <Search className="h-7 w-7 text-red-500" />
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          {q ? <>Results for &ldquo;{q}&rdquo;</> : 'Search'}
        </h1>
      </div>

      {q && results && (
        <p className="mb-6 text-sm text-zinc-500">
          {results.total_results.toLocaleString()} results found
        </p>
      )}

      {!q ? (
        <div className="flex min-h-[40vh] items-center justify-center text-zinc-500">
          <p>Start typing to search for movies and TV shows.</p>
        </div>
      ) : (
        <MediaGrid
          items={items}
          currentPage={page}
          totalPages={Math.min(results?.total_pages || 1, 500)}
          basePath={`/search?q=${encodeURIComponent(q)}`}
          emptyMessage={`No results found for "${q}".`}
        />
      )}
    </div>
  );
}