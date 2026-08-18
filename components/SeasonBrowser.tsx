'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import type { SeasonDetails, Episode } from '@/lib/tmdb-types';
import { IMG } from '@/lib/tmdb';
import { cn } from '@/lib/utils';

interface SeasonBrowserProps {
  tvId: string;
  seasons: { id: number; name: string; season_number: number; episode_count: number; poster_path: string | null; overview: string }[];
}

export default function SeasonBrowser({ tvId, seasons }: SeasonBrowserProps) {
  const validSeasons = seasons.filter((s) => s.season_number >= 0);
  const [selected, setSelected] = useState(validSeasons[0]?.season_number ?? 0);
  const [data, setData] = useState<SeasonDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/tv/season?tvId=${tvId}&season=${selected}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [tvId, selected]);

  const current = validSeasons.find((s) => s.season_number === selected);

  return (
    <div className="mt-10">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-white sm:text-2xl">Episodes</h2>

        {/* Custom season selector */}
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10 sm:w-64"
          >
            <span>{current?.name || `Season ${selected}`}</span>
            <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
          </button>
          {open && (
            <div className="absolute right-0 z-30 mt-1 max-h-72 w-64 overflow-y-auto rounded-lg border border-white/10 bg-zinc-900 py-1 shadow-2xl">
              {validSeasons.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setSelected(s.season_number); setOpen(false); }}
                  className={cn(
                    'flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/10',
                    s.season_number === selected ? 'text-red-400' : 'text-zinc-300'
                  )}
                >
                  <span>{s.name}</span>
                  <span className="text-xs text-zinc-500">{s.episode_count} eps</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-white/5" />
          ))}
        </div>
      ) : data?.episodes?.length ? (
        <div className="space-y-3">
          {data.episodes.filter((e) => e.name && e.name !== 'Episode 1' || e.overview).map((ep) => (
            <EpisodeRow key={ep.id} ep={ep} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-500">No episode data available.</p>
      )}
    </div>
  );
}

function EpisodeRow({ ep }: { ep: Episode }) {
  const still = IMG.backdrop(ep.still_path, 'w780');
  return (
    <div className="group flex gap-4 rounded-lg border border-white/5 bg-white/[0.02] p-3 transition-colors hover:border-white/10 hover:bg-white/5">
      <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-md bg-zinc-900 sm:w-40">
        {still ? (
          <Image src={still} alt={ep.name} fill sizes="160px" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-zinc-600">No image</div>
        )}
        <div className="absolute left-1 top-1 rounded bg-black/80 px-1.5 py-0.5 text-xs font-bold text-white">
          E{ep.episode_number}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <h3 className="line-clamp-1 text-sm font-semibold text-white">{ep.name}</h3>
          {ep.runtime && <span className="shrink-0 text-xs text-zinc-500">{ep.runtime}m</span>}
        </div>
        {ep.air_date && (
          <p className="mb-1 text-xs text-zinc-500">
            {new Date(ep.air_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
        )}
        {ep.overview && <p className="line-clamp-2 text-xs leading-relaxed text-zinc-400">{ep.overview}</p>}
      </div>
    </div>
  );
}
