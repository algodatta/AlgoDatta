"use client";
import { useEffect, useState } from "react";
import { apiBase, apiFetch } from "../../lib/api";

type Summary = { total_pnl?: number; count?: number };

export default function Reports(){
  const [fromDate, setFrom] = useState<string>("");
  const [toDate, setTo] = useState<string>("");
  const [strategy, setStrategy] = useState<string>("");
  const [msg, setMsg] = useState("");
  const [summary, setSummary] = useState<Summary| null>(null);

  const qs = ()=>{
    const p: string[] = [];
    if (fromDate) p.push(`from_date=${encodeURIComponent(fromDate)}`);
    if (toDate) p.push(`to_date=${encodeURIComponent(toDate)}`);
    if (strategy) p.push(`strategy_id=${encodeURIComponent(strategy)}`);
    return p.length ? ("?" + p.join("&")) : "";
  };

  const downloadCsv = ()=>{
    const url = `${apiBase()}/api/reports/executions.csv${qs()}`;
    window.open(url, "_blank");
  };

  const loadSummary = async ()=>{
    const res = await apiFetch(`/api/reports/pnl/summary${qs()}`);
    const data = await res.json().catch(()=>({}));
    if (res.ok) setSummary(data);
    else setMsg(data.detail || "Failed to load");
  };

  useEffect(()=>{ loadSummary(); }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 max-w-3xl">
        <input type="datetime-local" className="border rounded p-2" value={fromDate} onChange={e=>setFrom(e.target.value)} />
        <input type="datetime-local" className="border rounded p-2" value={toDate} onChange={e=>setTo(e.target.value)} />
        <input className="border rounded p-2" placeholder="Strategy UUID" value={strategy} onChange={e=>setStrategy(e.target.value)} />
        <div className="flex gap-2">
          <button onClick={loadSummary} className="px-3 py-2 bg-gray-800 text-white rounded">Refresh</button>
          <button onClick={downloadCsv} className="px-3 py-2 bg-black text-white rounded">CSV</button>
        </div>
      </div>

      {summary && (
        <div className="bg-white border rounded p-3 max-w-md">
          <div>Total PnL: <b>{summary.total_pnl ?? 0}</b></div>
          <div>Count: <b>{summary.count ?? 0}</b></div>
        </div>
      )}

      {msg && <div className="text-sm text-gray-600">{msg}</div>}
    </div>
  );
}
