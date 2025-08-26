'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const items = [
  { href: '/', label: 'Dashboard' },
  { href: '/broker', label: 'Broker' },
  { href: '/strategies', label: 'Strategies' },
  { href: '/executions', label: 'Executions' },
  { href: '/orders', label: 'Orders' },
  { href: '/reports', label: 'Reports' },
  { href: '/admin', label: 'Admin' },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (href: string) =>
    pathname === href ? {fontWeight:'600', color:'#1d4ed8'} : {color:'#374151'};

  return (
    <nav style={{position:'sticky',top:0,zIndex:40,background:'#fff',borderBottom:'1px solid #e5e7eb',backdropFilter:'blur(4px)'}}>
      <div className="container" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <span style={{fontSize:18,fontWeight:700}}>AlgoDatta</span>
          <ul style={{display:'flex',gap:16,listStyle:'none',padding:0,margin:0}}>
            {items.map(it => (
              <li key={it.href}>
                <Link style={isActive(it.href)} href={it.href}>{it.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={() => { try { localStorage.removeItem('token'); } catch{}; router.replace('/login'); }}
          className="btn secondary"
          aria-label="Logout"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
