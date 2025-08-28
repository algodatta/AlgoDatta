'use client';
import { useEffect } from 'react';

export default function Logout() {
  useEffect(() => {
    const run = async () => {
      const base = process.env.NEXT_PUBLIC_API_BASE || '';
      try {
        await fetch(base.replace(/\/$/,'') + '/auth/logout', { method: 'POST', credentials: 'include' });
      } catch {}
      window.location.href = '/login';
    };
    run();
  }, []);
  return <main className="p-6">Signing you out…</main>;
}
