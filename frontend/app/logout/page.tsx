'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const r = useRouter();
  useEffect(() => {
    try { localStorage.removeItem('token'); } catch {}
    fetch('/api/auth/logout', { method:'POST' })
      .finally(() => r.replace('/login'));
  }, [r]);
  return (
    <div className="max-w-md mx-auto p-6">
      <div className="rounded-2xl bg-white shadow ring-1 ring-black/5 p-6">Signing out…</div>
    </div>
  );
}
