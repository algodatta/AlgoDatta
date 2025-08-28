// frontend/app/login/page.tsx
'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_BASE, setClientToken } from '@/lib/api';
export const dynamic = 'force-dynamic';

function LoginForm() {
  const router = useRouter();
  const qp = useSearchParams(); // now safely inside a suspense boundary
  const next = qp.get('next') || '/dashboard';

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const username = (form.get('email') as string) || '';
    const password = (form.get('password') as string) || '';

    // Hitting backend auth; adjust payload if your endpoint expects form vs json
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      alert('Invalid credentials');
      return;
    }

    const data = await res.json(); // expect { access_token, ... }
    if (!data?.access_token) {
      alert('Auth token missing from response');
      return;
    }

    setClientToken(data.access_token, 60 * 60);
    router.replace(next);
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-white/5 backdrop-blur rounded-2xl p-8 shadow-2xl border border-white/10"
      >
        <h1 className="text-2xl font-semibold text-white mb-6">Welcome back</h1>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-white/80">Email or Username</label>
            <input
              name="email"
              type="text"
              required
              className="mt-1 w-full rounded-xl bg-white/10 text-white px-4 py-3 outline-none border border-white/10 focus:border-sky-400"
              placeholder="you@algodatta.com"
            />
          </div>
          <div>
            <label className="text-sm text-white/80">Password</label>
            <input
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded-xl bg-white/10 text-white px-4 py-3 outline-none border border-white/10 focus:border-sky-400"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-medium py-3 transition"
          >
            Sign in
          </button>
        </div>
        <div className="mt-4 text-center">
          <a href="/reset" className="text-sky-300 hover:text-sky-200 text-sm">
            Forgot password?
          </a>
        </div>
      </form>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
