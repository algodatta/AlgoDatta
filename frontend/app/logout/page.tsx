// frontend/app/logout/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/api';

export const revalidate = 0;          // ✅ must be a number or false (not an object)
export const dynamic = 'force-dynamic';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        await logout();               // calls backend if available + clears local cookie
      } finally {
        router.replace('/login');
      }
    })();
  }, [router]);

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="text-center space-y-2">
        <div className="animate-pulse text-2xl font-semibold">Signing you out…</div>
        <p className="text-sm text-gray-500">One moment please.</p>
      </div>
    </div>
  );
}
