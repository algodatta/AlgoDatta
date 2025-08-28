
"use client";



import { useSearchParams, useRouter } from "next/navigation";

import { useState } from "react";



const apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://api.algodatta.com";



async function tryLogin(path: string, email: string, password: string) {

  const res = await fetch(`${apiBase}${path}`, {

    method: "POST",

    headers: { "Content-Type": "application/json" },

    body: JSON.stringify({ email, password }),

  });

  if (!res.ok) throw new Error(await res.text().catch(() => "Login failed"));

  const data = await res.json().catch(() => ({} as any));

  const token = data.access_token || data.token || data.accessToken;

  if (!token) throw new Error("Token missing in response");

  return token as string;

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

      let token: string;

      try {

        token = await tryLogin("/auth/login", email, password);

      } catch {

        token = await tryLogin("/api/auth/login", email, password);

      }

      localStorage.setItem("token", token);

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

          <span className="text-sm">Email</span>

          <input

            type="email"

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

