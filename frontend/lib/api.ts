
export const apiBase = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/$/, "");

export async function login(email: string, password: string): Promise<{ok: boolean; error?: string}> {
  try {
    const res = await fetch(`${apiBase}/api/auth/login`, {
      method: "POST",
      headers: {"content-type":"application/json"},
      body: JSON.stringify({email, password})
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: false, error: data?.detail || data?.message || `HTTP ${res.status}`};
    }
    const data = await res.json();
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("algodatta_token", data.access_token);
    }
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Network error" };
  }
}
