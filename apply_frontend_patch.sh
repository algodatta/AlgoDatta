#!/usr/bin/env bash
set -euo pipefail

FRONTEND_DIR="frontend"
if [ ! -d "$FRONTEND_DIR" ]; then
  echo "❌ Can't find $FRONTEND_DIR/ (run this from the repo root)"; exit 1
fi

# Decide where 'app' lives (works with either frontend/app/* or frontend/*)
if [ -d "$FRONTEND_DIR/app" ]; then
  APP_DIR="$FRONTEND_DIR/app"
else
  APP_DIR="$FRONTEND_DIR"
fi

mkdir -p "$FRONTEND_DIR/lib" "$FRONTEND_DIR/components" \
         "$APP_DIR/login" "$APP_DIR/signup" "$APP_DIR/reset"

# ------------------------ lib/api.ts (dedup + helpers) ------------------------
cat > "$FRONTEND_DIR/lib/api.ts" <<'TS'
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://api.algodatta.com";

/* ------------------------------- utils ------------------------------ */
async function asJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = "";
    try { detail = (await res.clone().json())?.detail ?? (await res.text()); } catch {}
    throw new Error(`${res.status} ${res.statusText}${detail ? ` — ${detail}` : ""}`);
  }
  return res.json() as Promise<T>;
}

function getCookie(name: string, cookieStr?: string): string | null {
  const source =
    cookieStr ??
    (typeof document !== "undefined" ? document.cookie : "") ??
    "";
  const match = source.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function getToken(): string | null {
  // Prefer new cookie name; fall back to legacy if present
  return getCookie("algodatta_auth") ?? getCookie("algodatta_token");
}

export function setClientToken(token: string, maxAgeSeconds = 60 * 60 * 8) {
  if (typeof document === "undefined") return;
  document.cookie = `algodatta_auth=${encodeURIComponent(token)}; Max-Age=${maxAgeSeconds}; Path=/; Secure; SameSite=Lax`;
}

export function clearClientToken() {
  if (typeof document === "undefined") return;
  document.cookie = "algodatta_auth=; Max-Age=0; Path=/; Secure; SameSite=Lax";
  document.cookie = "algodatta_token=; Max-Age=0; Path=/; Secure; SameSite=Lax";
}

export function apiUrl(path: string) {
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function authHeaders(init: HeadersInit = {}): HeadersInit {
  const t = getToken();
  return t ? { ...init, Authorization: `Bearer ${t}` } : init;
}

/* ------------------------ back-compat re-exports ------------------------ */
export const apiBase = API_BASE;

/* ----------------------------- Auth: Login ----------------------------- */
type LoginBody = { username?: string; email?: string; password: string };

export async function loginRequest(identity: string, password: string) {
  const tryJson = (url: string, body: LoginBody) =>
    fetch(apiUrl(url), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include",
    });

  const tryForm = (url: string) => {
    const fd = new URLSearchParams();
    fd.set("username", identity);
    fd.set("password", password);
    return fetch(apiUrl(url), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: fd.toString(),
      credentials: "include",
    });
  };

  const attempts = [
    () => tryJson("/auth/login", { username: identity, password }),
    () => tryJson("/api/v1/auth/login", { username: identity, password }),
    () => tryForm("/token"),
    () => tryForm("/login"),
  ] as const;

  let lastErr: string | undefined;
  for (const attempt of attempts) {
    try {
      const res = await attempt();
      let data: any = {};
      try { data = await res.clone().json(); } catch {}
      if (res.ok) {
        const token = data?.access_token ?? data?.accessToken ?? data?.token ?? data?.jwt ?? null;
        if (token) setClientToken(token);
        return { ok: true as const, data };
      }
      lastErr = data?.detail || data?.message || `${res.status} ${res.statusText}` || "Login failed";
    } catch (e: any) {
      lastErr = e?.message || "Network error";
    }
  }
  return { ok: false as const, error: lastErr || "Login failed" };
}

/* ----------------------------- Auth: Signup ---------------------------- */
type SignupBody = {
  email: string;
  password: string;
  username?: string;
  full_name?: string;
  name?: string;
};

