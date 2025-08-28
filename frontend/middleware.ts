
import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";



export function middleware(req: NextRequest) {

  const { pathname } = req.nextUrl;



  const protectedBases = [

    "/dashboard",

    "/executions",

    "/orders",

    "/strategies",

    "/reports",

    "/notifications",

    "/admin",

  ];



  const needsAuth = protectedBases.some(

    (base) => pathname === base || pathname.startsWith(base + "/"),

  );



  if (!needsAuth) return NextResponse.next();



  // Accept any of these cookies as a logged-in signal.

  const allowed =

    req.cookies.has("ad_at") ||

    req.cookies.has("token") ||

    req.cookies.has("access_token") ||

    req.cookies.has("Authorization");



  if (!allowed) {

    const url = req.nextUrl.clone();

    url.pathname = "/login";

    url.searchParams.set("next", pathname);

    return NextResponse.redirect(url);

  }



  return NextResponse.next();

}



export const config = {

  matcher: [

    "/dashboard/:path*",

    "/executions/:path*",

    "/orders/:path*",

    "/strategies/:path*",

    "/reports/:path*",

    "/notifications/:path*",

    "/admin/:path*",

  ],

};

