
"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import AuthCard from "@/components/AuthCard";

import { apiSignup, apiLogin } from "@/lib/authApi";



export default function SignupClient(){

  const router = useRouter();

  const [email, setEmail] = useState("");

  const [username, setUsername] = useState("");

  const [pw, setPw] = useState("");

  const [pw2, setPw2] = useState("");

  const [busy, setBusy] = useState(false);

  const [error, setError] = useState<string|null>(null);



  const valid = pw.length>=8 && pw===pw2 && email.includes("@") && username.length>=3;



  const onSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!valid) return;

    setBusy(true); setError(null);

    try{

      const ok = await apiSignup(email.trim(), username.trim(), pw);

      if (!ok) throw new Error("Could not create account");

      // try logging in directly for seamless UX

      const token = await apiLogin(email || username, pw).catch(()=>null);

      if (token) {

        localStorage.setItem("token", token);

        document.cookie = `ad_at=${encodeURIComponent(token)}; Path=/; Max-Age=604800; SameSite=Lax; Secure`;

        router.replace("/dashboard");

      } else {

        router.replace("/login?next=%2Fdashboard");

      }

    }catch(err:any){

      setError(err?.message || "Signup failed");

    }finally{

      setBusy(false);

    }

  };



  return (

    <AuthCard title="Create your account" subtitle="Join AlgoDatta">

      <form onSubmit={onSubmit} className="space-y-4">

        <div>

          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>

          <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}

                 className="w-full rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 px-3 py-2 outline-none transition bg-white"

                 placeholder="you@example.com"/>

        </div>

        <div>

          <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>

          <input type="text" required value={username} onChange={e=>setUsername(e.target.value)}

                 className="w-full rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 px-3 py-2 outline-none transition bg-white"

                 placeholder="yourname"/>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          <div>

            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>

            <input type="password" required value={pw} onChange={e=>setPw(e.target.value)}

                   className="w-full rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 px-3 py-2 outline-none transition bg-white"

                   placeholder="At least 8 characters"/>

          </div>

          <div>

            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>

            <input type="password" required value={pw2} onChange={e=>setPw2(e.target.value)}

                   className="w-full rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 px-3 py-2 outline-none transition bg-white"

                   placeholder="Repeat password"/>

          </div>

        </div>



        {!valid && <p className="text-xs text-slate-500">Use a strong password (≥ 8 chars) and make sure both passwords match.</p>}

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}



        <button type="submit" disabled={!valid || busy}

                className="w-full rounded-xl bg-slate-900 text-white px-4 py-2.5 font-medium shadow hover:opacity-95 active:opacity-90 disabled:opacity-60 transition">

          {busy ? "Creating…" : "Create account"}

        </button>



        <div className="text-sm text-center text-slate-600 pt-1">

          <span>Already have an account? </span>

          <a href="/login" className="underline underline-offset-2 hover:text-slate-900">Sign in</a>

        </div>

      </form>

    </AuthCard>

  );

}

