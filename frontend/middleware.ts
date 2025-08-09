import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = new Set<string>(['/login', '/_next', '/favicon.ico', '/icon.png', '/health']);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // allow public/static paths
  if (pathname === '/' || pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/favicon') || pathname.startsWith('/health')) {
    return NextResponse.next();
  }
  if (pathname === '/login') {
    return NextResponse.next();
  }

  const token = req.cookies.get('token')?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|.*\..*).*)'],
};
