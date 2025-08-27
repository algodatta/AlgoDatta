'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { apiUrl } from '@/app/lib/api';

export default function SignInForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      const res = await fetch(apiUrl('/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error((await res.text().catch(()=>'')) || `Login failed (${res.status})`);

      const data  = await res.json().catch(()=> ({}));
      const token =
        data?.token ??
        data?.access_token ??
        data?.jwt ??
        data?.access?.token ??
        data?.data?.token ?? '';
      if (!token) throw new Error('Login succeeded but no token returned');

      try { localStorage.setItem('token', token); } catch {}

      await fetch('/api/auth/set-cookie', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ token, maxAge: 60*60*24*7 }),
      }).catch(()=> {});

      router.replace(sp.get('next') || '/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 bg-white/70 dark:bg-neutral-900/50 p-6 rounded-xl shadow">
      <h1 className="text-xl font-semibold">Sign in</h1>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="space-y-1">
        <label className="text-sm">Email</label>
        <input className="w-full border rounded px-3 py-2" type="email" value={email} onChange={e=> setEmail(e.target.value)} required autoComplete="username" />
      </div>
      <div className="space-y-1">
        <label className="text-sm">Password</label>
        <input className="w-full border rounded px-3 py-2" type="password" value={password} onChange={e=> setPassword(e.target.value)} required autoComplete="current-password" />
      </div>
      <button className="w-full rounded bg-black text-white py-2 font-medium disabled:opacity-60 disabled:cursor-not-allowed" disabled={loading} type="submit">
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
