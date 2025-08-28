
"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

type Order = Record<string, any>;

export default function OrdersPage(){
  const [rows, setRows] = useState<Order[]>([]);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    const res = await apiFetch("/api/orders/page?limit=50");
    const data = await res.json().catch(()=>({items: []}));
    if(res.ok) setRows(data.items || data || []);
    else setErr(data.detail || "Failed to load orders");
  };

  useEffect(()=>{ load(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold">Orders</h1>
        <button className="px-3 py-1.5 rounded border" onClick={load}>Refresh</button>
      </div>
      {err && <div className="text-red-600 mb-2">{err}</div>}
      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50"><tr>
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Symbol</th>
            <th className="p-2 text-left">Side</th>
            <th className="p-2 text-left">Qty</th>
            <th className="p-2 text-left">Status</th>
          </tr></thead>
          <tbody>
            {rows.map((o:any)=>(
              <tr key={o.id || o.order_id} className="border-t">
                <td className="p-2">{o.id || o.order_id}</td>
                <td className="p-2">{o.symbol}</td>
                <td className="p-2">{o.side}</td>
                <td className="p-2">{o.qty}</td>
                <td className="p-2">{o.status}</td>
              </tr>
            ))}
            {rows.length===0 && <tr><td colSpan={5} className="p-3 text-gray-500">No orders.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
