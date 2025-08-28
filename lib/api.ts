/**
 * Shared API utilities for the Next.js app.
 * Provides: apiBase, getToken, authHeaders, apiFetch (Response),
 * and helpers apiJson/apiGet/apiPost/apiPut/apiDelete.
 */

export const apiBase: string =
  (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");

/** Best-effort token lookup on the client side (localStorage + cookie). */
export function getToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const keys = ["algodatta_token", "token", "access_token"];
    for (const k of keys) {
      const v = window.localStorage?.getItem(k);
      if (v && v !== "null" && v !== "undefined") {
        return v.replace(/^"|"$/g, "");
      }
    }
  } catch {}
  // cookie fallback
  try {
    const m = document.cookie?.match(/(?:^|;\s*)token=([^;]+)/);
    if (m) return decodeURIComponent(m[1]);
  } catch {}
  return undefined;
}

/** Build Authorization + JSON headers; merges any provided headers. */
export function authHeaders(extra?: HeadersInit): HeadersInit {
  const headers = new Headers(extra as any);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
}

/**
 * Fetch wrapper that always returns a real Response.
 * Uses same-origin unless NEXT_PUBLIC_API_BASE_URL is set to an absolute base.
 */
export async function apiFetch(
  input: string | URL | Request,
  init?: RequestInit
): Promise<Response> {
  // Work out the URL string
  let target: string;
  if (typeof input === "string" || input instanceof URL) {
    target = input.toString();
  } else {
    target = input.url;
  }

  // Prefix with apiBase if provided and 'target' isn't absolute
  const isAbsolute = /^https?:\/\//i.test(target);
  const finalUrl =
    isAbsolute || target.startsWith("/") || !apiBase
      ? target
      : `${apiBase}${target.startsWith("/") ? "" : "/"}${target}`;

  const opts: RequestInit = {
    ...init,
    headers: authHeaders(init?.headers as HeadersInit),
    credentials: "include",
  };

  return fetch(finalUrl, opts);
}

/** Parse JSON and throw on !ok with message from 'detail' if present. */
export async function apiJson<T = any>(
  input: string | URL | Request,
  init?: RequestInit
): Promise<T> {
  const res: Response = await apiFetch(input, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      (data && (data.detail || data.message)) ||
      res.statusText ||
      "Request failed";
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }
  return data as T;
}

// Small helpers
export const apiGet = <T = any>(path: string, init?: RequestInit) =>
  apiJson<T>(path, { ...init, method: "GET" });

export const apiPost = <T = any>(path: string, body?: any, init?: RequestInit) =>
  apiJson<T>(path, {
    ...init,
    method: "POST",
    body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
  });

export const apiPut = <T = any>(path: string, body?: any, init?: RequestInit) =>
  apiJson<T>(path, {
    ...init,
    method: "PUT",
    body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
  });

export const apiDelete = <T = any>(path: string, init?: RequestInit) =>
  apiJson<T>(path, { ...init, method: "DELETE" });
