type Json = Record<string, unknown> | Array<unknown> | string | number | boolean | null;

function join(base: string, path: string) {
  const b = base.replace(/\/+$/g, "");
  const p = path.replace(/^\/+/, "");
  return `${b}/${p}`;
}

/**
 * Simple fetch wrapper:
 * - Uses NEXT_PUBLIC_API_BASE_URL if provided; otherwise defaults to "/api"
 * - Sends/receives cookies
 * - Throws on non-2xx with response text for easier debugging
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit & { json?: Json } = {}
): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";
  const url = join(base, path);

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  };

  const body =
    options.json !== undefined ? JSON.stringify(options.json) : (options.body as BodyInit | null);

  const res = await fetch(url, {
    method: options.method ?? (options.json ? "POST" : "GET"),
    headers,
    body,
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status} ${res.statusText}${text ? `: ${text}` : ""}`);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }
  return (await res.text()) as unknown as T;
}
