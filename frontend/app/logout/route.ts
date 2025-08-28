import { NextRequest, NextResponse } from "next/server";

function logoutResponse(to: string = "/login?loggedout=1") {
  const res = NextResponse.redirect(new URL(to, process.env.NEXT_PUBLIC_SITE_URL || "https://www.algodatta.com"));
  res.cookies.set("algodatta_auth", "", { path: "/", maxAge: 0 });
  res.cookies.set("algodatta_token", "", { path: "/", maxAge: 0 });
  return res;
}

export function GET(_req: NextRequest) {
  return logoutResponse();
}

export async function POST(_req: NextRequest) {
  return logoutResponse();
}
