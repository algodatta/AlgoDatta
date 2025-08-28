
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";



const PRIV_PATHS = [

  "/dashboard",

  "/executions",

  "/orders",

  "/strategies",

  "/reports",

  "/notifications",

  "/admin",

];



export function middleware(req: NextRequest) {

  const { pathname, search } = req.nextUrl;

  const token = req.cookies.get("ad_at")?.value;



  // Already logged-in users hitting /login → send to /dashboard (or ?next)

  if (pathname === "/login" && token) {

    const nextParam = req.nextUrl.searchParams.get("next") || "/dashboard";

    const url = req.nextUrl.clone();

    url.pathname = nextParam;

    url.search = "";

    return NextResponse.redirect(url);

  }



  // Protect private paths

  if (PRIV_PATHS.some(p => pathname === p || pathname.startsWith(p + "/"))) {

    if (!token) {

      const url = req.nextUrl.clone();

      url.pathname = "/login";

      url.search = `next=${encodeURIComponent(pathname + (search || ""))}`;

      return NextResponse.redirect(url);

    }

  }



  return NextResponse.next();

}



export const config = {

  matcher: ["/((?!_next|favicon.ico|assets|public).*)"],

};

