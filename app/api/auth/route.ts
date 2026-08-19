// app/api/auth/route.ts
import { NextResponse } from 'next/server';

const PIN = process.env.APP_PIN || '1988';

export async function POST(request: Request) {
  const { pin } = await request.json();

  if (pin === PIN) {
    const response = NextResponse.json({ success: true });
    response.cookies.set('cinestream_auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 zile
      path: '/',
    });
    return response;
  }

  return NextResponse.json({ success: false, error: 'Wrong PIN' }, { status: 401 });
}