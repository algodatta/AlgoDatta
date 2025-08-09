'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function withAuth<P>(Wrapped: React.ComponentType<P>) {
  return function Protected(props: P) {
    const [ok, setOk] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      try {
        const hasCookie = typeof document !== 'undefined' && document.cookie.split('; ').some(c => c.startsWith('token='));
        const hasLS = typeof window !== 'undefined' && !!localStorage.getItem('token');
        if (!hasCookie && !hasLS) {
          router.replace(`/login?next=${encodeURIComponent(pathname || '/')}`);
          return;
        }
        setOk(true);
      } catch {
        router.replace(`/login?next=${encodeURIComponent(pathname || '/')}`);
      }
    }, [router, pathname]);

    if (!ok) return <div className="p-6">Checking session…</div>;
    return <Wrapped {...props} />;
  };
}
