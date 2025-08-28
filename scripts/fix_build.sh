#!/usr/bin/env bash
set -euo pipefail

echo "==> Writing lib/api.ts with proper named + default exports..."
cat > lib/api.ts <<'TS'
// Unified API helpers used across the app.
// Exports: apiBase, isBrowser, getToken, authHeaders, apiFetch (default & named), jsonFetch.

export const apiBase: string =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "";

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
  const out = new Headers(extra || {});
  if (!out.has("Content-Type")) out.set("Content-Type", "application/json");
  const token = getToken();
  if (token && !out.has("Authorization")) out.set("Authorization", `Bearer ${token}`);
  return out;
}

function mergeHeaders(a?: HeadersInit, b?: HeadersInit): HeadersInit {
  const h = new Headers(a || {});
  new Headers(b || {}).forEach((v, k) => h.set(k, v));
  return h;
}

export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const url = input.startsWith("http") ? input : `${apiBase}${input}`;
  const headers = mergeHeaders(init.headers, authHeaders());
  return fetch(url, {
    ...init,
    headers,
    credentials: init.credentials ?? "include",
    cache: init.cache ?? "no-store",
  });
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

// keep legacy default import support
export default apiFetch;
TS

echo "==> Patching app/admin/page.tsx to type the Response..."
# Works on GNU sed (Git Bash) and macOS sed
if sed --version >/dev/null 2>&1; then
  # GNU sed (Linux/Git Bash)
  sed -i 's/const res = await apiFetch/const res: Response = await apiFetch/' app/admin/page.tsx || true
else
  # BSD sed (macOS)
  sed -i '' 's/const res = await apiFetch/const res: Response = await apiFetch/' app/admin/page.tsx || true
fi

echo "==> Done."
