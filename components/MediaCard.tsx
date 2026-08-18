import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import type { Movie, TVShow } from '@/lib/tmdb-types';
import { IMG, ratingColor } from '@/lib/tmdb';
import { cn } from '@/lib/utils';
import WatchBadge from './WatchBadge';

type MediaItem = (Movie | TVShow) & { media_type?: string };

interface MediaCardProps {
  item: MediaItem;
  className?: string;
}

export default function MediaCard({ item, className }: MediaCardProps) {
  const isTV = item.media_type === 'tv' || ('name' in item && !('title' in item));
  const title = isTV ? (item as TVShow).name : (item as Movie).title;
  const date = isTV ? (item as TVShow).first_air_date : (item as Movie).release_date;
  const year = date ? date.slice(0, 4) : '';
  const href = isTV ? `/tv/${item.id}` : `/movie/${item.id}`;
  const poster = IMG.poster(item.poster_path, 'w342');

  return (
    <Link href={href} className={cn('group block', className)}>
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-zinc-900 shadow-md transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-red-500/10">
        {poster ? (
          <Image
            src={poster}
            alt={title}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, (max-width: 1280px) 22vw, 18vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-600">
            <span className="text-xs">No image</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 backdrop-blur-sm">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className={cn('text-xs font-semibold', ratingColor(item.vote_average))}>
            {item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}
          </span>
        </div>

        {isTV && <WatchBadge tmdbId={item.id} />}

        <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 transition-all duration-300 group-hover:opacity-100">
          <p className="text-xs font-medium text-zinc-300">{year}</p>
        </div>
      </div>

      <h3 className="mt-2 line-clamp-1 text-sm font-medium text-zinc-200 transition-colors group-hover:text-white">
        {title}
      </h3>
      {year && <p className="text-xs text-zinc-500">{year}</p>}
    </Link>
  );
}