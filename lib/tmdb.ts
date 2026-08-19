import type { Movie, TVShow, MediaType, TMDBResponse, Genre, Video, SeasonDetails, Credit, Review } from './tmdb-types';

const BASE_URL = 'https://api.themoviedb.org/3';

function getApiKey(): string {
  return process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY || '';
}

export const IMG = {
  poster: (path: string | null, size: 'w185' | 'w342' | 'w500' | 'original' = 'w342') =>
    path ? `https://image.tmdb.org/t/p/${size}${path}` : null,
  backdrop: (path: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280') =>
    path ? `https://image.tmdb.org/t/p/${size}${path}` : null,
  profile: (path: string | null, size: 'w185' | 'h632' = 'w185') =>
    path ? `https://image.tmdb.org/t/p/${size}${path}` : null,
};

async function tmdbFetch<T>(endpoint: string, params: Record<string, string | number | boolean> = {}): Promise<T> {
  const API_KEY = getApiKey();
  if (!API_KEY) throw new Error('TMDB_API_KEY is not configured');
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', API_KEY);
  url.searchParams.set('language', 'en-US');
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error(`TMDB ${res.status}: ${endpoint}`);
  }
  return res.json() as Promise<T>;
}

export async function getTrending(window: 'day' | 'week' = 'week', type: 'all' | 'movie' | 'tv' = 'all') {
  return tmdbFetch<TMDBResponse<Movie & TVShow>>(`/trending/${type}/${window}`);
}

export async function getMoviesByCategory(category: string, page = 1) {
  return tmdbFetch<TMDBResponse<Movie>>(`/movie/${category}`, { page });
}

export async function getTVByCategory(category: string, page = 1) {
  return tmdbFetch<TMDBResponse<TVShow>>(`/tv/${category}`, { page });
}

export async function getMovieDetails(id: string) {
  const data = await tmdbFetch<Movie & { videos: { results: Video[] }; credits: { cast: Credit[]; crew: Credit[] }; similar: TMDBResponse<Movie>; recommendations: TMDBResponse<Movie>; reviews: { results: Review[] } }>(
    `/movie/${id}`,
    { append_to_response: 'videos,credits,similar,recommendations,reviews' }
  );
  return data;
}

export async function getTVDetails(id: string) {
  const data = await tmdbFetch<TVShow & { videos: { results: Video[] }; credits: { cast: Credit[]; crew: Credit[] }; similar: TMDBResponse<TVShow>; recommendations: TMDBResponse<TVShow>; reviews: { results: Review[] } }>(
    `/tv/${id}`,
    { append_to_response: 'videos,credits,similar,recommendations,reviews' }
  );
  return data;
}

export async function getSeasonDetails(tvId: string, seasonNumber: number) {
  return tmdbFetch<SeasonDetails>(`/tv/${tvId}/season/${seasonNumber}`);
}

export async function getMovieGenres() {
  const data = await tmdbFetch<{ genres: Genre[] }>(`/genre/movie/list`);
  return data.genres;
}

export async function getTVGenres() {
  const data = await tmdbFetch<{ genres: Genre[] }>(`/genre/tv/list`);
  return data.genres;
}

export async function discoverMovies(params: { with_genres?: string; sort_by?: string; page?: number; 'primary_release_date.gte'?: string; 'primary_release_date.lte'?: string; 'vote_count.gte'?: number } = {}) {
  return tmdbFetch<TMDBResponse<Movie>>(`/discover/movie`, params as Record<string, string | number>);
}

export async function discoverTV(params: { with_genres?: string; sort_by?: string; page?: number; 'first_air_date.gte'?: string; 'first_air_date.lte'?: string; 'vote_count.gte'?: number } = {}) {
  return tmdbFetch<TMDBResponse<TVShow>>(`/discover/tv`, params as Record<string, string | number>);
}

export async function searchMulti(query: string, page = 1) {
  return tmdbFetch<TMDBResponse<Movie & TVShow & { media_type: MediaType }>>(`/search/multi`, { query, page, include_adult: false });
}

export function getTrailer(videos: Video[]): Video | null {
  if (!videos?.length) return null;
  const trailers = videos.filter((v) => v.type === 'Trailer' && v.site === 'YouTube');
  return trailers.find((v) => v.official) || trailers[0] || videos.find((v) => v.site === 'YouTube') || null;
}

export function getDirectors(crew: Credit[]): Credit[] {
  return crew?.filter((c) => c.job === 'Director') || [];
}

export function getCreators(crew: Credit[]): Credit[] {
  return crew?.filter((c) => c.job === 'Creator') || [];
}

export function topCast(cast: Credit[], n = 10): Credit[] {
  return (cast || []).slice(0, n);
}

export async function getClassics() {
  return discoverMovies({
    sort_by: 'vote_average.desc',
    'vote_count.gte': 5000,
    'primary_release_date.lte': '2000-12-31',
    page: 1,
  });
}

export async function getBestOfYear(year: number) {
  return discoverMovies({
    sort_by: 'vote_average.desc',
    'vote_count.gte': 50,
    'primary_release_date.gte': `${year}-01-01`,
    'primary_release_date.lte': `${year}-12-31`,
    page: 1,
  });
}

export async function getHiddenGems() {
  return discoverMovies({
    sort_by: 'vote_average.desc',
    'vote_count.gte': 500,
    page: 1,
  });
}

export async function getMoviesByGenre(genreId: number) {
  return discoverMovies({
    with_genres: String(genreId),
    sort_by: 'popularity.desc',
    'vote_count.gte': 100,
    page: 1,
  });
}

export async function getTVByGenre(genreId: number) {
  return discoverTV({
    with_genres: String(genreId),
    sort_by: 'popularity.desc',
    'vote_count.gte': 50,
    page: 1,
  });
}

export async function getUpcoming() {
  return getMoviesByCategory('upcoming');
}

export function ratingColor(rating: number): string {
  if (rating >= 7.5) return 'text-emerald-400';
  if (rating >= 6) return 'text-yellow-400';
  if (rating > 0) return 'text-orange-400';
  return 'text-zinc-400';
}
