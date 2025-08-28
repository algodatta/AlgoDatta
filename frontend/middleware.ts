import { NextResponse, NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/signup", "/reset", "/logout"];
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/executions",
  "/orders",
  "/strategies",
  "/reports",
  "/notifications",
  "/admin",
  "/broker",
];

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Default / -> /login
  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Always allow public pages
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    // If user is already authenticated, keep them away from auth pages
    const token = req.cookies.get("algodatta_auth")?.value || req.cookies.get("algodatta_token")?.value;
    if (token && (pathname === "/login" || pathname === "/signup" || pathname.startsWith("/reset"))) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Check protected areas
  const needsAuth = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (needsAuth) {
    const token = req.cookies.get("algodatta_auth")?.value || req.cookies.get("algodatta_token")?.value;
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      if (pathname !== "/login") {
        // preserve intended destination
        url.search = `?next=${encodeURIComponent(pathname + (search || ""))}`;
      }
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run middleware on all routes except static assets & Next internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:css|js|map|png|jpg|jpeg|gif|svg|ico)$).*)",
  ],
};
