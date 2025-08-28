import { Suspense } from 'react';
import DashboardClient from './DashboardClient';

export default function Page() {
  return (
    <Suspense fallback={<main className="p-6 max-w-2xl mx-auto">Loading dashboard…</main>}>
      <DashboardClient />
    </Suspense>
  );
}

export const dynamic = 'force-dynamic';
