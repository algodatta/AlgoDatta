'use client';
import { useState } from 'react';
import Field from '@/components/Field';
import Button from '@/components/Button';
import { ToastProvider, useToast } from '@/components/toast/ToastContext';
import Link from 'next/link';

function Inner() {
  const { push } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const base = (process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/$/, '');
      const r = await fetch(base + '/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!r.ok) throw new Error(await r.text());
      setDone(true);
      push({ title: 'Email sent', description: 'Check your inbox for the reset link', variant: 'success' });
    } catch (e: any) {
      push({ title: 'Request failed', description: e.message || 'Please try again', variant: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[60vh] grid place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-3xl border bg-white p-6 space-y-3">
        <div>
          <h1 className="text-xl font-semibold">Forgot password</h1>
          <p className="text-sm text-slate-600">Enter your account email. We’ll send a reset link.</p>
        </div>
        <Field label="Email" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com" />
        <Button disabled={loading || !email} type="submit">{loading ? 'Sending…' : 'Send reset link'}</Button>
        {done && <p className="text-sm text-emerald-700">If the email exists, a reset link has been sent.</p>}
        <div className="text-sm text-slate-600">Remembered it? <Link href="/login" className="underline">Back to sign in</Link></div>
      </form>
    </main>
  );
}

export default function ForgotClient() {
  return <ToastProvider><Inner /></ToastProvider>;
}
