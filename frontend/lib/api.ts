export async function api<T = any>(path: string, init?: RequestInit): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_BASE || "";
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: any = { "Content-Type": "application/json", ...(init?.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(base + path, { cache: "no-store", ...init, headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
