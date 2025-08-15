// Simple API helpers
export const apiBase = () => process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export const getToken = () => (typeof window !== 'undefined') ? localStorage.getItem("token") || "" : "";

export const setToken = (t:string) => { if(typeof window!=='undefined') localStorage.setItem("token", t); };

export const authHeaders = () => {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};
