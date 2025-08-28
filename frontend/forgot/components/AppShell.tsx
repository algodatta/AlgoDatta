'use client';

import { usePathname } from 'next/navigation';
import Nav from './Nav';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNav = pathname === '/login';
  return (
    <>
      {!hideNav && <Nav />}
      <main className="container page">{children}</main>
    </>
  );
}
