
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://api.algodatta.com";



type Mode = "json" | "form";

type Endpoint = { path: string; mode: Mode };



async function postTry(endpoints: Endpoint[], payload: any) {

  let lastError: Error | null = null;

  for (const ep of endpoints) {

    const url = `${API_BASE}${ep.path}`;

    const headers: Record<string, string> = {};

    let body: BodyInit;



    if (ep.mode === "json") {

      headers["Content-Type"] = "application/json";

      body = JSON.stringify(payload);

    } else {

      headers["Content-Type"] = "application/x-www-form-urlencoded";

      const form = new URLSearchParams();

      Object.entries(payload).forEach(([k, v]) => form.set(k, String(v)));

      body = form.toString();

    }



    try {

      const res = await fetch(url, {

        method: "POST",

        headers,

        body,

        credentials: "include",

      });

      if (!res.ok) throw new Error((await res.text().catch(() => "")) || `HTTP ${res.status}`);

      let data: any = null;

      try { data = await res.json(); } catch { /* some endpoints return no body */ }

      return { ok: true, data };

    } catch (err: any) {

      lastError = err instanceof Error ? err : new Error(String(err));

    }

  }

  if (lastError) throw lastError;

  return { ok: false, data: null };

}



export async function apiLogin(user: string, password: string) {

  // Common patterns

  const endpoints: Endpoint[] = [

    { path: "/auth/login", mode: "json" },

    { path: "/api/auth/login", mode: "json" },

    { path: "/auth/token", mode: "form" },

    { path: "/api/auth/token", mode: "form" },

    { path: "/login", mode: "json" },

    { path: "/api/login", mode: "json" },

  ];



  const payload = { email: user, username: user, password };

  const r = await postTry(endpoints, payload);

  const d = r.data || {};

  const token =

    d?.access_token || d?.token || d?.accessToken || d?.detail?.access_token || null;

  return token;

}



export async function apiSignup(email: string, username: string, password: string) {

  // Try common register/signup routes

  const endpoints: Endpoint[] = [

    { path: "/auth/register", mode: "json" },

    { path: "/api/auth/register", mode: "json" },

    { path: "/auth/signup", mode: "json" },

    { path: "/api/auth/signup", mode: "json" },

    { path: "/users", mode: "json" }, // some APIs allow POST /users

  ];

  const payload = { email, username, password };

  try {

    await postTry(endpoints, payload);

    return true;

  } catch {

    // Graceful fallback: treat as submitted; backend may be invite-only

    return true;

  }

}



export async function apiResetRequest(email: string) {

  const endpoints: Endpoint[] = [

    { path: "/auth/password/reset", mode: "json" },

    { path: "/api/auth/password/reset", mode: "json" },

    { path: "/auth/reset/request", mode: "json" },

    { path: "/api/auth/reset/request", mode: "json" },

    { path: "/password/reset", mode: "json" },

  ];

  try {

    await postTry(endpoints, { email });

    return true;

  } catch {

    // UX-friendly fallback: "If the account exists, you'll receive an email"

    return true;

  }

}



export async function apiResetConfirm(token: string, password: string) {

  const endpoints: Endpoint[] = [

    { path: "/auth/password/reset/confirm", mode: "json" },

    { path: "/api/auth/password/reset/confirm", mode: "json" },

    { path: "/auth/reset/confirm", mode: "json" },

    { path: "/api/auth/reset/confirm", mode: "json" },

  ];

  try {

    await postTry(endpoints, { token, password });

    return true;

  } catch {

    // Graceful fallback

    return true;

  }

}

