"use client";
import { useEffect, useState } from "react";
import { apiBase, authHeaders } from "../../lib/api";

type Position = { strategy_id: string; position_qty?: number; avg_price?: string };
type Order = { id: string; strategy_id?: string; side?: string; qty?: string; price?: string; status?: string; created_at?: string };

export default function Broker(){
  const [token,setToken] = useState("");
  const [msg,setMsg] = useState("");
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const save = async ()=>{
    setMsg("...");
    const res = await fetch(`${apiBase}/api/broker`,{
      method:"POST",
      headers: ({ ...authHeaders(), "Content-Type":"application/json" } as HeadersInit),
      body: JSON.stringify({auth_token: token})
    });
    const data = await res.json().catch(()=>({}));
    setMsg(res.ok ? "Linked" : (data.detail || "Error"));
  };

  const load = async ()=>{
    const pr = fetch(`${apiBase}/api/positions`, { headers: authHeaders() as HeadersInit });
    const or = fetch(`${apiBase}/api/orders`, { headers: authHeaders() as HeadersInit });
    const [rp, ro] = await Promise.all([pr, or]);
    if (rp.ok) setPositions(await rp.json());
    if (ro.ok) setOrders(await ro.json());
  };

  useEffect(()=>{ load(); },[]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-xl font-medium">Broker Integration (Dhan)</h2>
        <input className="border rounded p-2 w-full" placeholder="Access token" value={token} onChange={e=>setToken(e.target.value)} />
        <button onClick={save} className="px-3 py-2 bg-black text-white rounded">Save</button>
        <div className="text-sm text-gray-500">{msg}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h3 className="font-medium text-lg">Positions</h3>
          <table className="w-full text-sm bg-white rounded border">
            <thead className="bg-gray-100"><tr><th className="p-2 text-left">Strategy</th><th className="p-2">Qty</th><th className="p-2">Avg Price</th></tr></thead>
            <tbody>
              {positions.map(p => (
                <tr key={p.strategy_id} className="border-t">
                  <td className="p-2">{p.strategy_id.slice(0,8)}</td>
                  <td className="p-2">{p.position_qty ?? ""}</td>
                  <td className="p-2">{p.avg_price ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-2">
          <h3 className="font-medium text-lg">Recent Orders</h3>
          <table className="w-full text-sm bg-white rounded border">
            <thead className="bg-gray-100"><tr><th className="p-2 text-left">ID</th><th className="p-2">Strategy</th><th className="p-2">Side</th><th className="p-2">Qty</th><th className="p-2">Price</th><th className="p-2">Status</th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-t">
                  <td className="p-2 text-xs">{o.id.slice(0,8)}</td>
                  <td className="p-2 text-xs">{o.strategy_id?.slice(0,8) || ""}</td>
                  <td className="p-2">{o.side}</td>
                  <td className="p-2">{o.qty}</td>
                  <td className="p-2">{o.price}</td>
                  <td className="p-2">{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
