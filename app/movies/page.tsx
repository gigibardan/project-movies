import { getMoviesByCategory, getMovieGenres, discoverMovies } from '@/lib/tmdb';
import MediaGrid from '@/components/MediaGrid';
import { Film } from 'lucide-react';
import type { Metadata } from 'next';

export const revalidate = 3600;

interface MoviesPageProps {
  searchParams: { page?: string; category?: string; genre?: string };
}

export const metadata: Metadata = { title: 'Movies — CineStream', description: 'Browse and discover movies.' };

const CATEGORIES = [
  { key: 'popular', label: 'Popular' },
  { key: 'top_rated', label: 'Top Rated' },
  { key: 'now_playing', label: 'Now Playing' },
  { key: 'upcoming', label: 'Upcoming' },
];

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  const page = Math.max(1, Math.min(500, Number(searchParams.page) || 1));
  const category = searchParams.category || 'popular';
  const genreId = searchParams.genre;

  const genres = await getMovieGenres();
  const selectedGenre = genres.find((g) => String(g.id) === genreId);

  const data = genreId
    ? await discoverMovies({ with_genres: genreId, sort_by: 'popularity.desc', page, 'vote_count.gte': 50 })
    : await getMoviesByCategory(CATEGORIES.find((c) => c.key === category)?.key || 'popular', page);

  const items = data.results.filter((m) => m.poster_path);

  const basePath = (() => {
    const sp = new URLSearchParams();
    if (category) sp.set('category', category);
    if (genreId) sp.set('genre', genreId);
    return `/movies?${sp.toString()}`;
  })();

  return (
    <div className="mx-auto max-w-7xl px-4 pt-24 pb-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-3">
        <Film className="h-7 w-7 text-red-500" />
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Movies</h1>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-3">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const active = !genreId && category === c.key;
            return (
              <a
                key={c.key}
                href={`/movies?category=${c.key}`}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-red-600 text-white'
                    : 'border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {c.label}
              </a>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2">
          {genres.slice(0, 14).map((g) => {
            const active = genreId === String(g.id);
            return (
              <a
                key={g.id}
                href={`/movies?genre=${g.id}`}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-red-600 text-white'
                    : 'border border-white/5 bg-transparent text-zinc-500 hover:text-zinc-200'
                }`}
              >
                {g.name}
              </a>
            );
          })}
        </div>
      </div>

      {selectedGenre && <p className="mb-4 text-sm text-zinc-400">Showing: <span className="font-semibold text-white">{selectedGenre.name}</span></p>}

      <MediaGrid
        items={items}
        currentPage={page}
        totalPages={Math.min(data.total_pages, 500)}
        basePath={basePath}
        emptyMessage="No movies found for this filter."
      />
    </div>
  );
}
