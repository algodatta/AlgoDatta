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
