'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/Button';
import UserMenu from '@/components/UserMenu';

type Me = { id?: string; name?: string; email?: string; roles?: string[]; avatar_url?: string | null };

function Card({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="group rounded-3xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md p-4 transition block bg-white">
      <div className="font-semibold mb-1 group-hover:underline">{title}</div>
      <div className="text-sm text-slate-600">{desc}</div>
    </Link>
  );
}

export default function DashboardClient() {
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const base = (process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/$/, '');
        const r = await fetch(base + '/auth/me', { credentials: 'include', headers: { Accept: 'application/json' }, signal: ctrl.signal });
        if (r.status === 401) {
          window.location.href = '/login?next=' + encodeURIComponent('/dashboard');
          return;
        }
        if (!r.ok) throw new Error('Failed to load session');
        const j = await r.json();
        setMe(j);
      } catch (e: any) {
        if (e.name !== 'AbortError') setError(e.message || 'Failed to load session');
      }
    })();
    return () => ctrl.abort();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-100">
      <header className="bg-white/90 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto h-14 px-4 flex items-center justify-between">
          <Link href="/dashboard" className="font-semibold">AlgoDatta</Link>
          <div className="flex items-center gap-3">
            <Link href="/logout" className="text-sm px-3 py-1.5 rounded-xl border hover:bg-slate-50">Sign out</Link>
            <UserMenu name={me?.name || null} email={me?.email || null} avatarUrl={me?.avatar_url || null} />
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="rounded-3xl p-6 mb-6 bg-gradient-to-r from-slate-900 to-slate-700 text-white">
          <div className="text-sm opacity-90">Welcome back</div>
          <div className="text-2xl font-semibold">{me?.name || me?.email || 'User'}</div>
          <div className="mt-3 flex gap-3">
            <Button variant="secondary" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20" onClick={()=>location.href='/settings/profile'}>Profile</Button>
            <Button variant="secondary" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20" onClick={()=>location.href='/connect'}>Connect broker</Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 p-3 text-sm">{error}</div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card href="/settings/profile" title="Profile & Settings" desc="Edit your name, avatar, timezone and notifications." />
          <Card href="/password/change" title="Change password" desc="Update your password using strong rules." />
          <Card href="/connect" title="Broker connections" desc="Connect to your broker or data provider." />
          <Card href="/demo" title="Strategy demo" desc="Run through a quick demo (if enabled)." />
          <Card href="/unauthorized" title="Unauthorized state" desc="Test the guard for protected routes." />
          <Card href="/logout" title="Sign out" desc="End this session and return to sign-in." />
        </div>
      </section>
    </main>
  );
}
