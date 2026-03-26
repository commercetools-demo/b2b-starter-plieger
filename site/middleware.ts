import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { locales, DEFAULT_LOCALE } from '@/i18n/config';

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'fallback-secret-change-me-in-production!!'
);

const PROTECTED_ROUTES = ['/dashboard', '/cart', '/checkout', '/wishlists', '/account'];
const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Resolve locale from URL prefix
  const urlLocale = (locales as readonly string[]).find(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );

  // Decode session JWT (if present)
  const cookieValue = request.cookies.get('b2b-session')?.value;
  let session: Record<string, unknown> = {};
  if (cookieValue) {
    try {
      const { payload } = await jwtVerify(cookieValue, SECRET);
      session = payload as Record<string, unknown>;
    } catch {
      // invalid or expired — treat as unauthenticated
    }
  }

  const isAuthenticated = !!session.customerId;

  // Derive locale from session, fallback to default
  const rawSessionLocale = (session.locale as string | undefined) ?? DEFAULT_LOCALE.language;
  const sessionLanguage = rawSessionLocale.split('-')[0].toLowerCase();
  const sessionLocale = (locales as readonly string[]).includes(sessionLanguage)
    ? sessionLanguage
    : DEFAULT_LOCALE.language;

  // No locale prefix → redirect to locale-prefixed URL
  if (!urlLocale) {
    const url = request.nextUrl.clone();
    url.pathname = `/${sessionLocale}${pathname === '/' ? '' : pathname}`;
    return NextResponse.redirect(url);
  }

  // Auth protection (locale-prefixed routes)
  const pathWithoutLocale = pathname.slice(`/${urlLocale}`.length) || '/';
  const isProtected = PROTECTED_ROUTES.some((r) => pathWithoutLocale.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some((r) => pathWithoutLocale.startsWith(r));

  if (isProtected && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = `/${urlLocale}/login`;
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = `/${urlLocale}/dashboard`;
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();
  response.headers.set('x-locale', urlLocale);
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|api|favicon.ico|.*\\..*).*)'],
};
