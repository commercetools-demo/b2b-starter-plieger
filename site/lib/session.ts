import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { SessionData } from './types';

const COOKIE_NAME = 'b2b-session';
const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET || 'fallback-secret-change-me-in-production!!');

export async function getSession(): Promise<SessionData> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie?.value) return {};

  try {
    const { payload } = await jwtVerify(cookie.value, SECRET);
    return payload as unknown as SessionData;
  } catch {
    return {};
  }
}

export async function setSession(
  response: NextResponse,
  data: SessionData
): Promise<NextResponse> {
  const token = await new SignJWT(data as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(SECRET);

  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });

  return response;
}

export async function clearSession(response: NextResponse): Promise<NextResponse> {
  response.cookies.delete(COOKIE_NAME);
  return response;
}
