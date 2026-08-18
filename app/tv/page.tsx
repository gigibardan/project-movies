import { getTVByCategory, getTVGenres, discoverTV } from '@/lib/tmdb';
import MediaGrid from '@/components/MediaGrid';
import { Tv } from 'lucide-react';
import type { Metadata } from 'next';


export const revalidate = 3600;

interface TVPageProps {
  searchParams: { page?: string; category?: string; genre?: string };
}

export const metadata: Metadata = { title: 'TV Shows — CineStream', description: 'Browse and discover TV shows.' };

const CATEGORIES = [
  { key: 'popular', label: 'Popular' },
  { key: 'top_rated', label: 'Top Rated' },
  { key: 'on_the_air', label: 'On Air' },
  { key: 'airing_today', label: 'Airing Today' },
];

export default async function TVPage({ searchParams }: TVPageProps) {
  const page = Math.max(1, Math.min(500, Number(searchParams.page) || 1));
  const category = searchParams.category || 'popular';
  const genreId = searchParams.genre;

  const genres = await getTVGenres();
  
  const selectedGenre = genres.find((g) => String(g.id) === genreId);

  const data = genreId
    ? await discoverTV({ with_genres: genreId, sort_by: 'popularity.desc', page, 'vote_count.gte': 20 })
    : await getTVByCategory(CATEGORIES.find((c) => c.key === category)?.key || 'popular', page);

   const items = data.results
    .filter((m) => m.poster_path)
    .map((m) => ({ ...m, media_type: 'tv' as const }));

  const basePath = (() => {
    const sp = new URLSearchParams();
    if (category) sp.set('category', category);
    if (genreId) sp.set('genre', genreId);
    return `/tv?${sp.toString()}`;
  })();

  return (
    <div className="mx-auto max-w-7xl px-4 pt-24 pb-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-3">
        <Tv className="h-7 w-7 text-red-500" />
        <h1 className="text-2xl font-bold text-white sm:text-3xl">TV Shows</h1>
      </div>

      <div className="mb-8 space-y-3">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const active = !genreId && category === c.key;
            return (
              <a
                key={c.key}
                href={`/tv?category=${c.key}`}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${active ? 'bg-red-600 text-white' : 'border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white'
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
                href={`/tv?genre=${g.id}`}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${active ? 'bg-red-600 text-white' : 'border border-white/5 bg-transparent text-zinc-500 hover:text-zinc-200'
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
        emptyMessage="No TV shows found for this filter."
      />
    </div>
  );
}
