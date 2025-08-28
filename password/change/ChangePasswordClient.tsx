'use client';
import { useState } from 'react';
import Field from '@/components/Field';
import Button from '@/components/Button';
import { ToastProvider, useToast } from '@/components/toast/ToastContext';
import Link from 'next/link';

function Inner() {
  const { push } = useToast();
  const [current, setCurrent] = useState('');
  const [pwd, setPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const valid = pwd.length >= 12 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /\d/.test(pwd) && /[^\w\s]/.test(pwd) && pwd === confirm;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const base = (process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/$/, '');
      const r = await fetch(base + '/auth/password/change', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: current, new_password: pwd }),
      });
      if (r.status === 401) {
        window.location.href = '/login?next=' + encodeURIComponent('/password/change');
        return;
      }
      if (!r.ok) throw new Error(await r.text());
      push({ title: 'Password updated', variant: 'success' });
      window.location.href = '/dashboard';
    } catch (e: any) {
      push({ title: 'Update failed', description: e.message || 'Please try again', variant: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[60vh] grid place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-3xl border bg-white p-6 space-y-3">
        <div>
          <h1 className="text-xl font-semibold">Change password</h1>
          <p className="text-sm text-slate-600">Use a strong password (min 12 chars, mixed case, number & symbol).</p>
        </div>
        <Field label="Current password" type="password" value={current} onChange={e=>setCurrent(e.target.value)} required />
        <Field label="New password" type="password" value={pwd} onChange={e=>setPwd(e.target.value)} required />
        <Field label="Confirm new password" type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} required />
        <Button disabled={!valid || loading} type="submit">{loading ? 'Updating…' : 'Update password'}</Button>
        <div className="text-sm text-slate-600">Forgot yours? <Link href="/forgot" className="underline">Reset it</Link></div>
      </form>
    </main>
  );
}

export default function ChangePasswordClient() {
  return <ToastProvider><Inner /></ToastProvider>;
}
