
"use client";

import { useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import AuthCard from "@/components/AuthCard";

import { apiLogin } from "@/lib/authApi";



export default function LoginClient(){

  const router = useRouter();

  const sp = useSearchParams();

  const next = sp.get("next") || "/dashboard";



  const [user, setUser] = useState("");

  const [password, setPassword] = useState("");

  const [showPw, setShowPw] = useState(false);

  const [busy, setBusy] = useState(false);

  const [error, setError] = useState<string|null>(null);



  const onSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    setBusy(true); setError(null);

    try{

      const token = await apiLogin(user, password);

      if (!token) throw new Error("Invalid credentials");

      localStorage.setItem("token", token);

      document.cookie = `ad_at=${encodeURIComponent(token)}; Path=/; Max-Age=604800; SameSite=Lax; Secure`;

      router.replace(next);

    }catch(err:any){

      setError(err?.message || "Login failed");

    }finally{

      setBusy(false);

    }

  };



  return (

    <AuthCard title="Welcome back" subtitle="Sign in to continue">

      <form onSubmit={onSubmit} className="space-y-4">

        <div>

          <label className="block text-sm font-medium text-slate-700 mb-1">Email or Username</label>

          <input type="text" inputMode="email" autoComplete="username" required value={user} onChange={e=>setUser(e.target.value)}

                 className="w-full rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 px-3 py-2 outline-none transition bg-white"

                 placeholder="you@example.com or username"/>

        </div>

        <div>

          <div className="flex items-center justify-between mb-1">

            <label className="block text-sm font-medium text-slate-700">Password</label>

            <button type="button" onClick={()=>setShowPw(v=>!v)} className="text-xs text-slate-600 hover:text-slate-900 underline underline-offset-2">

              {showPw ? "Hide" : "Show"}

            </button>

          </div>

          <input type={showPw ? "text":"password"} autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}

                 className="w-full rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 px-3 py-2 outline-none transition bg-white"

                 placeholder="••••••••"/>

        </div>



        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}



        <button type="submit" disabled={busy}

                className="w-full rounded-xl bg-slate-900 text-white px-4 py-2.5 font-medium shadow hover:opacity-95 active:opacity-90 disabled:opacity-60 transition">

          {busy ? "Signing in…" : "Sign in"}

        </button>



        <div className="text-sm text-center text-slate-600 pt-1">

          <a href="/reset" className="underline underline-offset-2 hover:text-slate-900">Forgot password?</a>

          <span className="mx-2">•</span>

          <a href="/signup" className="underline underline-offset-2 hover:text-slate-900">Create account</a>

        </div>

      </form>

    </AuthCard>

  );

}

