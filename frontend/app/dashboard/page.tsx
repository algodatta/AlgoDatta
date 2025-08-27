'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Summary = {
  pnl?: number;
  open_orders?: number;
  positions?: number;
  strategies?: number;
  alerts_24h?: number;
};

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_BASE || '';
    fetch(base.replace(/\/$/,'') + '/dashboard/summary')
      .then(async (r) => {
        if (!r.ok) throw new Error('Failed to load summary');
        return r.json();
      })
      .then((data) => setSummary(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link className="underline" href="/logout">Logout</Link>
      </header>

      {loading && <p>Loading summary…</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card title="PnL (Today)">{summary?.pnl ?? '—'}</Card>
        <Card title="Open Orders">{summary?.open_orders ?? '—'}</Card>
        <Card title="Open Positions">{summary?.positions ?? '—'}</Card>
        <Card title="Strategies">{summary?.strategies ?? '—'}</Card>
        <Card title="Alerts (24h)">{summary?.alerts_24h ?? '—'}</Card>
      </section>

      <nav className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <NavCard href="/broker" title="Broker">
          Connect your Dhan account, view profile, holdings & positions.
        </NavCard>
        <NavCard href="/executions" title="Executions (Live)">
          Live trades stream, order book, and status.
        </NavCard>
        <NavCard href="/strategies" title="Strategies">
          Create, toggle, and monitor strategies.
        </NavCard>
        <NavCard href="/reports" title="Reports">
          Export CSV, filter by instrument/date, P&L dashboards.
        </NavCard>
        <NavCard href="/admin" title="Admin">
          Users, roles, audit logs, system health.
        </NavCard>
        <NavCard href="/notifications" title="Notifications">
          Telegram / Slack / Discord alert settings.
        </NavCard>
      </nav>
    </main>
  );
}

function Card({ title, children }: { title: string; children: any }) {
  return (
    <div className="rounded-2xl shadow p-4 border">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="text-3xl font-semibold mt-1">{children}</div>
    </div>
  );
}

function NavCard({ href, title, children }: { href: string; title: string; children: any }) {
  return (
    <Link href={href} className="block rounded-2xl shadow p-4 border hover:shadow-md transition">
      <div className="text-lg font-semibold">{title}</div>
      <div className="text-gray-600 text-sm mt-1">{children}</div>
    </Link>
  );
}
