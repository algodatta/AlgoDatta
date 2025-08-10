'use client'
import { useState } from 'react'
import Link from 'next/link'
export default function RegisterPage(){
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [confirm,setConfirm]=useState(''); const [error,setError]=useState<string|null>(null); const [loading,setLoading]=useState(false)
  const validate=(pw:string)=>{ if(pw.length<8) return 'At least 8 chars'; if(!/[A-Z]/.test(pw)) return 'Need uppercase'; if(!/[a-z]/.test(pw)) return 'Need lowercase'; if(!/[0-9]/.test(pw)) return 'Need digit'; if(!/[^A-Za-z0-9]/.test(pw)) return 'Need special char'; return null}
  const onSubmit=async(e:React.FormEvent)=>{e.preventDefault(); setError(null); if(password!==confirm){setError('Passwords do not match'); return} const ve=validate(password); if(ve){setError(ve); return} setLoading(true)
    try{ const res=await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/register`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})})
      if(!res.ok){throw new Error(await res.text()||'Registration failed')} const data=await res.json()
      alert(`Registered! Check your email to verify (SES). Dev token: ${'${'}data.dev_verify_token}`); window.location.href=`/verify?token=${'${'}data.dev_verify_token}`
    }catch(err:any){setError(err.message||'Registration failed')}finally{setLoading(false)}}
  return(<div className="max-w-sm mx-auto mt-16"><h1 className="text-xl font-semibold mb-6">Create account</h1>
    <form onSubmit={onSubmit} className="space-y-4">
      <input className="w-full bg-neutral-900 rounded-xl p-3 border border-neutral-800" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="w-full bg-neutral-900 rounded-xl p-3 border border-neutral-800" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
      <input className="w-full bg-neutral-900 rounded-xl p-3 border border-neutral-800" type="password" placeholder="Confirm password" value={confirm} onChange={e=>setConfirm(e.target.value)} />
      {error && <div className="text-red-400 text-sm">{error}</div>}
      <button disabled={loading} className="w-full bg-white text-black rounded-xl p-3 font-semibold disabled:opacity-60">{loading?'Creating…':'Create account'}</button>
    </form>
    <div className="text-sm mt-3 opacity-80">Already have an account? <Link className="underline" href="/login">Sign in</Link></div>
  </div>)}
