// frontend/app/reset/page.tsx
"use client";
import { useState } from "react";
import { requestPasswordReset } from "@/lib/api";
export const dynamic = "force-dynamic";

export default function ResetPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setMsg(null); setBusy(true);
    try {
      await requestPasswordReset(email.trim());
      setMsg("If that email exists, a reset link has been sent.");
    } catch (e: any) {
      setErr(e?.message ?? "Unable to request reset");
    } finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white grid place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white/5 p-8 rounded-2xl ring-1 ring-white/10 space-y-4">
        <h1 className="text-2xl font-semibold">Reset password</h1>
        <input className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3" placeholder="Email" type="email" required value={email} onChange={e=>setEmail(e.target.value)} />
        {err && <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-200 text-sm">{err}</div>}
        {msg && <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 text-emerald-200 text-sm">{msg}</div>}
        <button disabled={busy} className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-3 font-medium">{busy?"Sending…":"Send reset link"}</button>
        <p className="text-sm text-slate-300 text-center"><a href="/login" className="text-indigo-400 hover:underline">Back to login</a></p>
      </form>
    </div>
  );
}
