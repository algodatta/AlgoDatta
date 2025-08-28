"use client";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { requestPasswordReset, resetPassword } from "@/lib/api";

function ResetClient() {
  const params = useSearchParams();
  const router = useRouter();
  const token = useMemo(() => params.get("token") || params.get("code") || "", [params]);

  // Request link
  const [email, setEmail] = useState("");
  const [reqLoading, setReqLoading] = useState(false);
  const [reqMsg, setReqMsg] = useState<string | null>(null);
  const [reqErr, setReqErr] = useState<string | null>(null);

  // Perform reset
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [doLoading, setDoLoading] = useState(false);
  const [doErr, setDoErr] = useState<string | null>(null);

  async function submitRequest(e: React.FormEvent) {
    e.preventDefault();
    setReqMsg(null); setReqErr(null); setReqLoading(true);
    const res = await requestPasswordReset(email.trim());
    setReqLoading(false);
    if (res.ok) { setReqMsg("If the email exists, a reset link has been sent."); return; }
    setReqErr(res.error || "Unable to send reset link");
  }

  async function submitReset(e: React.FormEvent) {
    e.preventDefault();
    setDoErr(null);
    if (pw1.length < 6) { setDoErr("Password must be at least 6 characters"); return; }
    if (pw1 !== pw2) { setDoErr("Passwords do not match"); return; }
    setDoLoading(true);
    const res = await resetPassword(token, pw1);
    setDoLoading(false);
    if (res.ok) { router.push("/login?reset=1"); return; }
    setDoErr(res.error || "Unable to reset password");
  }

  return (
    <main style={{minHeight:"100svh",display:"grid",placeItems:"center",background:"#0b1020"}}>
      <div style={{width:"100%",maxWidth:480,background:"rgba(255,255,255,0.06)",backdropFilter:"blur(6px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:16,padding:24,boxShadow:"0 10px 30px rgba(0,0,0,.4)"}}>
        <div style={{textAlign:"center",marginBottom:16}}>
          <img src="/logo.svg" alt="AlgoDatta" style={{height:36,objectFit:"contain"}} onError={(e)=>{(e.currentTarget as HTMLImageElement).style.display="none"}}/>
          <h1 style={{color:"#fff",fontSize:22,fontWeight:700,margin:"8px 0 0"}}>
            {token ? "Set a new password" : "Reset your password"}
          </h1>
          <p style={{color:"rgba(255,255,255,0.7)",marginTop:6,fontSize:13}}>
            {token ? "Choose a new password for your account." : "We'll send a link to your email."}
          </p>
        </div>

        {!token ? (
          <form onSubmit={submitRequest} style={{display:"grid",gap:12}}>
            <label style={{display:"grid",gap:6}}>
              <span style={{color:"#cfd8dc",fontSize:12}}>Email</span>
              <input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email"
                style={{padding:"12px 14px",borderRadius:10,border:"1px solid #263043",background:"#11162a",color:"#e3f2fd",outline:"none"}} />
            </label>
            {reqErr && <div style={{color:"#ff8a80",fontSize:12,background:"rgba(255,82,82,.15)",border:"1px solid rgba(255,82,82,.35)",padding:"8px 10px",borderRadius:8}}>{reqErr}</div>}
            {reqMsg && <div style={{color:"#b9f6ca",fontSize:12,background:"rgba(76,175,80,.18)",border:"1px solid rgba(76,175,80,.35)",padding:"8px 10px",borderRadius:8}}>{reqMsg}</div>}
            <button type="submit" disabled={reqLoading}
              style={{marginTop:4,background:"#4f8cff",border:"1px solid #2e6bff",color:"#fff",padding:"12px 14px",borderRadius:10,fontWeight:700,cursor:"pointer",opacity:reqLoading?0.75:1}}>
              {reqLoading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        ) : (
          <form onSubmit={submitReset} style={{display:"grid",gap:12}}>
            <label style={{display:"grid",gap:6}}>
              <span style={{color:"#cfd8dc",fontSize:12}}>New password</span>
              <input type="password" required value={pw1} onChange={(e)=>setPw1(e.target.value)} placeholder="Enter a new password" autoComplete="new-password"
                style={{padding:"12px 14px",borderRadius:10,border:"1px solid #263043",background:"#11162a",color:"#e3f2fd",outline:"none"}} />
            </label>
            <label style={{display:"grid",gap:6}}>
              <span style={{color:"#cfd8dc",fontSize:12}}>Confirm password</span>
              <input type="password" required value={pw2} onChange={(e)=>setPw2(e.target.value)} placeholder="Re-type password" autoComplete="new-password"
                style={{padding:"12px 14px",borderRadius:10,border:"1px solid #263043",background:"#11162a",color:"#e3f2fd",outline:"none"}} />
            </label>
            {doErr && <div style={{color:"#ff8a80",fontSize:12,background:"rgba(255,82,82,.15)",border:"1px solid rgba(255,82,82,.35)",padding:"8px 10px",borderRadius:8}}>{doErr}</div>}
            <button type="submit" disabled={doLoading}
              style={{marginTop:4,background:"#4f8cff",border:"1px solid #2e6bff",color:"#fff",padding:"12px 14px",borderRadius:10,fontWeight:700,cursor:"pointer",opacity:doLoading?0.75:1}}>
              {doLoading ? "Saving…" : "Update password"}
            </button>
          </form>
        )}

        <div style={{display:"flex",justifyContent:"space-between",marginTop:12}}>
          <Link href="/login" style={{color:"#9ec1ff",fontSize:13}}>Back to login</Link>
          <Link href="/signup" style={{color:"#9ec1ff",fontSize:13}}>Create account</Link>
        </div>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div style={{color:"#fff",textAlign:"center"}}>Loading…</div>}>
      <ResetClient />
    </Suspense>
  );
}
