// frontend/app/signup/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signup, login } from "@/lib/api";
export const dynamic = "force-dynamic";

export default function SignupPage() {
  const r = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setBusy(true);
    try {
      await signup({ email: email.trim(), username: username.trim() || undefined, password });
      // auto-login for great UX
      await login(email || username, password);
      r.replace("/dashboard");
    } catch (e: any) { setErr(e?.message ?? "Sign up failed"); } finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white grid place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white/5 p-8 rounded-2xl ring-1 ring-white/10 space-y-4">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <input className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3" placeholder="Email" type="email" required value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3" placeholder="Username (optional)" value={username} onChange={e=>setUsername(e.target.value)} />
        <input className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3" placeholder="Password" type="password" required value={password} onChange={e=>setPassword(e.target.value)} />
        {err && <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-200 text-sm">{err}</div>}
        <button disabled={busy} className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-3 font-medium">{busy?"Creating…":"Create account"}</button>
        <p className="text-sm text-slate-300 text-center">Already have an account? <a href="/login" className="text-indigo-400 hover:underline">Sign in</a></p>
      </form>
    </div>
  );
}
