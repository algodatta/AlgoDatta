
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";



const PRIV_PATHS = ["/dashboard","/executions","/orders","/strategies","/reports","/notifications","/admin"];



export function middleware(req: NextRequest) {

  const { pathname, search } = req.nextUrl;

  const token = req.cookies.get("ad_at")?.value;



  // Public auth pages

  const isAuthPublic = pathname === "/login" || pathname === "/signup" || pathname === "/reset" || pathname === "/reset/confirm" || pathname === "/";



  if (isAuthPublic) {

    // logged-in users shouldn't see login/signup/reset

    if (token && (pathname === "/" || pathname === "/login" || pathname === "/signup" || pathname === "/reset" || pathname === "/reset/confirm")) {

      const nextParam = req.nextUrl.searchParams.get("next") || "/dashboard";

      const url = req.nextUrl.clone();

      url.pathname = nextParam;

      url.search = "";

      return NextResponse.redirect(url);

    }

    // ensure "/" -> "/login"

    if (pathname === "/") {

      const url = req.nextUrl.clone();

      url.pathname = "/login";

      return NextResponse.redirect(url);

    }

    return NextResponse.next();

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

