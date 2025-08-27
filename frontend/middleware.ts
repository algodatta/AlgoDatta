<<<<<<< HEAD
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC = ['/', '/login', '/register', '/logout', '/favicon.ico', '/robots.txt'];
=======

import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';



const PUBLIC = ['/', '/login', '/register', '/logout', '/favicon.ico', '/robots.txt'];


>>>>>>> 70c56dd2decfcb9a464e980fc93d3b81cb1e9180

export function middleware(req: NextRequest) {

  const { pathname } = req.nextUrl;

<<<<<<< HEAD
  if (
    PUBLIC.includes(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/images')
  ) return NextResponse.next();

  const token = req.cookies.get('algodatta_token')?.value;
=======


  if (

    PUBLIC.includes(pathname) ||

    pathname.startsWith('/_next') ||

    pathname.startsWith('/assets') ||

    pathname.startsWith('/images')

  ) return NextResponse.next();



  const token = req.cookies.get('algodatta_token')?.value;

>>>>>>> 70c56dd2decfcb9a464e980fc93d3b81cb1e9180
  if (!token) {

    const url = req.nextUrl.clone();

    url.pathname = '/login';

    url.searchParams.set('next', pathname);

    return NextResponse.redirect(url);

  }

  return NextResponse.next();

}

<<<<<<< HEAD
export const config = { matcher: ['/((?!_next/static|_next/image|assets|images).*)'] };
=======


export const config = { matcher: ['/((?!_next/static|_next/image|assets|images).*)'] };

>>>>>>> 70c56dd2decfcb9a464e980fc93d3b81cb1e9180
