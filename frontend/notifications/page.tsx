"use client";
import { useEffect, useState } from "react";
import { apiBase, authHeaders } from '@/lib/api';

type Notif = { id: string; type: "telegram" | "email"; destination: string; verified: boolean };

export default function NotificationsPage(){
  const [rows, setRows] = useState<Notif[]>([]);
  const [type, setType] = useState<"telegram"|"email">("telegram");
  const [dest, setDest] = useState("");

  const load = async ()=>{
    const r = await fetch(`${apiBase}/api/notifications`, { headers: authHeaders() as HeadersInit });
    if(r.ok) setRows(await r.json());
  };
  useEffect(()=>{ load(); },[]);

  const add = async ()=>{
    await fetch(`${apiBase}/api/notifications`, {
      method:"POST",
      headers: ({...authHeaders(), "Content-Type":"application/json"}) as HeadersInit,
      body: JSON.stringify({ type, destination: dest })
    });
    setDest(""); load();
  };

  const verify = async (id: string, v: boolean)=>{
    await fetch(`${apiBase}/api/notifications/${id}/verify`, {
      method:"PATCH",
      headers: ({...authHeaders(), "Content-Type":"application/json"}) as HeadersInit,
      body: JSON.stringify({ verified: v })
    });
    load();
  };

  const delItem = async (id: string)=>{
    await fetch(`${apiBase}/api/notifications/${id}`, { method:"DELETE", headers: authHeaders() as HeadersInit });
    load();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium">Notifications</h2>

      <div className="flex gap-2 items-center">
        <select className="border rounded p-2" value={type} onChange={e=>setType(e.target.value as any)}>
          <option value="telegram">Telegram</option>
          <option value="email">Email</option>
        </select>
        <input className="border rounded p-2 flex-1" placeholder={type==="telegram"?"Telegram chat_id":"Email address"} value={dest} onChange={e=>setDest(e.target.value)} />
        <button onClick={add} className="px-3 py-2 bg-black text-white rounded">Add</button>
      </div>

      <table className="w-full text-sm bg-white rounded border">
        <thead className="bg-gray-100">
          <tr><th className="p-2 text-left">Type</th><th className="p-2 text-left">Destination</th><th className="p-2">Verified</th><th className="p-2">Actions</th></tr>
        </thead>
        <tbody>
          {rows.map(r=> (
            <tr key={r.id} className="border-t">
              <td className="p-2">{r.type}</td>
              <td className="p-2">{r.destination}</td>
              <td className="p-2">{r.verified ? "Yes":"No"}</td>
              <td className="p-2 space-x-2">
                <button onClick={()=>verify(r.id, true)} className="px-2 py-1 border rounded">Verify</button>
                <button onClick={()=>delItem(r.id)} className="px-2 py-1 border rounded">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
