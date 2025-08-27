'use client';

export const TOKEN_COOKIE = 'ad_token';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

export function getToken(): string | null {
  const c = getCookie(TOKEN_COOKIE);
  if (c) return c;
  try { return localStorage.getItem(TOKEN_COOKIE); } catch { return null; }
}

export function setToken(token: string, maxDays = 7) {
  try { localStorage.setItem(TOKEN_COOKIE, token); } catch {}
  const maxAge = maxDays * 24 * 60 * 60;
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure`;
}

export function clearToken() {
  try { localStorage.removeItem(TOKEN_COOKIE); } catch {}
  document.cookie = `${TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax; Secure`;
}
