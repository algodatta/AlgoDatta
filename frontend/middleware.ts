// frontend/middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC = new Set(["/", "/login", "/signup", "/reset"]);
const ASSET_PREFIX = /^\/(_next|favicon\.ico|assets|images|fonts)\b/i;

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  if (ASSET_PREFIX.test(pathname)) return NextResponse.next();

  const token = req.cookies.get("algodatta_token")?.value;
  const isPublic = PUBLIC.has(pathname) || pathname.startsWith("/reset");

  if (!token && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    if (pathname !== "/") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (token && (pathname === "/" || pathname === "/login")) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/|_next/|favicon.ico).*)"],
};
