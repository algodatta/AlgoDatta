export const apiBase = () => {
  if (process.env.NEXT_PUBLIC_API_BASE) return process.env.NEXT_PUBLIC_API_BASE;
  return "https://api.algodatta.com";
};

function getCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : "";
}

export const getToken = (): string => {
  if (typeof window === "undefined") return "";
  return (localStorage.getItem("token") || getCookie("token") || "");
};

export const setToken = (t: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", t);
    const maxAge = 60 * 60 * 6;
    document.cookie = `token=${t}; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure`;
  }
};

export const clearToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    document.cookie = "token=; Path=/; Max-Age=0; SameSite=Lax; Secure";
  }
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
  if (res.status === 401) clearToken();
  return res;
}
