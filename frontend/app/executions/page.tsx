'use client'
import { useEffect, useState } from 'react'
type Exec={id:number,strategy_id:number,side:string,qty:number,price:number|null,status:string,created_at:string}
export default function ExecutionsPage(){
  const [rows,setRows]=useState<Exec[]>([]); const [loading,setLoading]=useState(true)
  useEffect(()=>{ const token=localStorage.getItem('token'); if(!token){window.location.href='/login'; return}
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/executions`,{headers:{Authorization:`Bearer ${'${'}token}`}})
      .then(r=>r.json()).then(d=>{setRows(d); setLoading(false)})
  },[])
  return(<div className="space-y-4"><h1 className="text-xl font-semibold">Executions</h1>
    {loading? <div>Loading…</div> : (
      <div className="overflow-x-auto border border-neutral-800 rounded-xl"><table className="w-full text-sm">
        <thead className="bg-neutral-900/60"><tr><th className="text-left p-2">ID</th><th className="text-left p-2">Strategy</th><th className="text-left p-2">Side</th><th className="text-left p-2">Qty</th><th className="text-left p-2">Price</th><th className="text-left p-2">Status</th><th className="text-left p-2">Created</th></tr></thead>
        <tbody>{rows.map(r=>(<tr key={r.id} className="border-t border-neutral-800"><td className="p-2">{r.id}</td><td className="p-2">{r.strategy_id}</td><td className="p-2">{r.side}</td><td className="p-2">{r.qty}</td><td className="p-2">{r.price??'-'}</td><td className="p-2">{r.status}</td><td className="p-2">{new Date(r.created_at).toLocaleString()}</td></tr>))}</tbody>
      </table></div>
    )}
  </div>)
}
