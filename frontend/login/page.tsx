import { Suspense } from 'react';
import LoginClient from './LoginClient';

function PageInner({ searchParams }: { searchParams: { next?: string } }) {
  const next = searchParams?.next || '/dashboard';
  return <LoginClient next={next} />;
}

export default function Page(props: any) {
  return (
    <Suspense fallback={<main className="p-6 max-w-md mx-auto">Loading…</main>}>
      {/* @ts-expect-error Async RSC wrapper */}
      <PageInner {...props} />
    </Suspense>
  );
}

export const dynamic = 'force-dynamic';
