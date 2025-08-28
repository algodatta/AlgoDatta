
"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

type Strategy = {
  id: string;
  name: string;
  symbol?: string;
  timeframe?: string;
  qty?: string;
  mode?: string;
  status?: string;
  paper_trading?: boolean;
  webhook_path?: string;
};

export default function StrategiesPage(){
  const [items, setItems] = useState<Strategy[]>([]);
  const [err, setErr] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({name:"", symbol:"", timeframe:"1m", qty:"1", mode:"intraday", paper_trading:true});

  const load = async () => {
    setErr("");
    const res = await apiFetch("/api/strategies");
    const data = await res.json().catch(()=>[]);
    if(res.ok) setItems(Array.isArray(data) ? data : (data.items || []));
    else setErr(data.detail || "Failed to load strategies");
  };

  useEffect(()=>{ load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    const res = await apiFetch("/api/strategies", { method: "POST", body: JSON.stringify(form) });
    const data = await res.json().catch(()=>({}));
    if(res.ok){
      setCreating(false);
      setForm({name:"", symbol:"", timeframe:"1m", qty:"1", mode:"intraday", paper_trading:true});
      load();
    } else {
      setErr(data.detail || "Create failed");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Strategies</h1>
        <button onClick={()=>setCreating(true)} className="px-3 py-1.5 rounded bg-blue-600 text-white">New Strategy</button>
      </div>
      {err && <div className="text-red-600 mb-3">{err}</div>}
      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Symbol</th>
              <th className="text-left p-2">Timeframe</th>
              <th className="text-left p-2">Qty</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Webhook</th>
            </tr>
          </thead>
          <tbody>
            {items.map(s => (
              <tr key={s.id} className="border-t">
                <td className="p-2">{s.name}</td>
                <td className="p-2">{s.symbol}</td>
                <td className="p-2">{s.timeframe}</td>
                <td className="p-2">{s.qty}</td>
                <td className="p-2">{s.status}</td>
                <td className="p-2">
                  {s.webhook_path ? <code>/api/webhook/{s.webhook_path}</code> : "-"}
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td className="p-3 text-gray-500" colSpan={6}>No strategies yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {creating && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <form onSubmit={create} className="bg-white rounded p-4 w-[420px] space-y-2">
            <h2 className="font-medium text-lg mb-2">Create Strategy</h2>
            <input className="w-full border p-2 rounded" placeholder="Name" value={form.name}
              onChange={e=>setForm({...form, name:e.target.value})} required />
            <input className="w-full border p-2 rounded" placeholder="Symbol (e.g. NATURALGAS)"
              value={form.symbol} onChange={e=>setForm({...form, symbol:e.target.value})} />
            <div className="flex gap-2">
              <input className="w-1/2 border p-2 rounded" placeholder="Timeframe" value={form.timeframe}
                onChange={e=>setForm({...form, timeframe:e.target.value})} />
              <input className="w-1/2 border p-2 rounded" placeholder="Qty" value={form.qty}
                onChange={e=>setForm({...form, qty:e.target.value})} />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm">Paper Trading</label>
              <input type="checkbox" checked={form.paper_trading}
                onChange={e=>setForm({...form, paper_trading:e.target.checked})} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="px-3 py-1.5 rounded border" onClick={()=>setCreating(false)}>Cancel</button>
              <button className="px-3 py-1.5 rounded bg-blue-600 text-white">Create</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
