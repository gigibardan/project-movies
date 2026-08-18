import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Star, Clock, Calendar, ArrowLeft, Globe, Ticket } from 'lucide-react';
import { getMovieDetails, IMG, getDirectors, topCast, ratingColor } from '@/lib/tmdb';
import { cn } from '@/lib/utils';
import MediaCard from '@/components/MediaCard';
import TrailerSection from '@/components/TrailerSection';
import { isMovieAvailable } from '@/lib/filesun';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const movie = await getMovieDetails(params.id);
    return {
      title: `${movie.title} — CineStream`,
      description: movie.overview?.slice(0, 160),
    };
  } catch {
    return { title: 'Movie — CineStream' };
  }
}

export default async function MovieDetailPage({ params }: { params: { id: string } }) {
  let movie;
  try {
    movie = await getMovieDetails(params.id);
  } catch {
    notFound();
  }

  const backdrop = IMG.backdrop(movie.backdrop_path, 'original');
  const poster = IMG.poster(movie.poster_path, 'w500');
  const directors = getDirectors(movie.credits?.crew || []);
  const cast = topCast(movie.credits?.cast || [], 12);
  const trailer = movie.videos?.results || [];
  const similar = movie.similar?.results?.filter((m) => m.poster_path).slice(0, 12) || [];
  const recommendations = movie.recommendations?.results?.filter((m) => m.poster_path).slice(0, 12) || [];
  const available = await isMovieAvailable(movie.imdb_id);

  return (
    <div className="min-h-screen">
      {/* Backdrop */}
      <div className="relative h-[55vh] min-h-[400px] w-full">
        {backdrop && (
          <Image src={backdrop} alt={movie.title} fill priority sizes="100vw" className="object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 to-transparent" />
      </div>

      <div className="relative z-10 -mt-48 mx-auto max-w-7xl px-4 sm:-mt-56 sm:px-6 lg:px-8">
        <Link
          href="/movies"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Movies
        </Link>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-[300px_1fr]">
          {/* Poster */}
          <div className="mx-auto w-full max-w-[300px] md:mx-0">
            <div className="relative aspect-[2/3] overflow-hidden rounded-xl shadow-2xl shadow-black/50">
              {poster ? (
                <Image src={poster} alt={movie.title} fill sizes="300px" className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-zinc-900 text-zinc-600">No poster</div>
              )}
            </div>
          </div>

          {/* Details */}
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {movie.title}
              {movie.release_date && (
                <span className="ml-3 text-2xl font-normal text-zinc-400">({movie.release_date.slice(0, 4)})</span>
              )}
            </h1>

            {movie.tagline && <p className="mt-2 text-lg italic text-zinc-400">&ldquo;{movie.tagline}&rdquo;</p>}

            {/* Quick facts */}
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className={cn('font-bold', ratingColor(movie.vote_average))}>
                  {movie.vote_average?.toFixed(1)}
                </span>
                <span className="text-zinc-500">({movie.vote_count?.toLocaleString()})</span>
              </span>
              {movie.runtime && (
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <Clock className="h-4 w-4 text-zinc-500" />
                  {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                </span>
              )}
              {movie.release_date && (
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <Calendar className="h-4 w-4 text-zinc-500" />
                  {new Date(movie.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              )}
              {movie.status && (
                <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-medium text-zinc-300">
                  {movie.status}
                </span>
              )}
            </div>

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {movie.genres.map((g) => (
                  <Link
                    key={g.id}
                    href={`/movies?genre=${g.id}`}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300 transition-colors hover:border-red-500/40 hover:text-red-400"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Overview */}
            {movie.overview && (
              <div className="mt-6">
                <h2 className="mb-2 text-lg font-bold text-white">Overview</h2>
                <p className="text-sm leading-relaxed text-zinc-300 sm:text-base">{movie.overview}</p>
              </div>
            )}

            {/* Crew */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {directors.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Director</p>
                  <p className="text-sm font-medium text-zinc-200">{directors.map((d) => d.name).join(', ')}</p>
                </div>
              )}
              {movie.spoken_languages && movie.spoken_languages.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Languages</p>
                  <p className="text-sm font-medium text-zinc-200">
                    {movie.spoken_languages.map((l) => l.english_name).join(', ')}
                  </p>
                </div>
              )}
              {movie.production_companies && movie.production_companies.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Studios</p>
                  <p className="text-sm font-medium text-zinc-200">
                    {movie.production_companies.map((c) => c.name).join(', ')}
                  </p>
                </div>
              )}
              {movie.budget != null && movie.budget > 0 ? (
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Box Office</p>
                  <p className="text-sm font-medium text-zinc-200">
                    <span><Ticket className="mr-1 inline h-3 w-3" />Budget: ${movie.budget.toLocaleString()}</span>
                    {movie.revenue != null && movie.revenue > 0 && <span className="ml-2">Revenue: ${movie.revenue.toLocaleString()}</span>}
                  </p>
                </div>
              ) : null}
            </div>

            {/* Watch button */}
            <div className="mt-6">
              {available ? (
                <Link
                  href={`/watch/movie/${params.id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/25 transition-all hover:bg-red-500 hover:shadow-red-500/30 active:scale-95"
                >
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  Watch Now
                </Link>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-zinc-400 cursor-default">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /><circle cx="12" cy="12" r="10" /></svg>
                  Coming Soon
                </span>
              )}
            </div>

            {/* External links */}
            <div className="mt-6 flex flex-wrap gap-3">
              {movie.imdb_id && (
                <a
                  href={`https://www.imdb.com/title/${movie.imdb_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-400 transition-colors hover:bg-yellow-500/20"
                >
                  <Star className="h-4 w-4 fill-current" /> IMDB
                </a>
              )}
              {movie.homepage && (
                <a
                  href={movie.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                >
                  <Globe className="h-4 w-4" /> Website
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Trailer */}
        <TrailerSection videos={trailer} title={movie.title} />

        {/* Cast */}
        {cast.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 text-xl font-bold text-white sm:text-2xl">Top Cast</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {cast.map((person) => {
                const img = IMG.profile(person.profile_path, 'w185');
                return (
                  <div key={person.id} className="text-center">
                    <div className="relative mx-auto aspect-square w-full max-w-[120px] overflow-hidden rounded-full bg-zinc-900">
                      {img ? (
                        <Image src={img} alt={person.name} fill sizes="120px" className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-zinc-600">
                          <span className="text-2xl">{person.name?.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <p className="mt-2 line-clamp-1 text-sm font-medium text-zinc-200">{person.name}</p>
                    {person.character && <p className="line-clamp-1 text-xs text-zinc-500">{person.character}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 text-xl font-bold text-white sm:text-2xl">Recommended for You</h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-6">
              {recommendations.slice(0, 6).map((m) => <MediaCard key={m.id} item={m} />)}
            </div>
          </div>
        )}

        {/* Similar */}
        {similar.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 text-xl font-bold text-white sm:text-2xl">More Like This</h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-6">
              {similar.slice(0, 6).map((m) => <MediaCard key={m.id} item={m} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

