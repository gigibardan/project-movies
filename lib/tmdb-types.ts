export type MediaType = 'movie' | 'tv' | 'person';

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Movie {
  id: number;
  title: string;
  original_title?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  genres?: Genre[];
  runtime?: number;
  tagline?: string;
  status?: string;
  budget?: number;
  revenue?: number;
  production_companies?: { id: number; name: string; logo_path: string | null }[];
  spoken_languages?: { english_name: string; name: string }[];
  imdb_id?: string;
  homepage?: string;
  adult?: boolean;
  popularity?: number;
  media_type?: MediaType;
}

export interface TVShow {
  id: number;
  name: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  last_air_date?: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  genres?: Genre[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  episode_run_time?: number[];
  status?: string;
  tagline?: string;
  seasons?: Season[];
  created_by?: Credit[];
  production_companies?: { id: number; name: string; logo_path: string | null }[];
  networks?: { id: number; name: string; logo_path: string | null }[];
  spoken_languages?: { english_name: string; name: string }[];
  homepage?: string;
  popularity?: number;
  media_type?: MediaType;
  in_production?: boolean;
}

export interface Season {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  air_date: string | null;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  still_path: string | null;
  episode_number: number;
  season_number: number;
  air_date: string | null;
  runtime: number | null;
  vote_average: number;
}

export interface SeasonDetails extends Season {
  episodes: Episode[];
}

export interface Credit {
  id: number;
  name: string;
  character?: string;
  job?: string;
  department?: string;
  profile_path: string | null;
  order?: number;
  gender: number;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  published_at: string;
}

export interface Review {
  id: string;
  author: string;
  content: string;
  created_at: string;
  author_details: { rating: number | null; avatar_path: string | null };
}
