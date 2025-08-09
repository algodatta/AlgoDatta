'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function Protected({ children }:{ children: React.ReactNode }){
  const [ok, setOk] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const hasCookie = typeof document !== 'undefined' && document.cookie.split('; ').some(c => c.startsWith('token='));
    const hasLS = typeof window !== 'undefined' && !!localStorage.getItem('token');
    if (!hasCookie && !hasLS) {
      router.replace(`/login?next=${encodeURIComponent(pathname || '/')}`);
    } else {
      setOk(true);
    }
  }, [router, pathname]);

  if (!ok) return <div className="p-6">Checking session…</div>;
  return <>{children}</>;
}
