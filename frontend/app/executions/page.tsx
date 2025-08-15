"use client";
import { useEffect, useState } from "react";
import { apiBase, authHeaders } from "../../lib/api";

type Exec = { id:string; strategy_id:string; symbol:string; side:string; price:number };

export default function Executions(){
  const [rows,setRows] = useState<Exec[]>([]);

  const load = async ()=>{
    const res = await fetch(`${apiBase()}/api/executions`, { headers: authHeaders() });
    const data = await res.json();
    if(res.ok) setRows(data);
  };
  useEffect(()=>{ load(); },[]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium">Executions</h2>
      <table className="w-full text-sm bg-white rounded border">
        <thead className="bg-gray-100">
          <tr><th className="p-2 text-left">ID</th><th className="p-2">Strategy</th><th className="p-2">Symbol</th><th className="p-2">Side</th><th className="p-2">Price</th></tr>
        </thead>
        <tbody>
          {rows.map(r=> (
            <tr key={r.id} className="border-t">
              <td className="p-2 text-xs">{r.id.slice(0,8)}</td>
              <td className="p-2 text-xs">{r.strategy_id.slice(0,8)}</td>
              <td className="p-2">{r.symbol}</td>
              <td className="p-2">{r.side}</td>
              <td className="p-2">{r.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
