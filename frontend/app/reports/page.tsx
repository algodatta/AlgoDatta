'use client';
import { useEffect, useMemo, useState } from 'react';
import { fetchJson } from '@/lib/fetcher';
import type { Execution } from '@/types/api';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';

function toLocalISO(date: Date) {
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0,16); // yyyy-mm-ddThh:mm
}

export default function ReportsPage() {
  const [rows, setRows] = useState<Execution[]>([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState<string>(toLocalISO(new Date(Date.now() - 24*3600e3)));
  const [to, setTo] = useState<string>(toLocalISO(new Date()));

  const params = useMemo(() => {
    const f = new Date(from).toISOString();
    const t = new Date(to).toISOString();
    return new URLSearchParams({ from: f, to: t, limit: '500' }).toString();
  }, [from, to]);

  async function load() {
    setLoading(true); setMsg('');
    try {
      const data = await fetchJson<Execution[]>(`/api/executions?${params}`);
      setRows(Array.isArray(data) ? data : []);
    } catch (e:any) { setMsg(e?.message || 'Failed to load'); }
    finally { setLoading(false); }
  }

  useEffect(()=>{ load(); }, [params]);

  function downloadCSV() {
    const url = `/api/reports/csv?${params}`;
    window.open(url, '_blank');
  }

  const totalPnL = rows.reduce((acc, r) => acc + (r.status === 'FILLED' ? (r.side==='SELL'?-1:1) * r.qty * r.price : 0), 0);

  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Reports</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm">From</label>
          <input type="datetime-local" value={from} onChange={e=>setFrom(e.target.value)} className="border rounded-xl px-2 py-1 text-sm"/>
          <label className="text-sm">To</label>
          <input type="datetime-local" value={to} onChange={e=>setTo(e.target.value)} className="border rounded-xl px-2 py-1 text-sm"/>
          <button onClick={load} className="rounded-xl border px-3 py-1.5 text-sm">Apply</button>
          <button onClick={downloadCSV} className="rounded-xl bg-black text-white px-3 py-1.5 text-sm">Export CSV</button>
        </div>
      </div>
      {msg && <p className="text-sm">{msg}</p>}
      <div className="text-sm opacity-70">Rows: {rows.length} · Estimated P&L (naïve): {totalPnL.toFixed(2)}</div>
      <Table>
        <THead>
          <TH>Time</TH><TH>Strategy</TH><TH>Symbol</TH><TH>Side</TH><TH numeric>Qty</TH><TH numeric>Price</TH><TH>Status</TH><TH>Order ID</TH><TH>Exchange</TH>
        </THead>
        <TBody>
          {rows.map(r => (
            <TR key={r.id}>
              <TD>{new Date(r.timestamp).toLocaleString()}</TD>
              <TD>{r.strategy_id}</TD>
              <TD>{r.symbol}</TD>
              <TD>{r.side}</TD>
              <TD numeric>{r.qty}</TD>
              <TD numeric>{r.price.toFixed(2)}</TD>
              <TD>{r.status}</TD>
              <TD>{r.order_id || '-'}</TD>
              <TD>{r.exchange || '-'}</TD>
            </TR>
          ))}
          {rows.length===0 && !loading && <TR><TD colSpan={9}>No data in range.</TD></TR>}
        </TBody>
      </Table>
    </div>
  );
}
