import { Suspense } from 'react';
import ChangePasswordClient from './ChangePasswordClient';

export default function Page() {
  return (
    <Suspense fallback={<main className="p-6 max-w-md mx-auto">Loading…</main>}>
      <ChangePasswordClient />
    </Suspense>
  );
}

export const dynamic = 'force-dynamic';
