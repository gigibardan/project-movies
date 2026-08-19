// app/watch/movie/[id]/page.tsx
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getMovieDetails } from '@/lib/tmdb';
import WatchTracker from '@/components/WatchTracker';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const movie = await getMovieDetails(params.id);
    return { title: `Watch ${movie.title} — CineStream` };
  } catch {
    return { title: 'Watch — CineStream' };
  }
}

export default async function WatchMoviePage({ params }: { params: { id: string } }) {
  let movie;
  try {
    movie = await getMovieDetails(params.id);
  } catch {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-400">Movie not found.</p>
      </div>
    );
  }

  // Use imdb_id for FileSuN embed, fallback to TMDB id
  const embedId = movie.imdb_id || params.id;

  return (
    <div className="min-h-screen bg-black pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 py-4">
          <Link
            href={`/movie/${params.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/20 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to details
          </Link>
          <h1 className="line-clamp-1 text-lg font-bold text-white sm:text-xl">
            {movie.title}
            {movie.release_date && (
              <span className="ml-2 font-normal text-zinc-500">({movie.release_date.slice(0, 4)})</span>
            )}
          </h1>
        </div>

        {/* Player */}
        <div className="relative w-full overflow-hidden rounded-xl bg-zinc-900" style={{ paddingTop: '56.25%' }}>
          <iframe
            src={`https://filesun.sbs/embed/movie/${embedId}?autoplay=0`}
            className="absolute inset-0 h-full w-full border-0"
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="no-referrer"
          />
        </div>

        <WatchTracker
          id={Number(params.id)}
          type="movie"
          title={movie.title}
          poster_path={movie.poster_path}
        />

        {/* Movie info under player */}
        <div className="py-6">
          <h2 className="text-2xl font-bold text-white">{movie.title}</h2>
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-zinc-400">
            {movie.release_date && <span>{movie.release_date.slice(0, 4)}</span>}
            {movie.runtime && <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>}
            {movie.vote_average > 0 && <span>⭐ {movie.vote_average.toFixed(1)}</span>}
          </div>
          {movie.overview && (
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-zinc-400">{movie.overview}</p>
          )}
        </div>
      </div>
    </div>
  );
}