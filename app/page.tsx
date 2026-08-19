import HeroCarousel from '@/components/HeroCarousel';
import ContentRow from '@/components/ContentRow';
import ContinueWatchingRow from '@/components/ContinueWatchingRow';
import WatchlistRow from '@/components/WatchlistRow';
import RecentlyAddedRow from '@/components/RecentlyAddedRow';
import {
  getTrending,
  getMoviesByCategory,
  getTVByCategory,
  getClassics,
  getBestOfYear,
  getHiddenGems,
  getMoviesByGenre,
  getTVByGenre,
  getUpcoming,
} from '@/lib/tmdb';

export const revalidate = 3600;

// TMDB genre IDs
const ACTION = 28;
const COMEDY = 35;
const SCIFI = 878;
const HORROR = 27;
const ANIMATION = 16;
const DOCUMENTARY = 99;
const CRIME_TV = 80;
const SCIFI_FANTASY_TV = 10765;

export default async function HomePage() {
  const [
    trending,
    popularMovies,
    topRatedMovies,
    nowPlaying,
    popularTV,
    topRatedTV,
    upcoming,
    classics,
    bestOf2025,
    bestOf2026,
    hiddenGems,
    actionMovies,
    comedyMovies,
    scifiMovies,
    horrorMovies,
    animationMovies,
    documentaries,
    crimeTV,
    scifiFantasyTV,
  ] = await Promise.all([
    getTrending('week', 'all'),
    getMoviesByCategory('popular'),
    getMoviesByCategory('top_rated'),
    getMoviesByCategory('now_playing'),
    getTVByCategory('popular'),
    getTVByCategory('top_rated'),
    getUpcoming(),
    getClassics(),
    getBestOfYear(2025),
    getBestOfYear(2026),
    getHiddenGems(),
    getMoviesByGenre(ACTION),
    getMoviesByGenre(COMEDY),
    getMoviesByGenre(SCIFI),
    getMoviesByGenre(HORROR),
    getMoviesByGenre(ANIMATION),
    getMoviesByGenre(DOCUMENTARY),
    getTVByGenre(CRIME_TV),
    getTVByGenre(SCIFI_FANTASY_TV),
  ]);

  const heroes = trending.results
    .filter((item) => item.backdrop_path && item.overview)
    .slice(0, 8);

  return (
    <div className="pb-16">
      <HeroCarousel items={heroes} />

      <div className="relative z-10 -mt-20 space-y-10 sm:-mt-24">
        {/* Personal rows */}
        <ContinueWatchingRow />
        <WatchlistRow />
        <RecentlyAddedRow />

        {/* Main rows */}
        <ContentRow title="Trending This Week" items={trending.results.slice(0, 18)} seeAllHref="/trending" />
        <ContentRow title="Popular Movies" items={popularMovies.results} seeAllHref="/movies" />
        <ContentRow title="Popular TV Shows" items={popularTV.results.map((m) => ({ ...m, media_type: 'tv' }))} seeAllHref="/tv" />

        {/* Now & Upcoming */}
        <ContentRow title="Now Playing in Theaters" items={nowPlaying.results} seeAllHref="/movies?category=now_playing" />
        <ContentRow title="Coming Soon" items={upcoming.results} seeAllHref="/movies?category=upcoming" />

        {/* Best of years */}
        <ContentRow title="Best of 2026" items={bestOf2026.results} seeAllHref="/movies?category=top_rated" />
        <ContentRow title="Best of 2025" items={bestOf2025.results} seeAllHref="/movies?category=top_rated" />

        {/* Curated */}
        <ContentRow title="Hidden Gems" items={hiddenGems.results} seeAllHref="/movies?category=top_rated" />
        <ContentRow title="Timeless Classics" items={classics.results} seeAllHref="/movies?category=top_rated" />

        {/* Movie genres */}
        <ContentRow title="Action & Adventure" items={actionMovies.results} seeAllHref="/movies?genre=28" />
        <ContentRow title="Comedy" items={comedyMovies.results} seeAllHref="/movies?genre=35" />
        <ContentRow title="Sci-Fi" items={scifiMovies.results} seeAllHref="/movies?genre=878" />
        <ContentRow title="Horror & Thriller" items={horrorMovies.results} seeAllHref="/movies?genre=27" />
        <ContentRow title="Animation" items={animationMovies.results} seeAllHref="/movies?genre=16" />
        <ContentRow title="Documentaries" items={documentaries.results} seeAllHref="/movies?genre=99" />

        {/* TV genres */}
        <ContentRow title="Crime TV" items={crimeTV.results.map((m) => ({ ...m, media_type: 'tv' }))} seeAllHref="/tv?genre=80" />
        <ContentRow title="Sci-Fi & Fantasy TV" items={scifiFantasyTV.results.map((m) => ({ ...m, media_type: 'tv' }))} seeAllHref="/tv?genre=10765" />

        {/* Top rated */}
        <ContentRow title="Top Rated Movies" items={topRatedMovies.results} seeAllHref="/movies?category=top_rated" />
        <ContentRow title="Top Rated TV Shows" items={topRatedTV.results.map((m) => ({ ...m, media_type: 'tv' }))} seeAllHref="/tv?category=top_rated" />
      </div>
    </div>
  );
}