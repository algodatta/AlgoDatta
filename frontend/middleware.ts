import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED = ['/broker','/strategies','/executions','/reports','/admin']

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone()
  const token = req.cookies.get('token')?.value || '' // not set; we rely on localStorage on client

  if (PROTECTED.some(path => url.pathname.startsWith(path))) {
    // Let client-side guard redirect if needed; no SSR cookie by default.
    return NextResponse.next()
  }
  return NextResponse.next()
}
