export const apiBase: string = process.env.NEXT_PUBLIC_API_BASE ?? '';

export function getToken(): string {
  if (typeof window === 'undefined') return '';
  try { return localStorage.getItem('token') ?? ''; } catch { return ''; }
}

export function authHeaders(extra?: Record<string,string>) {
  const t = getToken();
  const h: Record<string,string> = { 'Content-Type': 'application/json', ...(extra ?? {}) };
  if (t) h['Authorization'] = `Bearer ${t}`;
  return h;
}
