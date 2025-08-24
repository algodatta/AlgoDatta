'use client';

import { useEffect } from 'react';
import { clearToken } from '../../lib/auth';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();
  useEffect(() => {
    clearToken();
    router.replace('/login');
  }, [router]);
  return <p>Signing out…</p>;
}
