import { NextResponse, NextRequest } from "next/server";

const PROTECTED = [/^\/strategies/, /^\/executions/, /^\/reports/];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!PROTECTED.some((re) => re.test(pathname))) return NextResponse.next();
  const token = req.cookies.get("token")?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/strategies/:path*", "/executions/:path*", "/reports/:path*"],
};
