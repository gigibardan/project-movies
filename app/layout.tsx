import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CineStream — Discover Movies & TV Shows',
  description: 'Browse trending movies and TV shows, watch trailers, and discover your next favorite.',
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
        <footer className="border-t border-white/5 px-4 py-8 text-center text-sm text-zinc-600 sm:px-6 lg:px-8">
          <p>
            Data provided by <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-red-500">TMDB</a>. Built with Next.js.
          </p>
        </footer>
      </body>
    </html>
  );
}
