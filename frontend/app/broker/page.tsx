"use client";
import { useState } from "react";
import { apiBase, authHeaders } from "../../lib/api";

export default function Broker(){
  const [token,setToken] = useState("");
  const [msg,setMsg] = useState("");

  const save = async ()=>{
    setMsg("...");
    const res = await fetch(`${apiBase()}/api/broker`,{
      method:"POST",
      headers: ({ ...authHeaders(), "Content-Type":"application/json" } as HeadersInit),
      body: JSON.stringify({auth_token: token})
    });
    const data = await res.json().catch(()=>({}));
    setMsg(res.ok ? "Linked" : (data.detail || "Error"));
  };

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-medium">Broker Integration (Dhan)</h2>
      <input className="border rounded p-2 w-full" placeholder="Paste Dhan auth token" value={token} onChange={e=>setToken(e.target.value)} />
      <button onClick={save} className="px-3 py-2 bg-black text-white rounded">Save</button>
      <div className="text-sm text-gray-500">{msg}</div>
    </div>
  );
}
