
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

      </div>

    </header>

  )

}

