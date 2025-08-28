/**
 * Simple API helper used across the frontend.
 * Adjust NEXT_PUBLIC_API_BASE_URL in .env.* if your backend lives elsewhere.
 */
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "";

export type JsonInit = Omit<RequestInit, "body" | "headers"> & {
  headers?: HeadersInit;
  body?: unknown;
};

function asJson(init?: JsonInit): RequestInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init?.headers || {}),
  };
  const body =
    init && "body" in init && init.body !== undefined
      ? JSON.stringify(init.body)
      : undefined;
  return { ...init, headers, body, credentials: "include" };
}

export async function apiFetch<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path.startsWith("/") ? path : "/" + path}`;
  const res = await fetch(url, init);
  const isJson = (res.headers.get("content-type") || "").includes("application/json");

  if (!res.ok) {
    const errText = isJson ? JSON.stringify(await res.json()) : await res.text();
    throw new Error(`API ${res.status} ${res.statusText}: ${errText}`);
  }
  return (isJson ? await res.json() : (await res.text() as any)) as T;
}

export function apiGet<T = unknown>(path: string, init?: JsonInit) {
  return apiFetch<T>(path, asJson({ ...init, method: "GET" }));
}

export function apiPost<T = unknown>(path: string, body?: unknown, init?: JsonInit) {
  return apiFetch<T>(path, asJson({ ...init, method: "POST", body }));
}

export function apiPut<T = unknown>(path: string, body?: unknown, init?: JsonInit) {
  return apiFetch<T>(path, asJson({ ...init, method: "PUT", body }));
}

export function apiDelete<T = unknown>(path: string, init?: JsonInit) {
  return apiFetch<T>(path, asJson({ ...init, method: "DELETE" }));
}