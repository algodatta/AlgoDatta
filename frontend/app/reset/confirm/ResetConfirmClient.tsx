
"use client";

import { useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import AuthCard from "@/components/AuthCard";

import { apiResetConfirm } from "@/lib/authApi";



export default function ResetConfirmClient(){

  const router = useRouter();

  const sp = useSearchParams();

  const token = sp.get("token") || "";

  const [pw, setPw] = useState("");

  const [pw2, setPw2] = useState("");

  const [busy, setBusy] = useState(false);

  const [error, setError] = useState<string|null>(null);

  const valid = token && pw.length>=8 && pw===pw2;



  const onSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!valid) return;

    setBusy(true); setError(null);

    try{

      await apiResetConfirm(token, pw);

      router.replace("/login?next=%2Fdashboard");

    }catch(err:any){

      setError(err?.message || "Could not reset password");

    }finally{

      setBusy(false);

    }

  };



  return (

    <AuthCard title="Set a new password" subtitle="Enter your new password">

      <form onSubmit={onSubmit} className="space-y-4">

        {!token && <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">Missing or invalid token. Check your reset link.</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          <div>

            <label className="block text-sm font-medium text-slate-700 mb-1">New password</label>

            <input type="password" required value={pw} onChange={e=>setPw(e.target.value)}

                   className="w-full rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 px-3 py-2 outline-none transition bg-white"

                   placeholder="At least 8 characters"/>

          </div>

          <div>

            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm password</label>

            <input type="password" required value={pw2} onChange={e=>setPw2(e.target.value)}

                   className="w-full rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 px-3 py-2 outline-none transition bg-white"

                   placeholder="Repeat password"/>

          </div>

        </div>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}



        <button type="submit" disabled={!valid || busy}

                className="w-full rounded-xl bg-slate-900 text-white px-4 py-2.5 font-medium shadow hover:opacity-95 active:opacity-90 disabled:opacity-60 transition">

          {busy ? "Updating…" : "Update password"}

        </button>



        <div className="text-sm text-center text-slate-600 pt-1">

          <a href="/login" className="underline underline-offset-2 hover:text-slate-900">Back to sign in</a>

        </div>

      </form>

    </AuthCard>

  );

}

