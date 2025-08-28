import { Suspense } from 'react';
import ProfileClient from './ProfileClient';

export default function Page() {
  return (
    <Suspense fallback={<main className="p-6 max-w-2xl mx-auto">Loading…</main>}>
      <ProfileClient />
    </Suspense>
  );
}

export const dynamic = 'force-dynamic';
