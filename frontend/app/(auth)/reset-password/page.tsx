'use client';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function ResetPasswordPage() {
  const token = useSearchParams().get('token') || '';
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setMsg(null);
    const r = await fetch('/api/auth/reset-password', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ token, password })
    });
    const j = await r.json().catch(()=>({})); setLoading(false);
    setMsg(j.message || (r.ok ? 'Password updated. You can log in.' : 'Reset failed.'));
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Set new password</h1>
      {!token && <p className="text-sm text-red-600">Missing token in URL.</p>}
      <form onSubmit={submit} className="space-y-3">
        <input type="password" className="w-full border rounded p-2"
               placeholder="New password" value={password}
               onChange={e=>setPassword(e.target.value)} />
        <button className="w-full rounded bg-black text-white py-2" disabled={!token || loading}>
          {loading ? 'Updating...' : 'Update password'}
        </button>
      </form>
      {msg && <p className="mt-3 text-sm">{msg}</p>}
    </div>
  );
}
