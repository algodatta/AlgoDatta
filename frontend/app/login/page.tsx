'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setToken } from '../../lib/auth';

const BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.algodatta.com';

function LoginInner() {
  const [email, setEmail]       = useState('admin@algodatta.com');
  const [password, setPassword] = useState('Admin@123');
  const [err, setErr]           = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get('next') || '/dashboard';

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null);
    try {
      const res = await fetch(`${BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.access_token) throw new Error(j.detail || `Login failed (${res.status})`);
      setToken(j.access_token);
      router.push(next);
    } catch (e:any) {
      setErr(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm border rounded-xl p-6 bg-white space-y-3">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <label className="block">
          <span className="text-sm text-gray-700">Email</span>
          <input value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-sm text-gray-700">Password</span>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
        </label>
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <button disabled={loading} className="w-full py-2 rounded bg-blue-600 text-white disabled:opacity-50">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

export const dynamic = 'force-dynamic'; // avoid static pre-render quirks on login

export default function LoginPage() {
  return (
    <Suspense fallback={<div />}>
      <LoginInner />
    </Suspense>
  );
}
