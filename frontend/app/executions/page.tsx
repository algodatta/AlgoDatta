"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

type Exec = {
  id: string;
  strategy_id?: string | null;
  symbol?: string | null;
  side?: string | null;
  status?: string | null;
  created_at?: string | null;
};

export default function Executions(){
  const [rows, setRows] = useState<Exec[]>([]);
  const [msg, setMsg] = useState("");

  const load = async ()=>{
    const res = await apiFetch("/api/admin/executions?limit=50");
    const data = await res.json().catch(()=>({}));
    if(res.ok) setRows(Array.isArray(data) ? data : (data.items || []));
    else setMsg(data.detail || "Failed to load");
  };

  useEffect(()=>{ load(); }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Executions</h1>
      {msg && <div className="text-sm text-gray-600">{msg}</div>}
      <table className="text-sm w-full bg-white rounded border overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Time</th>
            <th className="p-2 text-left">Strategy</th>
            <th className="p-2 text-left">Symbol</th>
            <th className="p-2 text-left">Side</th>
            <th className="p-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r)=>(
            <tr key={r.id} className="border-t">
              <td className="p-2">{r.created_at || ""}</td>
              <td className="p-2">{r.strategy_id || ""}</td>
              <td className="p-2">{r.symbol || ""}</td>
              <td className="p-2">{r.side || ""}</td>
              <td className="p-2">{r.status || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
