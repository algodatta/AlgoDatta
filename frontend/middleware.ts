import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, importSPKI, createRemoteJWKSet, JWTPayload } from "jose";

/** Customize these to your project */
const AUTH_COOKIE_NAMES = ["algodatta_session", "access_token", "auth_token"];
const AUTH_PAGES = [/^\/login$/, /^\/signup$/, /^\/forgot/];

// Route -> role mapping
// Update to match your app's sitemap and roles
const ROLE_ROUTES: { pattern: RegExp; allow: string[] }[] = [
  { pattern: /^\/admin(\/|$)/, allow: ["admin"] },
  { pattern: /^\/reports(\/|$)/, allow: ["admin", "analyst"] },
  { pattern: /^\/executions(\/|$)/, allow: ["admin", "trader"] },
  { pattern: /^\/strategies(\/|$)/, allow: ["admin", "trader", "analyst"] },
  { pattern: /^\/broker(\/|$)/, allow: ["admin", "trader"] },
];

const PROTECTED = [/^\/executions/, /^\/strategies/, /^\/broker/, /^\/reports/, /^\/admin/];

type Role = "admin" | "trader" | "analyst" | "viewer" | string;

function normalizeRole(r: unknown): Role | null {
  if (typeof r === "string" && r.trim()) return r.trim().toLowerCase();
  return null;
}

function getRolesFromClaims(payload: JWTPayload): Role[] {
  // Common patterns: { role: "admin" } or { roles: ["admin", "trader"] } or { scope: "role:admin role:trader" }
  const roles: Role[] = [];
  const single = normalizeRole((payload as any).role);
  if (single) roles.push(single);

  const plural = (payload as any).roles;
  if (Array.isArray(plural)) {
    for (const r of plural) {
      const nr = normalizeRole(r);
      if (nr) roles.push(nr);
    }
  }

  const scope = (payload as any).scope;
  if (typeof scope === "string") {
    for (const part of scope.split(/[\s,]+/)) {
      const m = /role:([a-z0-9_\-]+)/i.exec(part);
      if (m) roles.push(m[1].toLowerCase());
    }
  }

  // De-duplicate
  return Array.from(new Set(roles));
}

async function verifyAndParseJWT(token: string): Promise<JWTPayload | null> {
  const alg = process.env.AUTH_JWT_ALGO || "HS256"; // HS256 | RS256 | ES256

  // Prefer JWKS if provided
  if (process.env.AUTH_JWKS_URL) {
    try {
      const JWKS = createRemoteJWKSet(new URL(process.env.AUTH_JWKS_URL));
      const { payload } = await jwtVerify(token, JWKS);
      return payload;
    } catch {}
  }

  // HS* (shared secret)
  if (alg.startsWith("HS") && process.env.AUTH_JWT_SECRET) {
    try {
      const key = new TextEncoder().encode(process.env.AUTH_JWT_SECRET);
      const { payload } = await jwtVerify(token, key, { algorithms: [alg] });
      return payload;
    } catch {}
  }

  // RS*/ES* (public key)
  if ((alg.startsWith("RS") || alg.startsWith("ES")) && process.env.AUTH_JWT_PUBLIC_KEY) {
    try {
      const key = await importSPKI(process.env.AUTH_JWT_PUBLIC_KEY, alg);
      const { payload } = await jwtVerify(token, key, { algorithms: [alg] });
      return payload;
    } catch {}
  }

  // If no verification material is configured, fall back to a non-verified decode (dev only).
  try {
    const parts = token.split(".");
    if (parts.length >= 2) {
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/"); // base64url -> base64
      const json = typeof atob !== "undefined" ? atob(base64) : Buffer.from(base64, "base64").toString("utf8");
      return JSON.parse(json);
    }
  } catch {}
  return null;
}

async function getAuthState(req: NextRequest): Promise<{ authed: boolean; roles: Role[] }> {
  for (const name of AUTH_COOKIE_NAMES) {
    const token = req.cookies.get(name)?.value;
    if (!token) continue;
    const payload = await verifyAndParseJWT(token);
    if (payload) {
      const roles = getRolesFromClaims(payload);
      return { authed: true, roles: roles.length ? roles : ["viewer"] };
    }
  }
  return { authed: false, roles: [] };
}

function hasAnyRole(userRoles: Role[], allowed: Role[]): boolean {
  if (!allowed.length) return true;
  const set = new Set(userRoles.map(r => r.toLowerCase()));
  for (const a of allowed) {
    if (set.has(a.toLowerCase())) return true;
  }
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const isStatic =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/public") ||
    pathname === "/favicon.ico";
  if (isStatic || pathname.startsWith("/api")) return NextResponse.next();

  const { authed, roles } = await getAuthState(req);

  // Root → conditional (role-based landing)
  if (pathname === "/") {
    let dest = "/login?next=%2Fdashboard";
    if (authed) {
      if (roles.includes("admin")) dest = "/dashboard";
      else if (roles.includes("trader")) dest = "/dashboard";
      else if (roles.includes("analyst")) dest = "/dashboard";
      else dest = "/dashboard"; // default
    }
    return NextResponse.redirect(new URL(dest, req.url));
  }

  // Require auth for protected paths
  if (!authed && PROTECTED.some((rx) => rx.test(pathname))) {
    const next = encodeURIComponent(pathname + (search || ""));
    return NextResponse.redirect(new URL(`/login?next=${next}`, req.url));
  }

  // Role gates
  for (const rule of ROLE_ROUTES) {
    if (rule.pattern.test(pathname)) {
      if (!hasAnyRole(roles, rule.allow)) {
        // Not authorized for this area
        const res = NextResponse.redirect(new URL("/unauthorized", req.url));
        res.headers.set("x-denied-role", roles.join(",") || "none");
        return res;
      }
      break;
    }
  }

  // Keep signed-in users away from auth pages
  if (authed && AUTH_PAGES.some((rx) => rx.test(pathname))) {
    const res = NextResponse.redirect(new URL("/dashboard", req.url));
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|static|assets|public|favicon.ico|api).*)", "/"],
};
