export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, { cache: 'no-store', ...init });
  let body: any = null;
  try { body = await r.json(); } catch { body = null; }
  if (!r.ok) {
    const msg = (body && (body.detail || body.message)) || `Request failed: ${r.status}`;
    throw new Error(msg);
  }
  return body as T;
}
