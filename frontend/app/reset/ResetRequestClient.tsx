
"use client";

import { useState } from "react";

import AuthCard from "@/components/AuthCard";

import { apiResetRequest } from "@/lib/authApi";



export default function ResetRequestClient(){

  const [email, setEmail] = useState("");

  const [busy, setBusy] = useState(false);

  const [done, setDone] = useState(false);

  const [error, setError] = useState<string|null>(null);



  const onSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    setBusy(true); setError(null);

    try {

      await apiResetRequest(email.trim());

      setDone(true);

    } catch (err:any){

      setError(err?.message || "Request failed");

    } finally {

      setBusy(false);

    }

  };



  return (

    <AuthCard title="Reset your password" subtitle="We’ll email a reset link if the account exists">

      {done ? (

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 text-sm">

          If an account exists for <strong>{email}</strong>, you’ll receive a reset link shortly.

          <div className="mt-3">

            <a href="/login" className="underline underline-offset-2">Return to sign in</a>

          </div>

        </div>

      ) : (

        <form onSubmit={onSubmit} className="space-y-4">

          <div>

            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>

            <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}

                   className="w-full rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 px-3 py-2 outline-none transition bg-white"

                   placeholder="you@example.com"/>

          </div>

          {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

          <button type="submit" disabled={busy}

                  className="w-full rounded-xl bg-slate-900 text-white px-4 py-2.5 font-medium shadow hover:opacity-95 active:opacity-90 disabled:opacity-60 transition">

            {busy ? "Sending…" : "Send reset link"}

          </button>

          <div className="text-sm text-center text-slate-600 pt-1">

            <a href="/login" className="underline underline-offset-2 hover:text-slate-900">Back to sign in</a>

          </div>

        </form>

      )}

    </AuthCard>

  );

}

