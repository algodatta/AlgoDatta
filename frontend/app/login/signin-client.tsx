'use client';
import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams, Link } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.algodatta.com';

function parseJwt(token: string) {
  try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
}

function Inner(){
  const sp = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState('admin@algodatta.com');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string|null>(null);

  async function onSubmit(e: React.FormEvent){
    e.preventDefault(); setErr(null); setLoading(true);
    try{
      const r = await fetch(`${API_BASE}/api/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email,password}) });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.detail || j?.error || r.statusText);

      const token = j.access_token as string;
      const payload = parseJwt(token);
      localStorage.setItem('token', token);
      if (payload?.role) localStorage.setItem('role', payload.role);

      await fetch('/api/auth/set-cookie', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ token, exp: payload?.exp }) });

      router.replace(sp.get('next') || '/dashboard');
    }catch(e:any){ setErr(e.message||'Login failed'); } finally{ setLoading(false); }
  }

  return (
    <div className="card" style={{maxWidth:420, margin:'40px auto'}}>
      <h1 style={{fontSize:24, fontWeight:700, marginBottom:12}}>Sign in</h1>
      <form onSubmit={onSubmit} className="grid" style={{gap:12}}>
        <div>
          <label className="block" style={{fontSize:12, marginBottom:6}}>Email</label>
          <input className="input" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username" />
        </div>
        <div>
          <label className="block" style={{fontSize:12, marginBottom:6}}>Password</label>
          <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" />
        </div>
        <button className="btn" disabled={loading}>{loading?'Signing in…':'Sign in'}</button>
        {err && <div style={{color:'#c00', fontSize:13}}>{err}</div>}
        <div style={{fontSize:13}}>New here? <a href="/register" style={{textDecoration:'underline'}}>Create an account</a></div>
      </form>
    </div>
  );
}

export default function SignInClient(){ return <Suspense fallback={null}><Inner/></Suspense>; }
