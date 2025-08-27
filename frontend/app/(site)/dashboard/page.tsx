import Link from 'next/link';

export default function DashboardPage() {
  const cards = [
    { title: 'Broker Integration', href: '/broker', desc: 'Connect DhanHQ, view profile/holdings/positions.' },
    { title: 'Strategy Manager', href: '/strategies', desc: 'Create, toggle start/stop, live logs.' },
    { title: 'Reports', href: '/reports', desc: 'P&L, executions, export CSV.' },
    { title: 'Admin', href: '/admin', desc: 'Users, roles, system health, alerts.' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Administrator Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(c => (
          <Link key={c.href} href={c.href}
            className="rounded-2xl border p-4 hover:shadow">
            <div className="text-lg font-medium">{c.title}</div>
            <p className="text-sm mt-1 opacity-80">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
