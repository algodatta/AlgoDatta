'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.algodatta.com';
const REGISTER_PATH = process.env.NEXT_PUBLIC_REGISTER_PATH || '/api/auth/register';

export default function Register(){
  const r = useRouter();
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [loading,setLoading] = useState(false);
  const [msg,setMsg] = useState<string|null>(null);

  async function onSubmit(e:React.FormEvent){
    e.preventDefault(); setMsg(null); setLoading(true);
    try{
      const res = await fetch(`${API_BASE}${REGISTER_PATH}`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email, password })
      });
      const data = await res.json().catch(()=>({}));
      if(!res.ok){ throw new Error(data?.detail || data?.error || res.statusText); }
      setMsg('Account created. Please sign in.');
      setTimeout(()=>r.replace('/login'), 800);
    }catch(e:any){ setMsg(`Failed: ${e.message}`);} finally{ setLoading(false); }
  }

  return (
    <div className="card" style={{maxWidth:420, margin:'40px auto'}}>
      <h1 style={{fontSize:24, fontWeight:700, marginBottom:12}}>Create account</h1>
      <form onSubmit={onSubmit} className="grid" style={{gap:12}}>
        <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="btn" disabled={loading}>{loading?'Creating…':'Register'}</button>
        {msg && <div style={{fontSize:13}}>{msg}</div>}
        <div style={{fontSize:13}}>Already have an account? <a href="/login" style={{textDecoration:'underline'}}>Sign in</a></div>
      </form>
    </div>
  );
}
