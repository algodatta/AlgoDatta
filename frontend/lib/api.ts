export const apiBase: string =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE) ||
  (typeof window !== 'undefined' ? window.location.origin : '');

export function getToken(): string {
  if (typeof window === 'undefined') return '';
  try { return localStorage.getItem('token') || ''; } catch { return ''; }
}

export function authHeaders(): Record<string,string> {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

/** Parse JSON + throw typed error details when available */
export async function jsonFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBase}${path}`, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = (data as any)?.detail ?? (data as any)?.message ?? res.statusText;
    throw new Error(typeof detail === 'string' ? detail : 'Request failed');
  }
  return data as T;
}

/** Low-level helper when you need the raw Response */
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${apiBase}${path}`, init);
}
