// frontend/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";

export const dynamic = "force-dynamic"; // avoid static export issues

export default function LoginPage() {
  const r = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await login(identifier.trim(), password);
      r.replace("/dashboard");
    } catch (e: any) {
      setErr(e?.message ?? "Login failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white/5 backdrop-blur rounded-2xl shadow-2xl ring-1 ring-white/10 p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto h-12 w-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <span className="text-indigo-400 font-bold text-xl">A</span>
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-white">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-300">
              Sign in to continue to AlgoDatta
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200">
                Email or Username
              </label>
              <input
                type="text"
                autoComplete="username"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="you@algodatta.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••••"
              />
            </div>

            {err && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-200 text-sm">
                {err}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition px-4 py-3 text-white font-medium shadow-lg"
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-6 text-sm text-center text-slate-300">
            <a href="/reset" className="text-indigo-400 hover:underline">
              Forgot password?
            </a>
            <span className="mx-2 text-slate-500">•</span>
            <a href="/signup" className="text-indigo-400 hover:underline">
              Create an account
            </a>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          By continuing you agree to our Terms & Privacy Policy.
        </p>
      </div>
    </div>
  );
}
