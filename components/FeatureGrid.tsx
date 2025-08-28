import Link from 'next/link';

const features = [
  { href: '/dashboard',  label: 'Dashboard',  desc: 'Overview & KPIs',     icon: '📊' },
  { href: '/strategies', label: 'Strategies', desc: 'Create & manage',      icon: '🧠' },
  { href: '/executions', label: 'Executions', desc: 'Signals & fills',      icon: '⚡' },
  { href: '/orders',     label: 'Orders',     desc: 'Order book & status',  icon: '📝' },
  { href: '/reports',    label: 'Reports',    desc: 'PNL & CSV export',     icon: '📈' },
  { href: '/admin',      label: 'Admin',      desc: 'Users & brokers',      icon: '🛠️' },
  { href: '/logout',     label: 'Logout',     desc: 'Sign out safely',      icon: '🚪' },
];

export default function FeatureGrid() {
  return (
    <div className="feature-grid">
      {features.map(f => (
        <Link key={f.href} href={f.href} className="feature-card">
          <div className="icon" aria-hidden>{f.icon}</div>
          <h3>{f.label}</h3>
          <p>{f.desc}</p>
        </Link>
      ))}
    </div>
  );
}
