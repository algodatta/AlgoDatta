'use client';

import { useEffect, useState } from 'react';

type Status = {
  connected: boolean;
  broker?: string;
  account?: string;
  error?: string | null;
};

export default function BrokerConnect() {
  const [status, setStatus] = useState<Status>({ connected: false });

  async function refresh() {
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE || '';
      const r = await fetch(base.replace(/\/$/,'') + '/api/broker/status', { credentials: 'include' });
      if (!r.ok) throw new Error(await r.text());
      const data = await r.json();
      setStatus({ connected: Boolean(data?.connected), broker: data?.broker, account: data?.account, error: null });
    } catch (e: any) {
      setStatus((s) => ({ ...s, error: e.message }));
    }
  }

  async function connect() {
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE || '';
      const r = await fetch(base.replace(/\/$/,'') + '/api/broker/connect', { method: 'POST', credentials: 'include' });
      if (!r.ok) throw new Error(await r.text());
      await refresh();
    } catch (e: any) {
      setStatus((s) => ({ ...s, error: e.message }));
    }
  }

  async function disconnect() {
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE || '';
      const r = await fetch(base.replace(/\/$/,'') + '/api/broker/disconnect', { method: 'POST', credentials: 'include' });
      if (!r.ok) throw new Error(await r.text());
      await refresh();
    } catch (e: any) {
      setStatus((s) => ({ ...s, error: e.message }));
    }
  }

  useEffect(() => { refresh(); }, []);

  return (
    <div className="rounded-2xl border p-4 shadow">
      <h2 className="text-lg font-semibold">Broker Connection</h2>
      <p className="text-sm text-gray-600 mb-2">DhanHQ integration</p>

      <div className="mb-3">
        <span className={"inline-block px-2 py-1 rounded text-white " + (status.connected ? "bg-green-600" : "bg-gray-400")}>
          {status.connected ? "Connected" : "Disconnected"}
        </span>
        {status.account && <span className="ml-2 text-sm text-gray-700">({status.account})</span>}
      </div>

      {status.error && <p className="text-red-600 text-sm mb-2">Error: {status.error}</p>}

      <div className="flex gap-2">
        <button onClick={connect} className="border rounded px-3 py-1 hover:shadow">Connect</button>
        <button onClick={disconnect} className="border rounded px-3 py-1 hover:shadow">Disconnect</button>
        <button onClick={refresh} className="border rounded px-3 py-1 hover:shadow">Refresh</button>
      </div>
    </div>
  );
}
