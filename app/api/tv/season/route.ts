import { NextResponse } from 'next/server';
import { getSeasonDetails } from '@/lib/tmdb';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tvId = searchParams.get('tvId');
  const season = searchParams.get('season');

  if (!tvId || season === null) {
    return NextResponse.json({ error: 'Missing tvId or season' }, { status: 400 });
  }

  try {
    const data = await getSeasonDetails(tvId, Number(season));
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