export async function signupRequest(email: string, password: string, name?: string) {
  const body: SignupBody = { email, password };
  if (name) { body.username = name; body.full_name = name; body.name = name; }

  const attempts = [
    () => fetch(apiUrl("/auth/register"), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body), credentials: "include",
    }),
    () => fetch(apiUrl("/api/v1/auth/register"), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body), credentials: "include",
    }),
    () => fetch(apiUrl("/users"), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body), credentials: "include",
    }),
    () => fetch(apiUrl("/register"), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body), credentials: "include",
    }),
  ] as const;

  let lastErr: string | undefined;
  for (const attempt of attempts) {
    try {
      const res = await attempt();
      let data: any = {};
      try { data = await res.clone().json(); } catch {}
      if (res.ok || (res.status >= 200 && res.status < 300)) {
        const token = data?.access_token ?? data?.accessToken ?? data?.token ?? data?.jwt ?? null;
        if (token) setClientToken(token);
        return { ok: true as const, data };
      }
      lastErr = data?.detail || data?.message || `${res.status} ${res.statusText}` || "Signup failed";
    } catch (e: any) {
      lastErr = e?.message || "Network error";
    }
  }
  return { ok: false as const, error: lastErr || "Signup failed" };
}

/* --------------------------- Auth: Reset flows -------------------------- */
export async function requestPasswordReset(email: string) {
  const attempts = [
    () => fetch(apiUrl("/auth/request-password-reset"), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }), credentials: "include",
    }),
    () => fetch(apiUrl("/auth/forgot-password"), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }), credentials: "include",
    }),
    () => fetch(apiUrl("/password/forgot"), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }), credentials: "include",
    }),
  ] as const;
  for (const attempt of attempts) {
    try {
      const res = await attempt();
      if (res.ok) return { ok: true as const };
    } catch {}
  }
  return { ok: false as const, error: "Unable to request reset link" };
}

export async function resetPassword(token: string, newPassword: string) {
  const bodies = [
    { token, new_password: newPassword },
    { token, password: newPassword },
    { code: token, new_password: newPassword },
  ];
  const endpoints = ["/auth/reset-password", "/auth/reset", "/password/reset"];
  for (const body of bodies) {
    for (const ep of endpoints) {
      try {
        const res = await fetch(apiUrl(ep), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          credentials: "include",
        });
        if (res.ok) return { ok: true as const };
      } catch {}
    }
  }
  return { ok: false as const, error: "Unable to reset password" };
}
TS

# --------------------------- middleware.ts (guards) ---------------------------
cat > "$FRONTEND_DIR/middleware.ts" <<'TS'
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
TS

# ------------------------------- logout route -------------------------------
# Put under the correct App Router structure if available
LOGOUT_DIR="$APP_DIR/logout"
mkdir -p "$LOGOUT_DIR"
cat > "$LOGOUT_DIR/route.ts" <<'TS'
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
TS

# ----------------------------- components/Nav.tsx ----------------------------
cat > "$FRONTEND_DIR/components/Nav.tsx" <<'TS'
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/executions", label: "Executions" },
  { href: "/orders", label: "Orders" },
  { href: "/strategies", label: "Strategies" },
  { href: "/reports", label: "Reports" },
  { href: "/notifications", label: "Notifications" },
  { href: "/admin", label: "Admin" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
      {items.map((it) => {
        const active = pathname?.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            style={{
              padding:"8px 10px",
              borderRadius:8,
              border:"1px solid rgba(255,255,255,.12)",
              background: active ? "rgba(79,140,255,.2)" : "transparent",
              color:"#dbe7ff",
              textDecoration:"none",
              fontSize:13,
              fontWeight:600
            }}
          >
            {it.label}
          </Link>
        );
      })}
      <span style={{flex:1}} />
      <Link href="/logout" style={{color:"#ffb8b8",fontSize:13,fontWeight:700}}>Logout</Link>
    </nav>
  );
}
TS

