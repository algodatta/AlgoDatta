// Unified API helpers used by pages and components
// Exports: apiBase, getToken, authHeaders, apiFetch, jsonFetch, and default apiFetch

export const apiBase =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "";

// SSR/browser guard
export const isBrowser = typeof window !== "undefined";

export function getToken(): string | null {
  if (!isBrowser) return null;
  try {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("token") ||
      null
    );
  } catch {
    return null;
  }
}

export function authHeaders(extra?: HeadersInit): HeadersInit {
  const base = new Headers();
  base.set("Content-Type", "application/json");

  // Merge caller's headers first, so we don't lose them
  if (extra) new Headers(extra).forEach((v, k) => base.set(k, v));

  const token = getToken();
  if (token && !base.has("Authorization")) {
    base.set("Authorization", `Bearer ${token}`);
  }
  return base;
}

function mergeHeaders(a?: HeadersInit, b?: HeadersInit): HeadersInit {
  const h = new Headers(a || {});
  new Headers(b || {}).forEach((v, k) => h.set(k, v));
  return h;
}

export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const base = apiBase || "";
  const url = input.startsWith("http") ? input : `${base}${input}`;
  const headers = mergeHeaders(init.headers, authHeaders());

  const opts: RequestInit = {
    ...init,
    headers,
    credentials: init.credentials ?? "include",
    cache: init.cache ?? "no-store",
  };

  return fetch(url, opts);
}

export async function jsonFetch<T = any>(input: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(input, init);
  const ctype = res.headers.get("content-type") || "";
  const body = ctype.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    const detail =
      (typeof body === "object" && body && (body as any).detail) ||
      (typeof body === "string" ? body : `HTTP ${res.status}`);
    throw new Error(String(detail));
  }
  return body as T;
}

// Also provide a default export for legacy imports
export default apiFetch;
