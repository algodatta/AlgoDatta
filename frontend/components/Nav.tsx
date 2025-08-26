
'use client';

import Link from 'next/link';

import { usePathname } from 'next/navigation';



const items = [

  { href: '/dashboard', label: 'Dashboard' },

  { href: '/broker', label: 'Broker' },

  { href: '/strategies', label: 'Strategies' },

  { href: '/executions', label: 'Executions' },

  { href: '/orders', label: 'Orders' },

  { href: '/reports', label: 'Reports' },

  { href: '/admin', label: 'Admin' },

  { href: '/logout', label: 'Logout' },

];



export default function Nav() {

  const pathname = usePathname();

  // hide nav on auth pages

  if (pathname === '/login' || pathname === '/register') return null;



  return (

    <nav className="nav">

      <div className="nav-inner">

        <Link href="/dashboard" className="brand">AlgoDatta</Link>

        {items.map(i => (

          <Link

            key={i.href}

            href={i.href}

            className=""

          >

            {i.label}

          </Link>

        ))}

      </div>

    </nav>

  );

}