# ------------------------------- login page ---------------------------------
cat > "$APP_DIR/login/page.tsx" <<'TS'
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginRequest } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextUrl, setNextUrl] = useState<string | null>(null);

  // parse ?next= without useSearchParams to avoid build issues
  useEffect(() => {
    if (typeof window !== "undefined") {
      const u = new URL(window.location.href);
      const nxt = u.searchParams.get("next");
      setNextUrl(nxt);
    }
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await loginRequest(identity.trim(), password);
    setLoading(false);
    if (res.ok) {
      router.push(nextUrl || "/dashboard");
      return;
    }
    setError(res.error || "Invalid credentials");
  }

  return (
    <main style={{minHeight:"100svh",display:"grid",placeItems:"center",background:"#0b1020"}}>
      <div style={{width:"100%",maxWidth:420,background:"rgba(255,255,255,0.06)",backdropFilter:"blur(6px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:16,padding:24,boxShadow:"0 10px 30px rgba(0,0,0,.4)"}}>
        <div style={{textAlign:"center",marginBottom:16}}>
          <img src="/logo.svg" alt="AlgoDatta" style={{height:36,objectFit:"contain"}} onError={(e)=>{(e.currentTarget as HTMLImageElement).style.display="none"}}/>
          <h1 style={{color:"#fff",fontSize:22,fontWeight:700,margin:"8px 0 0"}}>Welcome back</h1>
          <p style={{color:"rgba(255,255,255,0.7)",marginTop:6,fontSize:13}}>Please sign in to continue</p>
        </div>
        <form onSubmit={onSubmit} style={{display:"grid",gap:12}}>
          <label style={{display:"grid",gap:6}}>
            <span style={{color:"#cfd8dc",fontSize:12}}>Email or Username</span>
            <input value={identity} onChange={(e)=>setIdentity(e.target.value)} placeholder="you@company.com or username" autoComplete="username"
              style={{padding:"12px 14px",borderRadius:10,border:"1px solid #263043",background:"#11162a",color:"#e3f2fd",outline:"none"}} />
          </label>
          <label style={{display:"grid",gap:6}}>
            <span style={{color:"#cfd8dc",fontSize:12}}>Password</span>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Your password" autoComplete="current-password" required
              style={{padding:"12px 14px",borderRadius:10,border:"1px solid #263043",background:"#11162a",color:"#e3f2fd",outline:"none"}} />
          </label>
          {error && (
            <div style={{color:"#ff8a80",fontSize:12,background:"rgba(255,82,82,.15)",border:"1px solid rgba(255,82,82,.35)",padding:"8px 10px",borderRadius:8}}>
              {error}
            </div>
          )}
          <button type="submit" disabled={loading}
            style={{marginTop:4,background:"#4f8cff",border:"1px solid #2e6bff",color:"#fff",padding:"12px 14px",borderRadius:10,fontWeight:700,cursor:"pointer",opacity:loading?0.75:1}}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:12}}>
          <Link href="/signup" style={{color:"#9ec1ff",fontSize:13}}>Create account</Link>
          <Link href="/reset" style={{color:"#9ec1ff",fontSize:13}}>Forgot password?</Link>
        </div>
      </div>
    </main>
  );
}
TS

