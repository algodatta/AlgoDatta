
'use client';



import { useRouter } from 'next/navigation';

import { useState } from 'react';



const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';



export default function SignInForm() {

  const router = useRouter();

  const [email, setEmail]       = useState('');

  const [password, setPassword] = useState('');

  const [showPass, setShowPass] = useState(false);

  const [loading, setLoading]   = useState(false);

  const [error, setError]       = useState<string | null>(null);



  async function onSubmit(e: React.FormEvent) {

    e.preventDefault();

    setError(null);

    setLoading(true);



    try {

      const res = await fetch(`${API_BASE}/auth/login`, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({ email, password }),

      });



      if (!res.ok) {

        const msg = await res.text().catch(() => '');

        throw new Error(msg || 'Invalid email or password');

      }



      const data = await res.json().catch(() => ({} as any));

      const token = (data as any)?.token || (data as any)?.access_token;

      if (!token) throw new Error('Login succeeded but no token returned.');



      localStorage.setItem('token', token);

      if ((data as any).user) localStorage.setItem('user', JSON.stringify((data as any).user));



      router.replace('/dashboard');

    } catch (err: any) {

      setError(err?.message || 'Unable to sign in.');

    } finally {

      setLoading(false);

    }

  }



  return (

    <div className="w-full max-w-md">

      <div className="mb-6 text-center">

        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-black/90 text-white text-lg font-bold shadow">A</div>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">Welcome back</h1>

        <p className="mt-1 text-sm text-slate-600">Sign in to your AlgoDatta account</p>

      </div>



      <form onSubmit={onSubmit} className="rounded-2xl bg-white shadow-lg ring-1 ring-black/5 p-6 space-y-4">

        {error && (

          <div className="text-sm rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2">

            {error}

          </div>

        )}



        <div className="space-y-1.5">

          <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>

          <input

            id="email" type="email" required autoComplete="email"

            value={email} onChange={(e) => setEmail(e.target.value)}

            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-black/80"

            placeholder="you@company.com"

          />

        </div>



        <div className="space-y-1.5">

          <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>

          <div className="relative">

            <input

              id="password" type={showPass ? 'text' : 'password'} required autoComplete="current-password"

              value={password} onChange={(e) => setPassword(e.target.value)}

              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-10 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-black/80"

              placeholder="••••••••"

            />

            <button

              type="button"

              onClick={() => setShowPass((v) => !v)}

              className="absolute inset-y-0 right-0 px-3 text-sm text-slate-600 hover:text-slate-900"

              aria-label={showPass ? 'Hide password' : 'Show password'}

            >

              {showPass ? 'Hide' : 'Show'}

            </button>

          </div>

        </div>



        <button

          type="submit" disabled={loading}

          className="w-full rounded-lg bg-black/90 text-white px-4 py-2.5 text-sm font-medium shadow hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed"

        >

          {loading ? 'Signing in…' : 'Sign in'}

        </button>



        <p className="text-center text-xs text-slate-500">Trouble signing in? Contact your administrator.</p>

      </form>

    </div>

  );

}

