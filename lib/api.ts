export const apiBase = () => {
  if (process.env.NEXT_PUBLIC_API_BASE) return process.env.NEXT_PUBLIC_API_BASE;
  return "https://api.algodatta.com";
};

function getCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : "";
}

/** Build Authorization & extra headers safely. */
export function authHeaders(extra?: HeadersInit): HeadersInit {
  const base: Record<string, string> = {};
  if (extra) {
    if (Array.isArray(extra)) {
      for (const [k, v] of extra) base[k] = String(v);
    } else if (extra instanceof Headers) {
      extra.forEach((v, k) => (base[k] = v));
    } else {
      Object.assign(base, extra as Record<string, string>);
    }
  }
  const tok = getToken();
  if (tok) base["Authorization"] = `Bearer ${tok}`;
  return base;
}

type ApiOptions = RequestInit & { json?: any };

function resolveUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/")) return path; // same-origin (e.g., Next proxy /api/*)
  return apiBase ? `${apiBase}/${path.replace(/^\/+/, "")}` : `/${path.replace(/^\/+/, "")}`;
}

/** Low-level fetch wrapper (typed). */
export async function apiFetch(path: string, opts: ApiOptions = {}): Promise<Response> {
  const url = resolveUrl(path);
  const headers: HeadersInit = {
    ...(opts.body || opts.json ? { "Content-Type": "application/json" } : {}),
    ...authHeaders(opts.headers),
  };
  const init: RequestInit = {
    ...opts,
    headers,
    ...(opts.json !== undefined
      ? { body: JSON.stringify(opts.json), method: opts.method ?? "POST" }
      : {}),
  };
  return fetch(url, init);
}

/** High-level helper that returns JSON (throws on non-2xx). */
export async function apiJson<T = any>(path: string, opts: ApiOptions = {}): Promise<T> {
  const res = await apiFetch(path, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data && (data.detail || data.message)) || res.statusText || "Request failed";
    throw new Error(msg);
  }
  return data as T;
}

export const apiGet = <T = any>(path: string, opts: ApiOptions = {}) =>
  apiJson<T>(path, { ...opts, method: "GET" });
export const apiPost = <T = any>(path: string, body?: any, opts: ApiOptions = {}) =>
  apiJson<T>(path, { ...opts, json: body, method: "POST" });
export const apiPut = <T = any>(path: string, body?: any, opts: ApiOptions = {}) =>
  apiJson<T>(path, { ...opts, json: body, method: "PUT" });
export const apiDelete = <T = any>(path: string, opts: ApiOptions = {}) =>
  apiJson<T>(path, { ...opts, method: "DELETE" });
