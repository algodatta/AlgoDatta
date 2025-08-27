'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Nav() {
  const pathname = usePathname();
  // Hide nav on auth pages
  if (pathname?.startsWith('/login') || pathname?.startsWith('/register')) return null;

  const items = [
    { href: '/dashboard',  label: 'Dashboard' },
    { href: '/broker',     label: 'Broker' },
    { href: '/strategies', label: 'Strategies' },
    { href: '/executions', label: 'Executions' },
    { href: '/orders',     label: 'Orders' },
    { href: '/reports',    label: 'Reports' },
    { href: '/admin',      label: 'Admin' },
  ];

  return (
    <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="font-semibold tracking-tight">AlgoDatta</Link>
        <div className="flex items-center gap-4">
          {items.map(i => (
            <Link
              key={i.href}
              href={i.href}
              className={`text-sm hover:text-black ${pathname === i.href ? 'text-black font-medium' : 'text-slate-600'}`}
            >
              {i.label}
            </Link>
          ))}
          <Link href="/logout" className="text-sm text-slate-600 hover:text-black">Logout</Link>
        </div>
      </div>
    </nav>
  );
}
