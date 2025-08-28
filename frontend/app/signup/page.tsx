"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signupRequest, loginRequest } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signupRequest(email.trim(), pw, name.trim() || undefined);
    if (res.ok) {
      // Ensure login if backend doesn't return token on create
      const login = await loginRequest(email.trim(), pw);
      setLoading(false);
      if (login.ok) { router.push("/dashboard"); return; }
      router.push("/login?created=1");
      return;
    }
    setLoading(false);
    setError(res.error || "Unable to create account");
  }

  return (
    <main style={{minHeight:"100svh",display:"grid",placeItems:"center",background:"#0b1020"}}>
      <div style={{width:"100%",maxWidth:480,background:"rgba(255,255,255,0.06)",backdropFilter:"blur(6px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:16,padding:24,boxShadow:"0 10px 30px rgba(0,0,0,.4)"}}>
        <div style={{textAlign:"center",marginBottom:16}}>
          <img src="/logo.svg" alt="AlgoDatta" style={{height:36,objectFit:"contain"}} onError={(e)=>{(e.currentTarget as HTMLImageElement).style.display="none"}}/>
          <h1 style={{color:"#fff",fontSize:22,fontWeight:700,margin:"8px 0 0"}}>Create your account</h1>
          <p style={{color:"rgba(255,255,255,0.7)",marginTop:6,fontSize:13}}>Join in less than a minute</p>
        </div>
        <form onSubmit={onSubmit} style={{display:"grid",gap:12}}>
          <label style={{display:"grid",gap:6}}>
            <span style={{color:"#cfd8dc",fontSize:12}}>Name</span>
            <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Jane Doe"
              style={{padding:"12px 14px",borderRadius:10,border:"1px solid #263043",background:"#11162a",color:"#e3f2fd",outline:"none"}} />
          </label>
          <label style={{display:"grid",gap:6}}>
            <span style={{color:"#cfd8dc",fontSize:12}}>Email</span>
            <input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email"
              style={{padding:"12px 14px",borderRadius:10,border:"1px solid #263043",background:"#11162a",color:"#e3f2fd",outline:"none"}} />
          </label>
          <label style={{display:"grid",gap:6}}>
            <span style={{color:"#cfd8dc",fontSize:12}}>Password</span>
            <input type="password" required value={pw} onChange={(e)=>setPw(e.target.value)} placeholder="Create a strong password" autoComplete="new-password"
              style={{padding:"12px 14px",borderRadius:10,border:"1px solid #263043",background:"#11162a",color:"#e3f2fd",outline:"none"}} />
          </label>
          {error && (
            <div style={{color:"#ff8a80",fontSize:12,background:"rgba(255,82,82,.15)",border:"1px solid rgba(255,82,82,.35)",padding:"8px 10px",borderRadius:8}}>
              {error}
            </div>
          )}
          <button type="submit" disabled={loading}
            style={{marginTop:4,background:"#4f8cff",border:"1px solid #2e6bff",color:"#fff",padding:"12px 14px",borderRadius:10,fontWeight:700,cursor:"pointer",opacity:loading?0.75:1}}>
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:12}}>
          <Link href="/login" style={{color:"#9ec1ff",fontSize:13}}>Have an account? Sign in</Link>
          <Link href="/reset" style={{color:"#9ec1ff",fontSize:13}}>Forgot password?</Link>
        </div>
      </div>
    </main>
  );
}
