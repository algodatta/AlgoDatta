// frontend/middleware.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const PUBLIC = ['/login', '/signup', '/reset'];
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/executions',
  '/orders',
  '/strategies',
  '/reports',
  '/notifications',
  '/admin',
  '/broker',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always send "/" to "/login"
  if (pathname === '/') {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Let Next internals & assets pass
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/assets')
  ) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const needsAuth = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (needsAuth && !isPublic) {
    const token = req.cookies.get('algodatta_auth')?.value;
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|fonts|icons).*)'],
};
