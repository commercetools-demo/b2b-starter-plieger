import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'fallback-secret-change-me-in-production!!'
);

const PROTECTED_ROUTES = ['/dashboard', '/cart', '/checkout', '/wishlists', '/account'];
const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const cookieValue = request.cookies.get('b2b-session')?.value;
  let session: Record<string, unknown> = {};

  if (cookieValue) {
    try {
      const { payload } = await jwtVerify(cookieValue, SECRET);
      session = payload as Record<string, unknown>;
    } catch {
      // invalid or expired token — treat as unauthenticated
    }
  }

  const isAuthenticated = !!session.customerId;
  const locale = (session.locale as string) ?? 'en';

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  if (isProtected && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();
  response.headers.set('x-locale', locale);
  return response;
}``

export const config = {
  matcher: ['/((?!_next/static|_next/image|api|favicon.ico|.*\\..*).*)'],
};
