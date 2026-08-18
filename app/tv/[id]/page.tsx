import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Star, Calendar, ArrowLeft, Globe, Tv } from 'lucide-react';
import { getTVDetails, IMG, getCreators, topCast, ratingColor } from '@/lib/tmdb';
import { cn } from '@/lib/utils';
import MediaCard from '@/components/MediaCard';
import TrailerSection from '@/components/TrailerSection';
import SeasonBrowser from '@/components/SeasonBrowser';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const tv = await getTVDetails(params.id);
    return { title: `${tv.name} — CineStream`, description: tv.overview?.slice(0, 160) };
  } catch {
    return { title: 'TV Show — CineStream' };
  }
}

export default async function TVDetailPage({ params }: { params: { id: string } }) {
  let tv;
  try {
    tv = await getTVDetails(params.id);
  } catch {
    notFound();
  }

  const backdrop = IMG.backdrop(tv.backdrop_path, 'original');
  const poster = IMG.poster(tv.poster_path, 'w500');
  const creators = getCreators(tv.created_by || []);
  const cast = topCast(tv.credits?.cast || [], 12);
  const trailer = tv.videos?.results || [];
  const similar = tv.similar?.results?.filter((m) => m.poster_path).slice(0, 6) || [];
  const recommendations = tv.recommendations?.results?.filter((m) => m.poster_path).slice(0, 6) || [];

  return (
    <div className="min-h-screen">
      <div className="relative h-[55vh] min-h-[400px] w-full">
        {backdrop && (
          <Image src={backdrop} alt={tv.name} fill priority sizes="100vw" className="object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 to-transparent" />
      </div>

      <div className="relative z-10 -mt-48 mx-auto max-w-7xl px-4 sm:-mt-56 sm:px-6 lg:px-8">
        <Link
          href="/tv"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to TV Shows
        </Link>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-[300px_1fr]">
          <div className="mx-auto w-full max-w-[300px] md:mx-0">
            <div className="relative aspect-[2/3] overflow-hidden rounded-xl shadow-2xl shadow-black/50">
              {poster ? (
                <Image src={poster} alt={tv.name} fill sizes="300px" className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-zinc-900 text-zinc-600">No poster</div>
              )}
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {tv.name}
              {tv.first_air_date && (
                <span className="ml-3 text-2xl font-normal text-zinc-400">({tv.first_air_date.slice(0, 4)})</span>
              )}
            </h1>
            {tv.tagline && <p className="mt-2 text-lg italic text-zinc-400">&ldquo;{tv.tagline}&rdquo;</p>}

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className={cn('font-bold', ratingColor(tv.vote_average))}>{tv.vote_average?.toFixed(1)}</span>
                <span className="text-zinc-500">({tv.vote_count?.toLocaleString()})</span>
              </span>
              {tv.number_of_seasons != null && (
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <Tv className="h-4 w-4 text-zinc-500" />
                  {tv.number_of_seasons} season{tv.number_of_seasons !== 1 ? 's' : ''} • {tv.number_of_episodes} eps
                </span>
              )}
              {tv.first_air_date && (
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <Calendar className="h-4 w-4 text-zinc-500" />
                  {new Date(tv.first_air_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              )}
              {tv.status && (
                <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-medium text-zinc-300">{tv.status}</span>
              )}
            </div>

            {tv.genres && tv.genres.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {tv.genres.map((g) => (
                  <Link
                    key={g.id}
                    href={`/tv?genre=${g.id}`}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300 transition-colors hover:border-red-500/40 hover:text-red-400"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            )}

            {tv.overview && (
              <div className="mt-6">
                <h2 className="mb-2 text-lg font-bold text-white">Overview</h2>
                <p className="text-sm leading-relaxed text-zinc-300 sm:text-base">{tv.overview}</p>
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {creators.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Created By</p>
                  <p className="text-sm font-medium text-zinc-200">{creators.map((c) => c.name).join(', ')}</p>
                </div>
              )}
              {tv.networks && tv.networks.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Network</p>
                  <p className="text-sm font-medium text-zinc-200">{tv.networks.map((n) => n.name).join(', ')}</p>
                </div>
              )}
              {tv.spoken_languages && tv.spoken_languages.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Languages</p>
                  <p className="text-sm font-medium text-zinc-200">{tv.spoken_languages.map((l) => l.english_name).join(', ')}</p>
                </div>
              )}
              {tv.production_companies && tv.production_companies.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Studios</p>
                  <p className="text-sm font-medium text-zinc-200">{tv.production_companies.map((c) => c.name).join(', ')}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/watch/tv/${tv.id}/1/1`}
                className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/25 transition-all hover:bg-red-500 hover:shadow-red-500/30 active:scale-95"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch S1 E1
              </Link>

              {tv.homepage && (
                <a
                  href={tv.homepage}
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

        <TrailerSection videos={trailer} title={tv.name} />

        {/* Seasons & Episodes */}
        {tv.seasons && tv.seasons.length > 0 && (
          <SeasonBrowser tvId={String(tv.id)} seasons={tv.seasons} />
        )}

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
                        <div className="flex h-full items-center justify-center text-2xl text-zinc-600">{person.name?.charAt(0)}</div>
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
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">{recommendations.map((m) => <MediaCard key={m.id} item={{ ...m, media_type: 'tv' }} />)}</div>
          </div>
        )}

        {similar.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 text-xl font-bold text-white sm:text-2xl">More Like This</h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">{similar.map((m) => <MediaCard key={m.id} item={{ ...m, media_type: 'tv' }} />)}</div>
          </div>
        )}
      </div>
    </div >
  );
}
