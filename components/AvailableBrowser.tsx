'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Search, Film, Tv, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CatalogItem {
  id: number;
  t: string;
  p: string | null;
  y: string;
  r: number;
}

interface Catalog {
  updated: string;
  movies: CatalogItem[];
  tv: CatalogItem[];
}

const PER_PAGE = 48;

export default function AvailableBrowser() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [filter, setFilter] = useState<'all' | 'movies' | 'tv'>('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'popular' | 'rating' | 'year' | 'title'>('popular');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch('/data/filesun-catalog.json')
      .then((r) => r.json())
      .then((d) => setCatalog(d))
      .catch(() => {});
  }, []);

  const items = useMemo(() => {
    if (!catalog) return [];

    let list: (CatalogItem & { type: 'movie' | 'tv' })[] = [];
    if (filter === 'all' || filter === 'movies') {
      list.push(...catalog.movies.map((m) => ({ ...m, type: 'movie' as const })));
    }
    if (filter === 'all' || filter === 'tv') {
      list.push(...catalog.tv.map((t) => ({ ...t, type: 'tv' as const })));
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((item) => item.t?.toLowerCase().includes(q));
    }

    // Sort
    switch (sort) {
      case 'rating':
        list.sort((a, b) => b.r - a.r);
        break;
      case 'year':
        list.sort((a, b) => (b.y || '0').localeCompare(a.y || '0'));
        break;
      case 'title':
        list.sort((a, b) => (a.t || '').localeCompare(b.t || ''));
        break;
      default: // popular — already sorted by popularity from sync
        break;
    }

    return list;
  }, [catalog, filter, search, sort]);

  const totalPages = Math.ceil(items.length / PER_PAGE);
  const pageItems = items.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [filter, search, sort]);

  if (!catalog) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Play className="h-7 w-7 text-red-500" fill="currentColor" />
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Available to Watch</h1>
          <p className="text-sm text-zinc-500">
            {catalog.movies.length.toLocaleString()} movies · {catalog.tv.length.toLocaleString()} TV shows
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search available titles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-red-500/50 focus:bg-white/[0.07] sm:max-w-md"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Type filter */}
          {(['all', 'movies', 'tv'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                filter === f
                  ? 'bg-red-600 text-white'
                  : 'border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'
              )}
            >
              {f === 'movies' && <Film className="h-3.5 w-3.5" />}
              {f === 'tv' && <Tv className="h-3.5 w-3.5" />}
              {f === 'all' ? 'All' : f === 'movies' ? 'Movies' : 'TV Shows'}
            </button>
          ))}

          <div className="mx-1 h-5 w-px bg-white/10" />

          {/* Sort */}
          {(['popular', 'rating', 'year', 'title'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                sort === s
                  ? 'bg-white/20 text-white'
                  : 'text-zinc-500 hover:text-zinc-200'
              )}
            >
              {s === 'popular' ? 'Popular' : s === 'rating' ? 'Top Rated' : s === 'year' ? 'Newest' : 'A–Z'}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="mb-4 text-sm text-zinc-500">
        {items.length.toLocaleString()} titles
        {search && ` matching "${search}"`}
      </p>

      {/* Grid */}
      {pageItems.length === 0 ? (
        <div className="flex min-h-[30vh] items-center justify-center text-zinc-500">
          No results found.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
          {pageItems.map((item) => (
            <CatalogCard key={`${item.type}-${item.id}`} item={item} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>
          <span className="px-4 text-sm text-zinc-400">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-30"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function CatalogCard({ item }: { item: CatalogItem & { type: 'movie' | 'tv' } }) {
  const poster = item.p ? `https://image.tmdb.org/t/p/w342${item.p}` : null;
  const detailHref = item.type === 'movie' ? `/movie/${item.id}` : `/tv/${item.id}`;
  const watchHref = item.type === 'movie'
    ? `/watch/movie/${item.id}`
    : `/watch/tv/${item.id}/1/1`;

  return (
    <div className="group relative">
      <Link href={detailHref} className="block">
        <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-zinc-900 shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:shadow-red-500/10">
          {poster ? (
            <Image
              src={poster}
              alt={item.t}
              fill
              sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 12.5vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-zinc-600">No image</div>
          )}

          {/* Rating */}
          {item.r > 0 && (
            <div className="absolute right-1.5 top-1.5 flex items-center gap-0.5 rounded bg-black/70 px-1 py-0.5 backdrop-blur-sm">
              <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
              <span className="text-[10px] font-bold text-white">{item.r}</span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/50">
            <Play className="h-10 w-10 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100" fill="currentColor" />
          </div>
        </div>
      </Link>

      {/* Watch shortcut */}
      <Link
        href={watchHref}
        className="absolute bottom-[calc(100%-2.25rem)] right-1.5 z-10 flex items-center gap-1 rounded-full bg-red-600/90 px-2 py-1 text-[10px] font-bold text-white opacity-0 shadow-lg backdrop-blur-sm transition-all group-hover:opacity-100 hover:bg-red-500"
        onClick={(e) => e.stopPropagation()}
      >
        <Play className="h-2.5 w-2.5 fill-current" />
        Play
      </Link>

      <h3 className="mt-1.5 line-clamp-1 text-xs font-medium text-zinc-300 group-hover:text-white">
        {item.t}
      </h3>
      <p className="text-[10px] text-zinc-600">{item.y}</p>
    </div>
  );
}