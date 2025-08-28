
"use client";



import { useSearchParams, useRouter } from "next/navigation";

import { useState } from "react";



const apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://api.algodatta.com";



type Endpoint = { path: string; mode: "json" | "form" };



const ENDPOINTS: Endpoint[] = [

  { path: "/auth/login", mode: "json" },

  { path: "/api/auth/login", mode: "json" },

  { path: "/auth/token", mode: "form" },      // FastAPI OAuth2 (username/password form)

  { path: "/api/auth/token", mode: "form" },

  { path: "/login", mode: "json" },

  { path: "/api/login", mode: "json" },

];



async function attemptLogin(ep: Endpoint, email: string, password: string) {

  const url = `${apiBase}${ep.path}`;

  const headers: Record<string, string> = {};

  let body: BodyInit;



  if (ep.mode === "json") {

    headers["Content-Type"] = "application/json";

    // send both keys to satisfy either schema

    body = JSON.stringify({ email, username: email, password });

  } else {

    headers["Content-Type"] = "application/x-www-form-urlencoded";

    const form = new URLSearchParams();

    form.set("username", email);

    form.set("password", password);

    body = form.toString();

  }



  const res = await fetch(url, {

    method: "POST",

    headers,

    body,

    credentials: "include", // allow cookie-based auth too

  });



  if (!res.ok) {

    const text = await res.text().catch(() => "");

    const msg = text || `HTTP ${res.status}`;

    throw new Error(msg);

  }



  // Try to extract token if provided; if not, assume cookie auth is set.

  let token: string | null = null;

  try {

    const data = await res.json();

    token =

      data?.access_token ||

      data?.token ||

      data?.accessToken ||

      data?.detail?.access_token ||

      null;

  } catch {

    /* ignore if not JSON */

  }



  return token;

}



export default function LoginClient() {

  const router = useRouter();

  const sp = useSearchParams();

  const next = sp.get("next") || "/dashboard";



  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);

  const [error, setError] = useState<string | null>(null);



  const onSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    setBusy(true);

    setError(null);



    try {

      let token: string | null = null;

      let lastErr: Error | null = null;



      for (const ep of ENDPOINTS) {

        try {

          token = await attemptLogin(ep, email, password);

          lastErr = null;

          break;

        } catch (err: any) {

          lastErr = err instanceof Error ? err : new Error(String(err));

          continue;

        }

      }

      if (lastErr) throw lastErr;



      if (token) localStorage.setItem("token", token);

      // Either token stored or cookie set. Go to dashboard.

      router.replace(next);

    } catch (err: any) {

      setError(err?.message || "Login failed");

    } finally {

      setBusy(false);

    }

  };



  return (

    <main className="max-w-sm mx-auto p-6">

      <h1 className="text-2xl font-bold mb-4">Sign in</h1>

      <form onSubmit={onSubmit} className="space-y-3">

        <label className="block">

          <span className="text-sm">Email or username</span>

          <input

            type="text"

            required

            value={email}

            onChange={(e) => setEmail(e.target.value)}

            className="w-full border rounded p-2"

            placeholder="you@example.com"

          />

        </label>

        <label className="block">

          <span className="text-sm">Password</span>

          <input

            type="password"

            required

            value={password}

            onChange={(e) => setPassword(e.target.value)}

            className="w-full border rounded p-2"

            placeholder="your password"

          />

        </label>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button

          type="submit"

          disabled={busy}

          className="w-full border rounded p-2"

        >

          {busy ? "Signing in..." : "Sign in"}

        </button>

      </form>

    </main>

  );

}

