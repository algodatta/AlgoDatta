"use client";
import { useEffect, useState } from "react";
import { apiBase, authHeaders } from "../lib/api";

type Strategy = { id:string; name:string; webhook_path:string; is_active:boolean; paper_trading:boolean };

export default function Strategies(){
  const [list,setList] = useState<Strategy[]>([]);
  const [name,setName] = useState("Breakout Strategy");
  const [msg,setMsg] = useState("");

  const load = async ()=>{
    const res = await fetch(`${apiBase()}/api/strategies`, { headers: authHeaders() as HeadersInit });
    const data = await res.json();
    if(res.ok) setList(data);
  };

  useEffect(()=>{ load(); },[]);

  const createStrat = async ()=>{
    setMsg("...");
    const res = await fetch(`${apiBase()}/api/strategies`,{
      method:"POST",
      headers: ({ ...authHeaders(), "Content-Type":"application/json" } as HeadersInit),
      body: JSON.stringify({name, paper_trading:true})
    });
    const data = await res.json();
    if(res.ok){ setMsg("Created"); setList([data, ...list]); } else setMsg(data.detail||"Error");
  };

  const toggle = async (id:string)=>{
    const res = await fetch(`${apiBase()}/api/strategies/${id}/toggle`,{ method:"PATCH", headers: authHeaders() as HeadersInit });
    const data = await res.json();
    if(res.ok){ setList(list.map(s=>s.id===id? data: s)); }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium">Strategies</h2>
      <div className="flex gap-2">
        <input className="border rounded p-2 flex-1" value={name} onChange={e=>setName(e.target.value)} />
        <button onClick={createStrat} className="px-3 py-2 bg-black text-white rounded">Create</button>
      </div>
      <div className="text-sm text-gray-500">{msg}</div>
      <table className="w-full text-sm bg-white rounded border">
        <thead className="bg-gray-100">
          <tr><th className="p-2 text-left">Name</th><th className="p-2">Webhook</th><th className="p-2">Active</th><th className="p-2">Action</th></tr>
        </thead>
        <tbody>
          {list.map(s=>(
            <tr key={s.id} className="border-t">
              <td className="p-2">{s.name}</td>
              <td className="p-2 text-xs">{s.webhook_path}</td>
              <td className="p-2">{s.is_active ? "ON":"OFF"}</td>
              <td className="p-2"><button onClick={()=>toggle(s.id)} className="text-blue-600 underline">Toggle</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
