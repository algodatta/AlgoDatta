'use client';

import Nav from '@/components/Nav';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">
        <Nav />
        <main className="p-4 md:p-6">{children}</main>
      </body>
    </html>
  );
}
