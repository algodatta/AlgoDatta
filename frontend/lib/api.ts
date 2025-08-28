// frontend/lib/api.ts

export async function logout() {
  // Try server-side logout (if your backend exposes it)
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    // ignore network/endpoint absence
  }
  // Always clear the client-visible auth cookie used by the frontend guard
  clearAuthCookie();
}
// Base URL (configurable via env)
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || 'https://api.algodatta.com';

// --- cookie helpers used by guards/pages
export function getClientToken(): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(/(?:^|;\s*)algodatta_auth=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}
export function setClientToken(token: string, maxAgeSeconds = 60 * 60) {
  if (typeof document === 'undefined') return;
  document.cookie = `algodatta_auth=${encodeURIComponent(
    token
  )}; Path=/; Max-Age=${maxAgeSeconds}; Secure; SameSite=Lax`;
}
export function clearClientToken() {
  if (typeof document === 'undefined') return;
  document.cookie = `algodatta_auth=; Path=/; Max-Age=0; Secure; SameSite=Lax`;
}


// URL helper
export function apiUrl(path: string) {
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

/* ==== Back-compat re-exports (keep older pages compiling) ==== */
export const apiBase = API_BASE;          // old name
export const getToken = getClientToken;   // old name
// ────────────────────────────────────────────────────────────────────────────────
// Small utils
async function asJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = "";
    try {
      detail = (await res.json())?.detail ?? (await res.text());
    } catch {}
    throw new Error(`${res.status} ${res.statusText}${detail ? ` — ${detail}` : ""}`);
  }
  return res.json() as Promise<T>;
}

function setAuthCookie(token: string, maxAgeSeconds = 60 * 60 * 8) {
  if (typeof document === "undefined") return;
  document.cookie = `algodatta_token=${token}; Max-Age=${maxAgeSeconds}; Path=/; Secure; SameSite=Lax`;
}

export function clearAuthCookie() {
  if (typeof document === "undefined") return;
  document.cookie = "algodatta_token=; Max-Age=0; Path=/; Secure; SameSite=Lax";
}

// Parse a cookie value by name (safe on client & during build)
function getCookie(name: string, cookieStr?: string): string | null {
  const source =
    cookieStr ??
    (typeof document !== "undefined" ? document.cookie : "") ??
    "";
  const match = source.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

// Public helper: get the JWT (used by some client pages)
export function getToken(): string | null {
  return getCookie("algodatta_token");
}

// Public helper: Authorization headers (used by some client pages)
export function authHeaders(extra?: Record<string, string>) {
  const t = getToken();
  return {
    ...(extra ?? {}),
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
  };
}
// Auth header factory (client-side)
export function authHeaders(init: HeadersInit = {}): HeadersInit {
  const t = getClientToken();
  return t ? { ...init, Authorization: `Bearer ${t}` } : init;
}

// Backward-compat alias for older pages
export const apiBase = API_BASE;

// ────────────────────────────────────────────────────────────────────────────────
// Auth API (with sensible fallbacks so we work with your FastAPI layout)
export async function login(identifier: string, password: string) {
  const headersJson = { "Content-Type": "application/json" };
  const payload = { email: identifier, username: identifier, password };

  // 1) JSON login
  let res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: headersJson,
    body: JSON.stringify(payload),
    credentials: "include",
  });
  if (res.ok) {
    const data = await res.json();
    const token =
      data.access_token || data.token || data.jwt || data?.data?.access_token;
    if (!token) throw new Error("Login succeeded but no token was returned.");
    setAuthCookie(token);
    return data;
  }

  // 2) OAuth2 form style
  const form = new URLSearchParams({ username: identifier, password });
  res = await fetch(`${API_BASE}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
    credentials: "include",
  });
  if (res.ok) {
    const data = await res.json();
    const token = data.access_token || data.token;
    if (!token) throw new Error("Token endpoint returned no token.");
    setAuthCookie(token);
    return data;
  }

  // 3) Versioned path
  res = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: "POST",
    headers: headersJson,
    body: JSON.stringify(payload),
    credentials: "include",
  });
  if (res.ok) {
    const data = await res.json();
    const token = data.access_token || data.token;
    if (!token) throw new Error("Login succeeded but no token was returned.");
    setAuthCookie(token);
    return data;
  }

  const text = await res.text();
  throw new Error(`Login failed: ${text}`);
}

export async function signup(input: {
  email: string;
  username?: string;
  password: string;
}) {
  const body = JSON.stringify(input);
  const headers = { "Content-Type": "application/json" };

  for (const path of ["/auth/register", "/users", "/api/v1/auth/register"]) {
    const res = await fetch(`${API_BASE}${path}`, { method: "POST", headers, body });
    if (res.ok) return asJson(res);
  }
  throw new Error("Unable to sign up.");
}

export async function requestPasswordReset(email: string) {
  const headers = { "Content-Type": "application/json" };
  const body = JSON.stringify({ email });
  for (const path of [
    "/auth/password/forgot",
    "/auth/forgot-password",
    "/api/v1/auth/forgot-password",
  ]) {
    const res = await fetch(`${API_BASE}${path}`, { method: "POST", headers, body });
    if (res.ok) return asJson(res);
  }
  throw new Error("Unable to request password reset.");
}

export async function resetPassword(payload: { token: string; password: string }) {
  const headers = { "Content-Type": "application/json" };
  const body = JSON.stringify(payload);
  for (const path of [
    "/auth/password/reset",
    "/auth/reset-password",
    "/api/v1/auth/reset-password",
  ]) {
    const res = await fetch(`${API_BASE}${path}`, { method: "POST", headers, body });
    if (res.ok) return asJson(res);
  }
  throw new Error("Unable to reset password.");
}
