import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const PUBLIC_PATHS = new Set<string>([
  '/', '/login', '/register', '/logout', '/favicon.ico', '/robots.txt', '/sitemap.xml',
]);

// Anything starting with these prefixes should bypass auth checks
const PUBLIC_PREFIXES = [
  '/api/auth',  // login/logout cookie endpoints
  '/_next',     // Next.js assets
  '/assets',
  '/images',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths and prefixes
  if (PUBLIC_PATHS.has(pathname) || PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check auth cookie
  const token = req.cookies.get('algodatta_token')?.value;

  // If not logged in, send to /login and remember where they came from
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // If already logged in and trying to hit / or /login, send to /dashboard
  if ((pathname === '/' || pathname === '/login') && token) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|assets|images|favicon.ico|robots.txt|sitemap.xml).*)'],
};
