"use client";
import { useEffect, useState } from "react";
import { apiFetch, apiBase, authHeaders } from "../../lib/api";

type Strategy = {
  id: string;
  name: string;
  symbol?: string | null;
  timeframe?: string | null;
  qty?: string | null;
  mode?: string | null;
  paper_trading?: boolean;
  status?: "active" | "paused" | "error";
  webhook_path: string;
};

export default function Strategies(){
  const [list,setList] = useState<Strategy[]>([]);
  const [name,setName] = useState("NG Scalper");
  const [symbol,setSymbol] = useState("NATURALGAS");
  const [timeframe,setTimeframe] = useState("1m");
  const [qty,setQty] = useState("1");
  const [msg,setMsg] = useState("");

  const load = async ()=>{
    const res = await apiFetch("/api/strategies");
    const data = await res.json();
    if(res.ok) setList(Array.isArray(data) ? data : (data.items || []));
  };

  useEffect(()=>{ load(); }, []);

  const create = async ()=>{
    setMsg("");
    const res = await apiFetch("/api/strategies", {
      method: "POST",
      body: JSON.stringify({ name, symbol, timeframe, qty, mode: "intraday", paper_trading: true }),
    });
    const data = await res.json().catch(()=>({}));
    if(res.ok){ setMsg("Created"); await load(); }
    else setMsg(data.detail || "Create failed");
  };

  const toggle = async (id:string)=>{
    setMsg("");
    const res = await apiFetch(`/api/strategies/${id}/toggle`, { method: "POST" });
    if(res.ok){ await load(); } else setMsg("Toggle failed");
  };

  const rotate = async (id:string)=>{
    setMsg("");
    const res = await apiFetch(`/api/strategies/${id}/rotate-webhook`, { method: "POST" });
    if(res.ok){ setMsg("Rotated webhook"); await load(); } else setMsg("Rotate failed");
  };

  const webhookUrl = (s: Strategy)=> `${apiBase()}/api/webhook/${s.webhook_path}`;

  const copy = async (text:string)=>{
    try { await navigator.clipboard.writeText(text); setMsg("Copied"); }
    catch { setMsg("Copy failed"); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Strategies</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 max-w-4xl">
        <input className="border rounded p-2" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="border rounded p-2" placeholder="Symbol" value={symbol} onChange={e=>setSymbol(e.target.value)} />
        <input className="border rounded p-2" placeholder="Timeframe" value={timeframe} onChange={e=>setTimeframe(e.target.value)} />
        <input className="border rounded p-2" placeholder="Qty" value={qty} onChange={e=>setQty(e.target.value)} />
        <button onClick={create} className="px-4 py-2 bg-black text-white rounded">Create</button>
      </div>

      {msg && <div className="text-sm text-gray-600">{msg}</div>}

      <table className="text-sm w-full max-w-5xl bg-white rounded border overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Webhook</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.map(s=>(
            <tr key={s.id} className="border-t">
              <td className="p-2">{s.name}</td>
              <td className="p-2">{s.status || "unknown"}</td>
              <td className="p-2">
                <div className="max-w-[380px] truncate font-mono text-xs">{webhookUrl(s)}</div>
              </td>
              <td className="p-2 flex gap-2">
                <button onClick={()=>toggle(s.id)} className="text-blue-600 underline">Toggle</button>
                <button onClick={()=>rotate(s.id)} className="text-amber-600 underline">Rotate</button>
                <button onClick={()=>copy(webhookUrl(s))} className="text-green-700 underline">Copy</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
