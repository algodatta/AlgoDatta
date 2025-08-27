import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC = new Set<string>(['/', '/login', '/register', '/logout', '/favicon.ico', '/robots.txt']);

function decodeRole(token: string): string {
  try {
    const seg = token.split('.')[1] || '';
    const pad = '='.repeat((4 - (seg.length % 4)) % 4);
    const base64 = (seg + pad).replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(typeof atob === 'function'
      ? atob(base64)
      : (typeof Buffer !== 'undefined'
          ? Buffer.from(base64, 'base64').toString('binary')
          : '{}'));
    return (
      json?.role ??
      (Array.isArray(json?.roles) ? json.roles[0] : '') ??
      json?.['https://algodatta.com/role'] ??
      ''
    );
  } catch { return ''; }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.startsWith('/assets') || pathname.startsWith('/images'))
    return NextResponse.next();

  if (PUBLIC.has(pathname)) return NextResponse.next();

  const token = req.cookies.get('algodatta_token')?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith('/admin')) {
    const role = decodeRole(token);
    if (role !== 'admin') {
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  if (pathname === '/login') {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = { matcher: ['/((?!_next/static|_next/image|assets|images|favicon.ico|robots.txt).*)'] };
