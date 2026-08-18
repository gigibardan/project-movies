// app/api/filesun/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'movies' or 'tv'
  const page = searchParams.get('page') || '1';

  if (type !== 'movies' && type !== 'tv') {
    return NextResponse.json({ ids: [], pages: 0 }, { status: 400 });
  }

  try {
    const res = await fetch(`https://filesun.sbs/available/${type}?page=${page}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://filesun.sbs/',
      },
    });

    if (!res.ok) {
      console.error(`[FileSuN proxy] ${type} page ${page}: HTTP ${res.status}`);
      return NextResponse.json({ ids: [], pages: 0 });
    }

    const data = await res.json();
    return NextResponse.json(
      { ids: data.ids || [], pages: data.pages || 0 },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=3600',
        },
      }
    );
  } catch (err) {
    console.error(`[FileSuN proxy] ${type} page ${page} error:`, (err as Error).message);
    return NextResponse.json({ ids: [], pages: 0 });
  }
}