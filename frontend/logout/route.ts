// frontend/app/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_BASE } from '@/lib/api';

export const dynamic = 'force-dynamic'; // do not prerender, ever

export async function GET(req: NextRequest) {
  // Best-effort backend logout (ignore failures to keep UX snappy)
  try {
    await fetch(`${API_BASE}/auth/logout`, { method: 'POST', cache: 'no-store' });
  } catch {}

  // Clear client auth cookie used for route guards
  cookies().delete('algodatta_auth');

  // Redirect to login
  return NextResponse.redirect(new URL('/login', req.url));
}
