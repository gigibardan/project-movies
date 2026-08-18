import HeroCarousel from '@/components/HeroCarousel';
import ContentRow from '@/components/ContentRow';
import { getTrending, getMoviesByCategory, getTVByCategory } from '@/lib/tmdb';
import { getAvailableTVIds } from '@/lib/filesun';

export const revalidate = 3600;

export default async function HomePage() {
  const [trending, popularMovies, topRatedMovies, upcoming, popularTV, topRatedTV, tvIds] = await Promise.all([
    getTrending('week', 'all'),
    getMoviesByCategory('popular'),
    getMoviesByCategory('top_rated'),
    getMoviesByCategory('now_playing'),
    getTVByCategory('popular'),
    getTVByCategory('top_rated'),
    getAvailableTVIds(),
  ]);

  function mark<T extends { id: number; media_type?: string }>(items: T[]) {
    return items.map((item) => {
      const isTV = item.media_type === 'tv' || ('name' in item && !('title' in item));
      return isTV && tvIds.has(item.id) ? { ...item, available: true } : item;
    });
  }

  const heroes = trending.results
    .filter((item) => item.backdrop_path && item.overview)
    .slice(0, 6);

  return (
    <div className="pb-16">
      <HeroCarousel items={heroes} />

      <div className="relative z-10 -mt-20 space-y-10 sm:-mt-24">
        <ContentRow title="Trending This Week" items={mark(trending.results.slice(0, 18))} seeAllHref="/trending" />
        <ContentRow title="Popular Movies" items={mark(popularMovies.results)} seeAllHref="/movies" />
        <ContentRow title="Popular TV Shows" items={mark(popularTV.results)} seeAllHref="/tv" />
        <ContentRow title="Now Playing in Theaters" items={mark(upcoming.results)} seeAllHref="/movies?category=now_playing" />
        <ContentRow title="Top Rated Movies" items={mark(topRatedMovies.results)} seeAllHref="/movies?category=top_rated" />
        <ContentRow title="Top Rated TV Shows" items={mark(topRatedTV.results)} seeAllHref="/tv?category=top_rated" />
      </div>
    </div>
  );
}