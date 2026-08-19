import { Suspense } from 'react';
import HeroCarousel from '@/components/HeroCarousel';
import ContentRow from '@/components/ContentRow';
import ContinueWatchingRow from '@/components/ContinueWatchingRow';
import WatchlistRow from '@/components/WatchlistRow';
import RecentlyAddedRow from '@/components/RecentlyAddedRow';
import SkeletonRow from '@/components/SkeletonRow';
import { getTrending, getMoviesByCategory, getTVByCategory } from '@/lib/tmdb';

export const revalidate = 3600;

export default async function HomePage() {
  const [trending, popularMovies, topRatedMovies, upcoming, popularTV, topRatedTV] = await Promise.all([
    getTrending('week', 'all'),
    getMoviesByCategory('popular'),
    getMoviesByCategory('top_rated'),
    getMoviesByCategory('now_playing'),
    getTVByCategory('popular'),
    getTVByCategory('top_rated'),
  ]);

  const heroes = trending.results
    .filter((item) => item.backdrop_path && item.overview)
    .slice(0, 6);

  return (
    <div className="pb-16">
      <HeroCarousel items={heroes} />

      <div className="relative z-10 -mt-20 space-y-10 sm:-mt-24">
        {/* Personal rows — client-side, only show if user has data */}
        <ContinueWatchingRow />
        <WatchlistRow />

        {/* Recently added from FileSuN */}
        <RecentlyAddedRow />

        {/* TMDB rows */}
        <ContentRow title="Trending This Week" items={trending.results.slice(0, 18)} seeAllHref="/trending" />
        <ContentRow title="Popular Movies" items={popularMovies.results} seeAllHref="/movies" />
        <ContentRow title="Popular TV Shows" items={popularTV.results} seeAllHref="/tv" />
        <ContentRow title="Now Playing in Theaters" items={upcoming.results} seeAllHref="/movies?category=now_playing" />
        <ContentRow title="Top Rated Movies" items={topRatedMovies.results} seeAllHref="/movies?category=top_rated" />
        <ContentRow title="Top Rated TV Shows" items={topRatedTV.results} seeAllHref="/tv?category=top_rated" />
      </div>
    </div>
  );
}