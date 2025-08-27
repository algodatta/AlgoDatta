'use client';
import Link from 'next/link';
import { useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';

export default function SiteNavbar() {
  const [open, setOpen] = useState(false);

  const nav = [
    { href: '/broker', label: 'Broker' },
    { href: '/strategies', label: 'Strategies' },
    { href: '/executions', label: 'Executions' },
    { href: '/reports', label: 'Reports' },
    { href: '/admin', label: 'Admin' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur dark:bg-slate-900/80">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo-algodatta.svg" alt="AlgoDatta" className="h-6 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="text-slate-700 hover:text-black hover:underline dark:text-slate-200 dark:hover:text-white">
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link href="/register" className="rounded-xl border px-3 py-1.5 text-sm dark:border-slate-700">Register</Link>
            <Link href="/login" className="rounded-xl bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-black/90">
              Login
            </Link>
          </div>

          {/* Mobile */}
          <button
            aria-label="Toggle menu"
            className="md:hidden rounded-md border px-3 py-2 text-sm dark:border-slate-700"
            onClick={() => setOpen((s) => !s)}
          >
            Menu
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col gap-2 text-sm">
              {nav.map((n) => (
                <Link key={n.href} href={n.href} className="rounded-lg px-2 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                  {n.label}
                </Link>
              ))}
              <div className="mt-2 flex gap-2">
                <ThemeToggle />
                <Link href="/register" className="flex-1 rounded-lg border px-3 py-2 text-center dark:border-slate-700">Register</Link>
                <Link href="/login" className="flex-1 rounded-lg bg-black px-3 py-2 text-center font-medium text-white">Login</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}