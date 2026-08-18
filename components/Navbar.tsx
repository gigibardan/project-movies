'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Film, Menu, X } from 'lucide-react';
import { useState, useEffect, FormEvent } from 'react';
import { cn } from '@/lib/utils';
import { NAV_LINKS } from '@/lib/nav';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setMobileOpen(false);
  };

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled || mobileOpen
          ? 'bg-zinc-950/95 backdrop-blur-md shadow-lg shadow-black/30'
          : 'bg-gradient-to-b from-black/70 via-black/30 to-transparent'
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-white" aria-label="CineStream home">
          <Film className="h-7 w-7 text-red-500" strokeWidth={2.2} />
          <span className="text-lg font-bold tracking-tight">
            Cine<span className="text-red-500">Stream</span>
          </span>
        </Link>

        <ul className="ml-6 hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    active ? 'text-white' : 'text-zinc-400 hover:text-white'
                  )}
                >
                  {link.label}
                </Link>
                {active && <div className="mx-auto h-0.5 w-4 rounded-full bg-red-500" />}
              </li>
            );
          })}
        </ul>

        <form onSubmit={onSearch} className="ml-auto hidden items-center md:flex">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies, shows..."
              className="w-48 rounded-full border border-white/10 bg-white/5 py-2 pl-9 pr-4 text-sm text-white placeholder:text-zinc-500 transition-all focus:w-64 focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/30"
            />
          </div>
        </form>

        <button
          className="ml-auto text-white md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-zinc-950 px-4 py-4 md:hidden">
          <form onSubmit={onSearch} className="mb-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search movies, shows..."
                className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-zinc-500 focus:border-red-500/50 focus:outline-none"
              />
            </div>
          </form>
          <ul className="space-y-1">
            {NAV_LINKS.map((link) => {
              const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'block rounded-md px-3 py-2.5 text-base font-medium',
                      active ? 'bg-white/10 text-white' : 'text-zinc-300 hover:bg-white/5'
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </header>
  );
}
