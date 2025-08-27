import { Suspense } from 'react';
import LoginClient from './LoginClient';

export default function Page({ searchParams }: { searchParams: { next?: string } }) {
  const rawNext = typeof searchParams?.next === 'string' ? searchParams.next : undefined;
  const next = rawNext && rawNext.startsWith('/') ? rawNext : '/dashboard';

  return (
    <Suspense fallback={<main className="p-6 max-w-md mx-auto">Loading…</main>}>
      <LoginClient next={next} />
    </Suspense>
  );
}

export const dynamic = 'force-dynamic';
