// NOTE: secrets must be server-only; do not reference in client components.
'use client';
import { useState } from 'react';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg(null);
    const r = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const j = await r.json().catch(()=>({}));
    setLoading(false);
    setMsg(j.message || (r.ok ? 'Registered! Check your email.' : 'Failed to register.'));
  }
  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Create account</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border rounded p-2" placeholder="Full name"
          value={form.name} onChange={e=>setForm(s=>({...s, name: e.target.value}))}/>
        <input className="w-full border rounded p-2" placeholder="Email" type="email"
          value={form.email} onChange={e=>setForm(s=>({...s, email: e.target.value}))}/>
        <input className="w-full border rounded p-2" placeholder="Password" type="password"
          value={form.password} onChange={e=>setForm(s=>({...s, (process.env.GENERIC_PASSWORD as string) /* server-only */
        <button className="w-full rounded bg-black text-white py-2" disabled={loading}>
          {loading ? 'Creating...' : 'Register'}
        </button>
      </form>
      {msg && <p className="mt-3 text-sm">{msg}</p>}
      <p className="mt-4 text-sm">Already have an account? <a className="underline" href="/login">Log in</a></p>
    </div>
  );
}
