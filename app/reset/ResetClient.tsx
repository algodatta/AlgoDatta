'use client';
import { useState } from 'react';
import Field from '@/components/Field';
import Button from '@/components/Button';
import { ToastProvider, useToast } from '@/components/toast/ToastContext';
import Link from 'next/link';

export default function ResetClient({ token, next='/dashboard' }: { token?: string; next?: string }) {
  const { push } = useToast();
  const [pwd, setPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [tok, setTok] = useState(token || '');
  const [loading, setLoading] = useState(false);

  const valid = pwd.length >= 12 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /\d/.test(pwd) && /[^\w\s]/.test(pwd) && pwd === confirm && tok;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const base = (process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/$/, '');
      const r = await fetch(base + '/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tok, new_password: pwd }),
      });
      if (!r.ok) throw new Error(await r.text());
      push({ title: 'Password reset', variant: 'success' });
      window.location.href = '/login?next=' + encodeURIComponent(next || '/dashboard');
    } catch (e: any) {
      push({ title: 'Reset failed', description: e.message || 'Please try again', variant: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToastProvider>
      <main className="min-h-[60vh] grid place-items-center p-6">
        <form onSubmit={onSubmit} className="w-full max-w-md rounded-3xl border bg-white p-6 space-y-3">
          <div>
            <h1 className="text-xl font-semibold">Reset password</h1>
            <p className="text-sm text-slate-600">Paste your reset token and choose a new password.</p>
          </div>
          {!token && <Field label="Reset token" value={tok} onChange={e=>setTok(e.target.value)} required placeholder="Paste token from email" />}
          <Field label="New password" type="password" value={pwd} onChange={e=>setPwd(e.target.value)} required hint="Min 12 chars, mixed case, number & symbol" />
          <Field label="Confirm new password" type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} required />
          <Button disabled={!valid || loading} type="submit">{loading ? 'Resetting…' : 'Reset password'}</Button>
          <div className="text-sm text-slate-600">Back to <Link href="/login" className="underline">sign in</Link></div>
        </form>
      </main>
    </ToastProvider>
  );
}
