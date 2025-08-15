export const apiBase = () =>
  process.env.NEXT_PUBLIC_API_BASE ||
  (typeof window !== "undefined" ? window.location.origin : "https://algodatta.com");

export const getToken = () =>
  (typeof window !== "undefined" ? localStorage.getItem("token") || "" : "");

export const setToken = (t: string) => {
  if (typeof window !== "undefined") localStorage.setItem("token", t);
};

export const authHeaders = (): Record<string, string> => {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};
