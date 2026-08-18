'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MediaCard from './MediaCard';
import type { Movie, TVShow } from '@/lib/tmdb-types';
import { cn } from '@/lib/utils';

type MediaItem = (Movie | TVShow) & { media_type?: string };

interface MediaGridProps {
  items: MediaItem[];
  currentPage: number;
  totalPages: number;
  basePath: string;
  emptyMessage?: string;
}

export default function MediaGrid({ items, currentPage, totalPages, basePath, emptyMessage = 'No results found.' }: MediaGridProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const goToPage = (page: number) => {
    const sep = basePath.includes('?') ? '&' : '?';
    router.push(`${basePath}${sep}page=${page}`);
  };

  return (
    <div>
      {items.length === 0 ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-zinc-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-4">
  {items.map((item) => (
    <div key={`${item.id}-${item.media_type ?? ''}`} className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.75rem)] md:w-[calc(25%-0.75rem)] lg:w-[calc(20%-0.8rem)] xl:w-[calc(16.666%-0.85rem)]">
      <MediaCard item={item} />
    </div>
  ))}
</div>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <button
            onClick={() => goToPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>

          <div className="flex items-center gap-1">
            {getPageNumbers(currentPage, totalPages).map((p, idx) =>
              p === '…' ? (
                <span key={`gap-${idx}`} className="px-2 text-zinc-500">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => goToPage(p as number)}
                  className={cn(
                    'min-w-[2.5rem] rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    p === currentPage
                      ? 'bg-red-600 text-white'
                      : 'border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white'
                  )}
                >
                  {p}
                </button>
              )
            )}
          </div>

          <button
            onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function getPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | string)[] = [1];
  if (current > 3) pages.push('…');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push('…');
  pages.push(total);
  return pages;
}
