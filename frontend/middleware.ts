import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/login', '/logout', '/favicon.ico', '/robots.txt'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths, static and images
  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/images')
  ) {
    return NextResponse.next();
  }

  // Check cookie set after login
  const token = req.cookies.get('algodatta_token')?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|assets|images).*)'],
};
