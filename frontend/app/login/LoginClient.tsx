
"use client";



import { useSearchParams, useRouter } from "next/navigation";

import { useState } from "react";



const apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://api.algodatta.com";



type Endpoint = { path: string; mode: "json" | "form" };

const ENDPOINTS: Endpoint[] = [

  { path: "/auth/login", mode: "json" },

  { path: "/api/auth/login", mode: "json" },

  { path: "/auth/token", mode: "form" },

  { path: "/api/auth/token", mode: "form" },

  { path: "/login", mode: "json" },

  { path: "/api/login", mode: "json" },

];



async function attemptLogin(ep: Endpoint, user: string, password: string) {

  const url = `${apiBase}${ep.path}`;

  const headers: Record<string, string> = {};

  let body: BodyInit;



  if (ep.mode === "json") {

    headers["Content-Type"] = "application/json";

    body = JSON.stringify({ email: user, username: user, password });

  } else {

    headers["Content-Type"] = "application/x-www-form-urlencoded";

    const form = new URLSearchParams();

    form.set("username", user);

    form.set("password", password);

    body = form.toString();

  }



  const res = await fetch(url, { method: "POST", headers, body, credentials: "include" });

  if (!res.ok) throw new Error((await res.text().catch(() => "")) || `HTTP ${res.status}`);



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

    /* ignore non-JSON */

  }



  return token;

}



export default function LoginClient() {

  const router = useRouter();

  const sp = useSearchParams();

  const next = sp.get("next") || "/dashboard";



  const [user, setUser] = useState("");

  const [password, setPassword] = useState("");

  const [showPw, setShowPw] = useState(false);

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

          token = await attemptLogin(ep, user, password);

          lastErr = null;

          break;

        } catch (err: any) {

          lastErr = err instanceof Error ? err : new Error(String(err));

        }

      }

      if (lastErr) throw lastErr;



      if (token) localStorage.setItem("token", token);

      // Set a front-end cookie (read by middleware) – 7 days.

      document.cookie = `ad_at=${encodeURIComponent(token || "1")}; Path=/; Max-Age=604800; SameSite=Lax; Secure`;



      router.replace(next);

    } catch (err: any) {

      setError(err?.message || "Login failed");

    } finally {

      setBusy(false);

    }

  };



  return (

    <main className="min-h-[calc(100vh-0px)] flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-md">

        <div className="bg-white/80 backdrop-blur border border-slate-200 rounded-2xl shadow-xl overflow-hidden">

          <div className="p-6 sm:p-8">

            <div className="mb-6 text-center">

              <div className="mx-auto h-12 w-12 rounded-full bg-slate-900 text-white grid place-items-center text-xl font-bold">A</div>

              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">Welcome back</h1>

              <p className="mt-1 text-sm text-slate-500">Sign in to continue</p>

            </div>



            <form onSubmit={onSubmit} className="space-y-4">

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-1">Email or Username</label>

                <input

                  type="text"

                  inputMode="email"

                  autoComplete="username"

                  required

                  value={user}

                  onChange={(e) => setUser(e.target.value)}

                  className="w-full rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 px-3 py-2 outline-none transition"

                  placeholder="you@example.com or username"

                />

              </div>



              <div>

                <div className="flex items-center justify-between mb-1">

                  <label className="block text-sm font-medium text-slate-700">Password</label>

                  <label className="flex items-center gap-2 text-xs text-slate-500 select-none cursor-pointer">

                    <input

                      type="checkbox"

                      className="rounded border-slate-300"

                      checked={showPw}

                      onChange={(e) => setShowPw(e.target.checked)}

                    />

                    Show

                  </label>

                </div>

                <input

                  type={showPw ? "text" : "password"}

                  autoComplete="current-password"

                  required

                  value={password}

                  onChange={(e) => setPassword(e.target.value)}

                  className="w-full rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 px-3 py-2 outline-none transition"

                  placeholder="••••••••"

                />

              </div>



              {error && (

                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">

                  {error}

                </div>

              )}



              <button

                type="submit"

                disabled={busy}

                className="w-full rounded-xl bg-slate-900 text-white px-4 py-2.5 font-medium shadow hover:opacity-95 active:opacity-90 disabled:opacity-60 transition"

              >

                {busy ? "Signing in…" : "Sign in"}

              </button>

            </form>

          </div>

        </div>

      </div>

    </main>

  );

}

