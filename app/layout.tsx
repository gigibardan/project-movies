import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CineStream — Discover Movies & TV Shows',
  description: 'Browse trending movies and TV shows, watch trailers, and discover your next favorite.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  openGraph: {
    title: 'CineStream',
    description: 'Discover movies & TV shows with trailers, ratings, and details.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-zinc-100 antialiased`}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
                <footer className="border-t border-white/5 px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-zinc-500">
              <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              <span className="text-sm font-semibold tracking-tight">
                Cine<span className="text-red-500">Stream</span>
              </span>
            </div>
            <p className="text-xs text-zinc-600">
              Personal project · Not for public use
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
