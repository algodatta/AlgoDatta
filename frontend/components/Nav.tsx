'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { clearToken } from '../lib/auth';

const links = [
  { href: '/dashboard',  label: 'Dashboard'  },
  { href: '/strategies', label: 'Strategies' },
  { href: '/executions', label: 'Executions' },
  { href: '/orders',     label: 'Orders'     },
  { href: '/reports',    label: 'Reports'    },
  { href: '/admin',      label: 'Admin'      },
];

export default function Nav() {
  const router   = useRouter();
  const pathname = usePathname();

  function onLogout() {
    clearToken();
    router.push('/login');
  }

  return (
    <nav className="nav">
      <div className="container nav-inner">
        <Link href="/dashboard" className="brand">AlgoDatta</Link>
        <div className="links">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`nav-link ${pathname === l.href ? 'active' : ''}`}
            >
              {l.label}
            </Link>
          ))}
          <button onClick={onLogout} className="btn">Logout</button>
        </div>
      </div>
    </nav>
  );
}
