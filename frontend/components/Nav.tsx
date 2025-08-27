<<<<<<< HEAD
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
=======

'use client'

import Link from 'next/link'

import { usePathname } from 'next/navigation'



const links = [

  { href: '/dashboard',   label: 'Dashboard' },

  { href: '/broker',      label: 'Broker' },

  { href: '/strategies',  label: 'Strategies' },

  { href: '/executions',  label: 'Executions' },

  { href: '/orders',      label: 'Orders' },

  { href: '/reports',     label: 'Reports' },

  { href: '/admin',       label: 'Admin' },

  { href: '/logout',      label: 'Logout' },

]



export default function Nav() {

  const pathname = usePathname()

  return (

    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur border-b">

      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-6">

        <Link href="/dashboard" className="font-semibold">AlgoDatta</Link>

        <nav className="flex-1 flex flex-wrap gap-2">

          {links.map(l => (

            <Link

              key={l.href}

              href={l.href}

              className={`px-3 py-1.5 rounded-md text-sm ${pathname===l.href ? 'bg-black text-white' : 'hover:bg-gray-100'}`}

            >

              {l.label}

            </Link>

          ))}

        </nav>

>>>>>>> 70c56dd2decfcb9a464e980fc93d3b81cb1e9180
      </div>

    </header>

  )

}

