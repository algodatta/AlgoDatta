export const apiBase = () => {
  // Prefer explicit base via env; fallback to dedicated API domain (not website)
  if (process.env.NEXT_PUBLIC_API_BASE) return process.env.NEXT_PUBLIC_API_BASE;
  return "https://api.algodatta.com";
};

export const getToken = (): string => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") || "";
};

export const setToken = (t: string) => {
  if (typeof window !== "undefined") localStorage.setItem("token", t);
};

export const clearToken = () => {
  if (typeof window !== "undefined") localStorage.removeItem("token");
};

export const authHeaders = (): Record<string, string> => {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};

export async function apiFetch(path: string, init: RequestInit = {}) {
  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers || {}), ...authHeaders() },
  });
  if (res.status === 401) {
    // token invalid or expired
    clearToken();
  }
  return res;
}
