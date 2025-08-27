import { NextRequest, NextResponse } from 'next/server';

const PUBLIC = ['/login', '/_next', '/favicon.ico', '/robots.txt'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // allow public paths
  if (PUBLIC.some(p => pathname.startsWith(p))) return NextResponse.next();

  // if no token cookie, redirect to login
  const token = req.cookies.get('ad_token')?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api).*)'],
};
