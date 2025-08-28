import { Suspense } from 'react';
import ForgotClient from './ForgotClient';

export default function Page() {
  return (
    <Suspense fallback={<main className="p-6 max-w-md mx-auto">Loading…</main>}>
      <ForgotClient />
    </Suspense>
  );
}

export const dynamic = 'force-dynamic';
