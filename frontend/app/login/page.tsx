"use client";
import { useState } from "react";
import { apiFetch, setToken } from "../../lib/api";

export default function LoginPage(){
  const [email, setEmail] = useState("admin@algodatta.com");
  const [password, setPassword] = useState("Admin@123");
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent)=>{
    e.preventDefault();
    setMsg("");
    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(()=>({}));
    if(res.ok){
      setToken(data.access_token);
      location.href = "/strategies";
    }else{
      setMsg(data.detail || "Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h1 className="text-xl font-semibold mb-4">Login</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border rounded px-3 py-2" placeholder="Email"
               value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Password" type="password"
               value={password} onChange={(e)=>setPassword(e.target.value)} />
        <button className="px-4 py-2 bg-black text-white rounded">Login</button>
      </form>
      {msg && <div className="text-sm text-red-600 mt-2">{msg}</div>}
    </div>
  );
}
