'use client';
import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [health, setHealth] = useState<any>(null);
  const [msg, setMsg] = useState('');

  useEffect(()=>{
    (async () => {
      try {
        const r = await fetch('/healthz');
        const j = await r.json();
        setHealth(j);
      } catch (e:any) {
        setMsg(e?.message || 'Failed to load health');
      }
    })();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Admin</h1>
      {msg && <p className="text-sm">{msg}</p>}
      <section>
        <h2 className="font-medium mb-2">System Health</h2>
        <pre className="p-3 border rounded bg-gray-50 overflow-auto text-sm">{JSON.stringify(health, null, 2)}</pre>
      </section>
    </div>
  );
}