# ------------------------------ signup page ---------------------------------
cat > "$APP_DIR/signup/page.tsx" <<'TS'
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signupRequest, loginRequest } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signupRequest(email.trim(), pw, name.trim() || undefined);
    if (res.ok) {
      // Ensure login if backend doesn't return token on create
      const login = await loginRequest(email.trim(), pw);
      setLoading(false);
      if (login.ok) { router.push("/dashboard"); return; }
      router.push("/login?created=1");
      return;
    }
    setLoading(false);
    setError(res.error || "Unable to create account");
  }

  return (
    <main style={{minHeight:"100svh",display:"grid",placeItems:"center",background:"#0b1020"}}>
      <div style={{width:"100%",maxWidth:480,background:"rgba(255,255,255,0.06)",backdropFilter:"blur(6px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:16,padding:24,boxShadow:"0 10px 30px rgba(0,0,0,.4)"}}>
        <div style={{textAlign:"center",marginBottom:16}}>
          <img src="/logo.svg" alt="AlgoDatta" style={{height:36,objectFit:"contain"}} onError={(e)=>{(e.currentTarget as HTMLImageElement).style.display="none"}}/>
          <h1 style={{color:"#fff",fontSize:22,fontWeight:700,margin:"8px 0 0"}}>Create your account</h1>
          <p style={{color:"rgba(255,255,255,0.7)",marginTop:6,fontSize:13}}>Join in less than a minute</p>
        </div>
        <form onSubmit={onSubmit} style={{display:"grid",gap:12}}>
          <label style={{display:"grid",gap:6}}>
            <span style={{color:"#cfd8dc",fontSize:12}}>Name</span>
            <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Jane Doe"
              style={{padding:"12px 14px",borderRadius:10,border:"1px solid #263043",background:"#11162a",color:"#e3f2fd",outline:"none"}} />
          </label>
          <label style={{display:"grid",gap:6}}>
            <span style={{color:"#cfd8dc",fontSize:12}}>Email</span>
            <input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email"
              style={{padding:"12px 14px",borderRadius:10,border:"1px solid #263043",background:"#11162a",color:"#e3f2fd",outline:"none"}} />
          </label>
          <label style={{display:"grid",gap:6}}>
            <span style={{color:"#cfd8dc",fontSize:12}}>Password</span>
            <input type="password" required value={pw} onChange={(e)=>setPw(e.target.value)} placeholder="Create a strong password" autoComplete="new-password"
              style={{padding:"12px 14px",borderRadius:10,border:"1px solid #263043",background:"#11162a",color:"#e3f2fd",outline:"none"}} />
          </label>
          {error && (
            <div style={{color:"#ff8a80",fontSize:12,background:"rgba(255,82,82,.15)",border:"1px solid rgba(255,82,82,.35)",padding:"8px 10px",borderRadius:8}}>
              {error}
            </div>
          )}
          <button type="submit" disabled={loading}
            style={{marginTop:4,background:"#4f8cff",border:"1px solid #2e6bff",color:"#fff",padding:"12px 14px",borderRadius:10,fontWeight:700,cursor:"pointer",opacity:loading?0.75:1}}>
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:12}}>
          <Link href="/login" style={{color:"#9ec1ff",fontSize:13}}>Have an account? Sign in</Link>
          <Link href="/reset" style={{color:"#9ec1ff",fontSize:13}}>Forgot password?</Link>
        </div>
      </div>
    </main>
  );
}
TS

# ------------------------------- reset page ----------------------------------
cat > "$APP_DIR/reset/page.tsx" <<'TS'
"use client";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { requestPasswordReset, resetPassword } from "@/lib/api";

