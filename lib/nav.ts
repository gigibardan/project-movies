import Link from 'next/link';

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/movies', label: 'Movies' },
  { href: '/tv', label: 'TV Shows' },
  { href: '/available', label: 'Watch Now' },
  { href: '/watchlist', label: 'Watchlist' },
  { href: '/trending', label: 'Trending' },
] as const;