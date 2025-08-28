// frontend/lib/api.ts
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") || "https://api.algodatta.com";

// ----- Small helpers -----
async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = "";
    try { detail = (await res.json())?.detail ?? (await res.text()); } catch {}
    throw new Error(`${res.status} ${res.statusText}${detail ? ` — ${detail}` : ""}`);
  }
  return res.json() as Promise<T>;
}

function setAuthCookie(token: string, maxAgeSeconds = 60 * 60 * 8) {
  // Cookie read by middleware for route protection
  document.cookie =
    `algodatta_token=${token}; Max-Age=${maxAgeSeconds}; Path=/; Secure; SameSite=Lax`;
}

export function clearAuthCookie() {
  document.cookie = "algodatta_token=; Max-Age=0; Path=/; Secure; SameSite=Lax";
}

// ----- Endpoints with graceful fallbacks -----
// Login: tries common FastAPI styles so we don’t need to guess backend schema names.
export async function login(identifier: string, password: string) {
  const headersJson = { "Content-Type": "application/json" };

  // 1) JSON login — /auth/login
  const payload = { email: identifier, username: identifier, password };
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
    if (!token) throw new Error("Login succeeded but no token returned.");
    setAuthCookie(token);
    return data;
  }

  // 2) OAuth2 form — /auth/token
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

  // 3) Versioned path — /api/v1/auth/login
  res = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: "POST",
    headers: headersJson,
    body: JSON.stringify(payload),
    credentials: "include",
  });
  if (res.ok) {
    const data = await res.json();
    const token = data.access_token || data.token;
    if (!token) throw new Error("Login succeeded but no token returned.");
    setAuthCookie(token);
    return data;
  }

  // If we reached here: bubble up the last error text for debugging
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

  // /auth/register
  let res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers,
    body,
  });
  if (res.ok) return json(res);

  // /users (common in FastAPI templates)
  res = await fetch(`${API_BASE}/users`, { method: "POST", headers, body });
  if (res.ok) return json(res);

  // /api/v1/auth/register
  res = await fetch(`${API_BASE}/api/v1/auth/register`, {
    method: "POST",
    headers,
    body,
  });
  return json(res);
}

export async function requestPasswordReset(email: string) {
  const headers = { "Content-Type": "application/json" };
  const body = JSON.stringify({ email });

  // try common routes
  for (const path of [
    "/auth/password/forgot",
    "/auth/forgot-password",
    "/api/v1/auth/forgot-password",
  ]) {
    const res = await fetch(`${API_BASE}${path}`, { method: "POST", headers, body });
    if (res.ok) return json(res);
  }
  throw new Error("Unable to request password reset.");
}

export async function resetPassword(payload: {
  token: string;
  password: string;
}) {
  const headers = { "Content-Type": "application/json" };
  const body = JSON.stringify(payload);

  for (const path of [
    "/auth/password/reset",
    "/auth/reset-password",
    "/api/v1/auth/reset-password",
  ]) {
    const res = await fetch(`${API_BASE}${path}`, { method: "POST", headers, body });
    if (res.ok) return json(res);
  }
  throw new Error("Unable to reset password.");
}
