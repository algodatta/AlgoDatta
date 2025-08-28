"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginRequest } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextUrl, setNextUrl] = useState<string | null>(null);

  // parse ?next= without useSearchParams to avoid build issues
  useEffect(() => {
    if (typeof window !== "undefined") {
      const u = new URL(window.location.href);
      const nxt = u.searchParams.get("next");
      setNextUrl(nxt);
    }
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await loginRequest(identity.trim(), password);
    setLoading(false);
    if (res.ok) {
      router.push(nextUrl || "/dashboard");
      return;
    }
    setError(res.error || "Invalid credentials");
  }

  return (
    <main style={{minHeight:"100svh",display:"grid",placeItems:"center",background:"#0b1020"}}>
      <div style={{width:"100%",maxWidth:420,background:"rgba(255,255,255,0.06)",backdropFilter:"blur(6px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:16,padding:24,boxShadow:"0 10px 30px rgba(0,0,0,.4)"}}>
        <div style={{textAlign:"center",marginBottom:16}}>
          <img src="/logo.svg" alt="AlgoDatta" style={{height:36,objectFit:"contain"}} onError={(e)=>{(e.currentTarget as HTMLImageElement).style.display="none"}}/>
          <h1 style={{color:"#fff",fontSize:22,fontWeight:700,margin:"8px 0 0"}}>Welcome back</h1>
          <p style={{color:"rgba(255,255,255,0.7)",marginTop:6,fontSize:13}}>Please sign in to continue</p>
        </div>
        <form onSubmit={onSubmit} style={{display:"grid",gap:12}}>
          <label style={{display:"grid",gap:6}}>
            <span style={{color:"#cfd8dc",fontSize:12}}>Email or Username</span>
            <input value={identity} onChange={(e)=>setIdentity(e.target.value)} placeholder="you@company.com or username" autoComplete="username"
              style={{padding:"12px 14px",borderRadius:10,border:"1px solid #263043",background:"#11162a",color:"#e3f2fd",outline:"none"}} />
          </label>
          <label style={{display:"grid",gap:6}}>
            <span style={{color:"#cfd8dc",fontSize:12}}>Password</span>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Your password" autoComplete="current-password" required
              style={{padding:"12px 14px",borderRadius:10,border:"1px solid #263043",background:"#11162a",color:"#e3f2fd",outline:"none"}} />
          </label>
          {error && (
            <div style={{color:"#ff8a80",fontSize:12,background:"rgba(255,82,82,.15)",border:"1px solid rgba(255,82,82,.35)",padding:"8px 10px",borderRadius:8}}>
              {error}
            </div>
          )}
          <button type="submit" disabled={loading}
            style={{marginTop:4,background:"#4f8cff",border:"1px solid #2e6bff",color:"#fff",padding:"12px 14px",borderRadius:10,fontWeight:700,cursor:"pointer",opacity:loading?0.75:1}}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:12}}>
          <Link href="/signup" style={{color:"#9ec1ff",fontSize:13}}>Create account</Link>
          <Link href="/reset" style={{color:"#9ec1ff",fontSize:13}}>Forgot password?</Link>
        </div>
      </div>
    </main>
  );
}
