import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED = [/^\/dashboard/, /^\/broker/, /^\/strategies/, /^\/reports/, /^\/admin/];

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const path = url.pathname;
  if (!PROTECTED.some(rx => rx.test(path))) return NextResponse.next();

  const token = req.cookies.get('access_token')?.value;
  if (!token) { url.pathname = '/login'; return NextResponse.redirect(url); }

  // Soft-role-gate: decode payload only; for real systems verify signature server-side.
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()) as any;
    if ((path.startsWith('/admin') || path.startsWith('/dashboard')) && payload?.role !== 'admin') {
      url.pathname = '/'; return NextResponse.redirect(url);
    }
  } catch {
    url.pathname = '/login'; return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/dashboard/:path*','/broker/:path*','/strategies/:path*','/reports/:path*','/admin/:path*'] };
