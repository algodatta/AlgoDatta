export const apiBase: string =
  (process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/+$/, '');

export function apiUrl(path: string) {
  const p = path.startsWith('/api') ? path : `/api${path.startsWith('/') ? path : `/${path}`}`;
  return `${apiBase}${p}`;
}

export function getToken(): string {
  if (typeof window === 'undefined') return '';
  try { return localStorage.getItem('token') ?? ''; } catch { return ''; }
}

export function authHeaders(extra?: Record<string, string>) {
  const t = getToken();
  const h: Record<string,string> = { 'Content-Type': 'application/json', ...(extra ?? {}) };
  if (t) h['Authorization'] = `Bearer ${t}`;
  return h;
}

export function getRole(): string {
  if (typeof window === 'undefined') return '';
  const t = getToken();
  if (!t || !t.includes('.')) return '';
  try {
    const payloadSeg = t.split('.')[1];
    const pad = '='.repeat((4 - (payloadSeg.length % 4)) % 4);
    const base64 = (payloadSeg + pad).replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(typeof atob === 'function'
      ? atob(base64)
      : (typeof Buffer !== 'undefined'
          ? Buffer.from(base64, 'base64').toString('binary')
          : ''));
    return (
      json?.role ??
      (Array.isArray(json?.roles) ? json.roles[0] : '') ??
      json?.['https://algodatta.com/role'] ??
      ''
    );
  } catch { return ''; }
}
