// Lightweight API helper for Next.js (App Router).
// Exports: apiBase, getToken, authHeaders, apiFetch (+ JSON helpers).

export const apiBase: string = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

/** Build an absolute URL when a relative path is provided. */
function buildUrl(path: string): string {
  if (!path) return apiBase || "";
  // If already absolute, leave it
  if (/^https?:\/\//i.test(path)) return path;
  // Join with base when provided, otherwise use same-origin relative
  if (apiBase) {
    const p = path.startsWith("/") ? path : `/${path}`;
    return `${apiBase}${p}`;
  }
  return path;
}

/** Read token from browser storage safely (client-side only). */
export function getToken(): string | null {
  try {
    if (typeof window === "undefined") return null;
    const fromLocal = window.localStorage?.getItem("token");
    const fromSession = window.sessionStorage?.getItem("token");
    return fromLocal || fromSession || null;
  } catch {
    return null;
  }
}

/** Construct Authorization + JSON headers. You can pass extra headers to merge. */
export function authHeaders(extra?: HeadersInit): HeadersInit {
  const base: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getToken();
  if (token) base["Authorization"] = `Bearer ${token}`;

  if (extra) {
    // Normalize and merge any incoming headers
    try {
      const merged = new Headers(extra as any);
      merged.forEach((value, key) => {
        base[key] = value;
      });
    } catch {
      // Fallback for environments without Headers constructor (unlikely in Next 14+)
      if (typeof extra === "object") {
        Object.assign(base, extra as any);
      }
    }
  }
  return base;
}

export type ApiFetchInit = RequestInit & { absolute?: boolean };

/** Fetch wrapper that returns a standard Response with auth + JSON headers applied. */
export async function apiFetch(path: string, init?: ApiFetchInit): Promise<Response> {
  const url = init?.absolute ? path : buildUrl(path);
  // Merge headers, but allow explicit override via init.headers
  const headers = authHeaders(init?.headers as HeadersInit);
  const opts: RequestInit = {
    // sensible defaults
    credentials: "include",
    ...init,
    headers,
  };
  return fetch(url, opts);
}

/** Convenience helper: fetch + parse JSON, throwing on non-2xx responses. */
export async function apiJson<T = any>(path: string, init?: ApiFetchInit): Promise<T> {
  const res: Response = await apiFetch(path, init);
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const err: any = new Error(`HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data as T;
}

export function apiGet<T = any>(path: string, init?: ApiFetchInit) {
  return apiJson<T>(path, { ...init, method: "GET" });
}
export function apiPost<T = any>(path: string, body?: any, init?: ApiFetchInit) {
  return apiJson<T>(path, { ...init, method: "POST", body: body == null ? undefined : JSON.stringify(body) });
}
export function apiPut<T = any>(path: string, body?: any, init?: ApiFetchInit) {
  return apiJson<T>(path, { ...init, method: "PUT", body: body == null ? undefined : JSON.stringify(body) });
}
export function apiDelete<T = any>(path: string, init?: ApiFetchInit) {
  return apiJson<T>(path, { ...init, method: "DELETE" });
}

// Optional default export for convenience
export default apiFetch;
