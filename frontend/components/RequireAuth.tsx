'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

type Props = {
  children: React.ReactNode;
  roles?: string[]; // optional role-based enforcement
};

type MeResponse = {
  id: string | number;
  email: string;
  roles?: string[] | string;
};

function normalizeRoles(r: MeResponse['roles']): string[] {
  if (!r) return [];
  return Array.isArray(r) ? r.map(String) : String(r).split(',').map(s => s.trim()).filter(Boolean);
}

export default function RequireAuth({ children, roles }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let cancelled = false
    (async () => {
      try {
        const base = (process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/$/, '');
        const url = (base ? base : '') + '/auth/me';
        const res = await fetch(url, { credentials: 'include', headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(String(res.status));

        const me = (await res.json()) as MeResponse;
        const userRoles = normalizeRoles(me.roles);

        if (roles && roles.length > 0) {
          const pass = roles.some(r => userRoles.includes(r));
          if (!pass) {
            window.location.href = '/unauthorized';
            return;
          }
        }

        if (!cancelled) setOk(true)
      } catch {
        const next = encodeURIComponent(`${pathname}${searchParams?.size ? '?' + searchParams.toString() : ''}`);
        window.location.href = `/login?next=${next}`;
      }
    })();
    return () => { cancelled = true };
  }, [pathname, searchParams, roles]);

  if (!ok) {
    return <main className="p-6 max-w-2xl mx-auto">Loading…</main>;
  }
  return <>{children}</>;
}
