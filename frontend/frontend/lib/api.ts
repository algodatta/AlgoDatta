export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? '').replace(/\/$/, '');

function buildUrl(path: string): string {
  if (!path.startsWith('/')) path = '/' + path;
  return `${API_BASE}${path}`;
}

export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const url = buildUrl(path);

  const headers = new Headers({
    Accept: 'application/json',
    'Content-Type': 'application/json',
  });
  const initHeaders = init.headers instanceof Headers
    ? Object.fromEntries(init.headers.entries())
    : (init.headers as Record<string, string> | undefined);
  if (initHeaders) {
    for (const [k, v] of Object.entries(initHeaders)) headers.set(k, v);
  }

  let body = (init as any).body;
  if (body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Blob)) {
    body = JSON.stringify(body);
  }

  const res = await fetch(url, {
    credentials: 'include',
    ...init,
    headers,
    body,
  });

  const text = await res.text().catch(() => '');
  let data: any = undefined;
  try { data = text ? JSON.parse(text) : undefined; } catch { data = text; }

  if (!res.ok) {
    const msg =
      (data && typeof data === 'object' && 'detail' in data && (data as any).detail) ||
      (typeof data === 'string' ? data : '') ||
      res.statusText;
    throw new Error(`${res.status} ${res.statusText}${msg ? ': ' + msg : ''}`);
  }

  return (data as T) ?? ({} as T);
}
