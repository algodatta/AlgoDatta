"use client";
import { useState } from "react";
import { apiBase, setToken, getToken } from "../lib/api";

export default function Home(){
  const [email,setEmail] = useState("admin@example.com");
  const [password,setPassword] = useState("ChangeMe123!");
  const [msg,setMsg] = useState("");
  const loggedIn = !!getToken();

  const submit = async (path:string)=>{
    setMsg("...");
    const res = await fetch(`${apiBase()}/api/auth/${path}`,{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({email,password})
    });
    const data = await res.json();
    if(res.ok){
      if(data.access_token) setToken(data.access_token);
      setMsg("OK");
      location.reload();
    } else {
      setMsg(data.detail || "Error");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium">Welcome</h2>
      {!loggedIn ? (
        <div className="space-y-2">
          <input className="border p-2 rounded w-full" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" />
          <input className="border p-2 rounded w-full" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" />
          <div className="flex gap-2">
            <button onClick={()=>submit("register")} className="px-3 py-2 bg-black text-white rounded">Register</button>
            <button onClick={()=>submit("login")} className="px-3 py-2 bg-gray-800 text-white rounded">Login</button>
          </div>
          <div className="text-sm text-gray-500">{msg}</div>
        </div>
      ) : (
        <div className="p-4 border rounded bg-white">
          <p>You are logged in. Use the navigation to continue.</p>
        </div>
      )}
    </div>
  )
}
