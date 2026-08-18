// app/watch/tv/[id]/[season]/[episode]/page.tsx
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { getTVDetails, getSeasonDetails } from '@/lib/tmdb';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { id: string; season: string; episode: string } }) {
    try {
        const tv = await getTVDetails(params.id);
        return { title: `${tv.name} S${params.season}E${params.episode} — CineStream` };
    } catch {
        return { title: 'Watch — CineStream' };
    }
}

export default async function WatchTVPage({ params }: { params: { id: string; season: string; episode: string } }) {
    const seasonNum = Number(params.season);
    const episodeNum = Number(params.episode);

    let tv;
    let seasonData;
    try {
        tv = await getTVDetails(params.id);
        seasonData = await getSeasonDetails(params.id, seasonNum);
    } catch {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-zinc-400">Content not found.</p>
            </div>
        );
    }

    const currentEp = seasonData?.episodes?.find((e) => e.episode_number === episodeNum);
    const totalEpisodes = seasonData?.episodes?.length || 0;
    const totalSeasons = tv.number_of_seasons || 1;

    // Navigation logic
    const hasPrev = episodeNum > 1;
    const hasNext = episodeNum < totalEpisodes;
    const hasNextSeason = seasonNum < totalSeasons;
    const hasPrevSeason = seasonNum > 1;

    const prevHref = hasPrev
        ? `/watch/tv/${params.id}/${seasonNum}/${episodeNum - 1}`
        : hasPrevSeason
            ? `/watch/tv/${params.id}/${seasonNum - 1}/1`
            : null;

    const nextHref = hasNext
        ? `/watch/tv/${params.id}/${seasonNum}/${episodeNum + 1}`
        : hasNextSeason
            ? `/watch/tv/${params.id}/${seasonNum + 1}/1`
            : null;

    return (
        <div className="min-h-screen bg-black pt-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center gap-4 py-4">
                    <Link
                        href={`/tv/${params.id}`}
                        className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/20 hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to details
                    </Link>
                    <h1 className="line-clamp-1 text-lg font-bold text-white sm:text-xl">
                        {tv.name}
                        <span className="ml-2 font-normal text-zinc-500">S{seasonNum} E{episodeNum}</span>
                    </h1>
                </div>

                {/* Player */}
                <div className="relative w-full overflow-hidden rounded-xl bg-zinc-900" style={{ paddingTop: '56.25%' }}>
                    <iframe
                        src={`https://filesun.sbs/embed/tv/${params.id}/${seasonNum}/${episodeNum}?autoplay=0`}
                        className="absolute inset-0 h-full w-full border-0"
                        allowFullScreen
                        allow="autoplay; encrypted-media; picture-in-picture"
                        referrerPolicy="no-referrer"
                    />
                </div>

                {/* Episode nav */}
                <div className="flex items-center justify-between py-4">
                    {prevHref ? (
                        <Link
                            href={prevHref}
                            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/20 hover:text-white"
                        >
                            <ChevronLeft className="h-4 w-4" /> Previous
                        </Link>
                    ) : (
                        <div />
                    )}
                    {nextHref ? (
                        <Link
                            href={nextHref}
                            className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500"
                        >
                            Next <ChevronRight className="h-4 w-4" />
                        </Link>
                    ) : (
                        <div />
                    )}
                </div>

                {/* Episode info */}
                <div className="pb-8">
                    <h2 className="text-2xl font-bold text-white">
                        {currentEp?.name || `Episode ${episodeNum}`}
                    </h2>
                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-zinc-400">
                        <span>Season {seasonNum}, Episode {episodeNum}</span>
                        {currentEp?.runtime && <span>{currentEp.runtime}m</span>}
                        {currentEp?.vote_average != null && currentEp.vote_average > 0 && <span>⭐ {currentEp.vote_average.toFixed(1)}</span>}
                    </div>
                    {currentEp?.overview && (
                        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-zinc-400">{currentEp.overview}</p>
                    )}
                </div>
            </div>
        </div>
    );
}