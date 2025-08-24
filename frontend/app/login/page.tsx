"use client";
import { useState } from "react";
import { apiFetch, setToken } from "../../lib/api";
const QUICK = process.env.NEXT_PUBLIC_ENABLE_ADMIN_QUICKLOGIN === "1";
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";
const ADMIN_PASS = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "";

export default function Page(){
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    const data = await res.json().catch(()=>({}));
    if(res.ok){
      setToken(data.access_token);
      const next = new URLSearchParams(window.location.search).get("next") || "/strategies";
      location.href = next;
    } else {
      setMsg(data.detail || "Login failed");
    }
  };

  const quick = async () => {
    if(!QUICK) return;
    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASS }),
    });
    const data = await res.json().catch(()=>({}));
    if(res.ok){
      setToken(data.access_token);
      const next = new URLSearchParams(window.location.search).get("next") || "/strategies";
      location.href = next;
    } else {
      setMsg(data.detail || "Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
      {msg && <div className="text-red-600 mb-3">{msg}</div>}
      <form onSubmit={submit} className="space-y-3">
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full border p-2 rounded" />
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" className="w-full border p-2 rounded" />
        <button className="w-full bg-blue-600 text-white rounded p-2">Login</button>
      </form>
      {QUICK && (
        <div className="mt-3">
          <button onClick={quick} className="px-4 py-2 bg-amber-600 text-white rounded">Login as Admin</button>
        </div>
      )}
    </div>
  );
}
