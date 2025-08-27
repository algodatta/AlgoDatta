'use client';
import { useEffect, useRef, useState } from 'react';
import { apiBase, getToken } from '@/app/lib/api';
type Msg = { id?: string; status?: string; [k: string]: any };
export default function LiveExecutionsPage() {
  const [items, setItems] = useState<Msg[]>([]);
  const esRef = useRef<EventSource | null>(null);
  useEffect(() => {
    const token = getToken();
    const url = `${apiBase}/api/executions/stream${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    let es: EventSource | null = null; let closed = false;
    try {
      es = new EventSource(url, { withCredentials: false });
      esRef.current = es;
      es.onmessage = (ev) => {
        try { setItems(p => [JSON.parse(ev.data), ...p].slice(0,200)); }
        catch { setItems(p => [{ raw: ev.data }, ...p].slice(0,200)); }
      };
      es.onerror = () => { if (!closed) { es?.close(); esRef.current = null; } };
    } catch {}
    return () => { closed = true; es?.close(); esRef.current = null; };
  }, []);
  if (!apiBase) return <div className="p-6">Live stream unavailable (missing NEXT_PUBLIC_API_BASE).</div>;
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-3">Live Executions</h2>
      <div className="grid gap-2">
        {items.length === 0 && <div className="text-sm text-neutral-500">Waiting for events…</div>}
        {items.map((m, i) => (<pre key={m.id || i} className="bg-black/5 rounded p-2 text-xs overflow-x-auto">{JSON.stringify(m,null,2)}</pre>))}
      </div>
    </div>
  );
}