function ResetClient() {
  const params = useSearchParams();
  const router = useRouter();
  const token = useMemo(() => params.get("token") || params.get("code") || "", [params]);

  // Request link
  const [email, setEmail] = useState("");
  const [reqLoading, setReqLoading] = useState(false);
  const [reqMsg, setReqMsg] = useState<string | null>(null);
  const [reqErr, setReqErr] = useState<string | null>(null);

  // Perform reset
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [doLoading, setDoLoading] = useState(false);
  const [doErr, setDoErr] = useState<string | null>(null);

  async function submitRequest(e: React.FormEvent) {
    e.preventDefault();
    setReqMsg(null); setReqErr(null); setReqLoading(true);
    const res = await requestPasswordReset(email.trim());
    setReqLoading(false);
    if (res.ok) { setReqMsg("If the email exists, a reset link has been sent."); return; }
    setReqErr(res.error || "Unable to send reset link");
  }

  async function submitReset(e: React.FormEvent) {
    e.preventDefault();
    setDoErr(null);
    if (pw1.length < 6) { setDoErr("Password must be at least 6 characters"); return; }
    if (pw1 !== pw2) { setDoErr("Passwords do not match"); return; }
    setDoLoading(true);
    const res = await resetPassword(token, pw1);
    setDoLoading(false);
    if (res.ok) { router.push("/login?reset=1"); return; }
    setDoErr(res.error || "Unable to reset password");
  }

  return (
    <main style={{minHeight:"100svh",display:"grid",placeItems:"center",background:"#0b1020"}}>
      <div style={{width:"100%",maxWidth:480,background:"rgba(255,255,255,0.06)",backdropFilter:"blur(6px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:16,padding:24,boxShadow:"0 10px 30px rgba(0,0,0,.4)"}}>
        <div style={{textAlign:"center",marginBottom:16}}>
          <img src="/logo.svg" alt="AlgoDatta" style={{height:36,objectFit:"contain"}} onError={(e)=>{(e.currentTarget as HTMLImageElement).style.display="none"}}/>
          <h1 style={{color:"#fff",fontSize:22,fontWeight:700,margin:"8px 0 0"}}>
            {token ? "Set a new password" : "Reset your password"}
          </h1>
          <p style={{color:"rgba(255,255,255,0.7)",marginTop:6,fontSize:13}}>
            {token ? "Choose a new password for your account." : "We'll send a link to your email."}
          </p>
        </div>

        {!token ? (
          <form onSubmit={submitRequest} style={{display:"grid",gap:12}}>
            <label style={{display:"grid",gap:6}}>
              <span style={{color:"#cfd8dc",fontSize:12}}>Email</span>
              <input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email"
                style={{padding:"12px 14px",borderRadius:10,border:"1px solid #263043",background:"#11162a",color:"#e3f2fd",outline:"none"}} />
            </label>
            {reqErr && <div style={{color:"#ff8a80",fontSize:12,background:"rgba(255,82,82,.15)",border:"1px solid rgba(255,82,82,.35)",padding:"8px 10px",borderRadius:8}}>{reqErr}</div>}
            {reqMsg && <div style={{color:"#b9f6ca",fontSize:12,background:"rgba(76,175,80,.18)",border:"1px solid rgba(76,175,80,.35)",padding:"8px 10px",borderRadius:8}}>{reqMsg}</div>}
            <button type="submit" disabled={reqLoading}
              style={{marginTop:4,background:"#4f8cff",border:"1px solid #2e6bff",color:"#fff",padding:"12px 14px",borderRadius:10,fontWeight:700,cursor:"pointer",opacity:reqLoading?0.75:1}}>
              {reqLoading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        ) : (
          <form onSubmit={submitReset} style={{display:"grid",gap:12}}>
            <label style={{display:"grid",gap:6}}>
              <span style={{color:"#cfd8dc",fontSize:12}}>New password</span>
              <input type="password" required value={pw1} onChange={(e)=>setPw1(e.target.value)} placeholder="Enter a new password" autoComplete="new-password"
                style={{padding:"12px 14px",borderRadius:10,border:"1px solid #263043",background:"#11162a",color:"#e3f2fd",outline:"none"}} />
            </label>
            <label style={{display:"grid",gap:6}}>
              <span style={{color:"#cfd8dc",fontSize:12}}>Confirm password</span>
              <input type="password" required value={pw2} onChange={(e)=>setPw2(e.target.value)} placeholder="Re-type password" autoComplete="new-password"
                style={{padding:"12px 14px",borderRadius:10,border:"1px solid #263043",background:"#11162a",color:"#e3f2fd",outline:"none"}} />
            </label>
            {doErr && <div style={{color:"#ff8a80",fontSize:12,background:"rgba(255,82,82,.15)",border:"1px solid rgba(255,82,82,.35)",padding:"8px 10px",borderRadius:8}}>{doErr}</div>}
            <button type="submit" disabled={doLoading}
              style={{marginTop:4,background:"#4f8cff",border:"1px solid #2e6bff",color:"#fff",padding:"12px 14px",borderRadius:10,fontWeight:700,cursor:"pointer",opacity:doLoading?0.75:1}}>
              {doLoading ? "Saving…" : "Update password"}
            </button>
          </form>
        )}

        <div style={{display:"flex",justifyContent:"space-between",marginTop:12}}>
          <Link href="/login" style={{color:"#9ec1ff",fontSize:13}}>Back to login</Link>
          <Link href="/signup" style={{color:"#9ec1ff",fontSize:13}}>Create account</Link>
        </div>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div style={{color:"#fff",textAlign:"center"}}>Loading…</div>}>
      <ResetClient />
    </Suspense>
  );
}
TS

# ---------------------------- make a handy zip ----------------------------
ZIP="frontend_patch.zip"
rm -f "$ZIP"
# include only the files we wrote
tmpdir="$(mktemp -d)"
mkdir -p "$tmpdir/frontend"
cd "$FRONTEND_DIR"
tar cf "$tmpdir/frontend.tar" lib middleware.ts components -C "$APP_DIR" login signup reset -C "$APP_DIR" logout || true
cd - >/dev/null
tar xf "$tmpdir/frontend.tar" -C "$tmpdir/frontend" 2>/dev/null || true
cd "$tmpdir"
zip -r "../$ZIP" frontend >/dev/null
cd - >/dev/null
rm -rf "$tmpdir"

echo "✅ Patch applied. Created $ZIP"
