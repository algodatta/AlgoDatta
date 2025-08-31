
"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await login(email, password);
    setLoading(false);
    if (res.ok) {
      const next = params?.get("next") || "/"; 
      router.push(next);
    } else {
      setError(res.error || "Login failed");
    }
  }

  return (
    <main style={{minHeight:"100svh", display:"grid", placeItems:"center", background:"#0b1020"}}>
      <form onSubmit={onSubmit} style={{background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:12, padding:24, width:"92%", maxWidth:420}}>
        <h1 style={{color:"#fff", fontSize:22, margin:0, marginBottom:8}}>Welcome back</h1>
        <p style={{color:"rgba(255,255,255,0.7)", marginTop:0, marginBottom:16, fontSize:13}}>Sign in to continue</p>
        <label style={{display:"grid", gap:6, marginBottom:10}}>
          <span style={{color:"#cbd5e1", fontSize:12}}>Email</span>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" type="email" required style={{padding:"10px 12px", background:"#0f172a", border:"1px solid #334155", borderRadius:8, color:"#fff"}}/>
        </label>
        <label style={{display:"grid", gap:6, marginBottom:10}}>
          <span style={{color:"#cbd5e1", fontSize:12}}>Password</span>
          <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" type="password" required style={{padding:"10px 12px", background:"#0f172a", border:"1px solid #334155", borderRadius:8, color:"#fff"}}/>
        </label>
        {error && <div style={{color:"#ef4444", fontSize:13, marginBottom:12}}>{error}</div>}
        <button disabled={loading} type="submit" style={{width:"100%", padding:"10px 12px", background:"#2563eb", color:"#fff", border:"0", borderRadius:8, fontWeight:600}}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
        <p style={{color:"#94a3b8", fontSize:12, marginTop:12}}>Tip: try admin@algodatta.com / ChangeMe123!</p>
      </form>
    </main>
  );
}
