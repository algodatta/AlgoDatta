import { Suspense } from 'react';
import ResetClient from './ResetClient';

function PageInner({ searchParams }: { searchParams: { token?: string; next?: string } }) {
  const token = searchParams?.token || '';
  const next = searchParams?.next || '/dashboard';
  return <ResetClient token={token} next={next} />;
}

export default function Page(props: any) {
  return (
    <Suspense fallback={<main className="p-6 max-w-md mx-auto">Loading…</main>}>
      <PageInner {...props} />
    </Suspense>
  );
}

export const dynamic = 'force-dynamic';
