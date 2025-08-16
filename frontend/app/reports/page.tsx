"use client";
import { useEffect, useState } from "react";
import { apiBase, authHeaders } from "../../lib/api";

type PnL = { total_pnl: string; by_day: { key: string; pnl: string }[]; by_strategy: { key: string; pnl: string }[]; count: number };

export default function Reports(){
  const [fromDate, setFrom] = useState<string>("");
  const [toDate, setTo] = useState<string>("");
  const [strategy, setStrategy] = useState<string>("");
  const [pnl, setPnl] = useState<PnL | null>(null);

  const params = ()=>{
    const ps: string[] = [];
    if (fromDate) ps.push(`from_date=${encodeURIComponent(fromDate)}`);
    if (toDate) ps.push(`to_date=${encodeURIComponent(toDate)}`);
    if (strategy) ps.push(`strategy_id=${encodeURIComponent(strategy)}`);
    return ps.length ? `?${ps.join("&")}` : "";
  };

  const fetchPnl = async ()=>{
    const r = await fetch(`${apiBase()}/api/reports/pnl/summary${params()}`, { headers: authHeaders() as HeadersInit });
    if (r.ok) setPnl(await r.json());
  };

  useEffect(()=>{ fetchPnl(); },[]);

  const download = ()=>{
    const url = `${apiBase()}/api/reports/csv${params()}`;
    fetch(url,{ headers: authHeaders() as HeadersInit })
      .then(r=>r.blob())
      .then(b=>{
        const a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = 'executions.csv';
        a.click();
      });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium">Reports</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 max-w-3xl">
        <input type="datetime-local" className="border rounded p-2" value={fromDate} onChange={e=>setFrom(e.target.value)} />
        <input type="datetime-local" className="border rounded p-2" value={toDate} onChange={e=>setTo(e.target.value)} />
        <input className="border rounded p-2" placeholder="Strategy ID (optional)" value={strategy} onChange={e=>setStrategy(e.target.value)} />
        <div className="flex gap-2">
          <button onClick={fetchPnl} className="px-3 py-2 bg-white border rounded">Apply</button>
          <button onClick={download} className="px-3 py-2 bg-black text-white rounded">Download CSV</button>
        </div>
      </div>

      {pnl && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 rounded border bg-white">
            <div className="text-sm text-gray-500">Total PnL</div>
            <div className="text-2xl font-semibold">{pnl.total_pnl}</div>
          </div>
          <div className="p-3 rounded border bg-white">
            <div className="text-sm text-gray-500 mb-2">PnL by Day</div>
            <ul className="text-sm space-y-1">{pnl.by_day.map(d=>(<li key={d.key} className="flex justify-between"><span>{d.key}</span><span>{d.pnl}</span></li>))}</ul>
          </div>
          <div className="p-3 rounded border bg-white">
            <div className="text-sm text-gray-500 mb-2">PnL by Strategy</div>
            <ul className="text-sm space-y-1">{pnl.by_strategy.map(d=>(<li key={d.key} className="flex justify-between"><span>{d.key.slice(0,8)}</span><span>{d.pnl}</span></li>))}</ul>
          </div>
        </div>
      )}
    </div>
  );
}
