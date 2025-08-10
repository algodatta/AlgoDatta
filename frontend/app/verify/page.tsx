'use client'
import { useEffect, useState } from 'react'
export default function VerifyPage({ searchParams }: any){
  const [status,setStatus]=useState('Verifying…')
  useEffect(()=>{ const token=searchParams?.token; if(!token){setStatus('Missing token'); return}
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/verify?token=${'${'}token}`)
      .then(async r=>{ if(!r.ok) throw new Error(await r.text()); return r.json() })
      .then(()=>setStatus('Verified! You can now sign in.'))
      .catch(e=>setStatus(`Failed: ${'${'}e.message}`))
  },[searchParams])
  return (<div className="max-w-lg mx-auto mt-16 space-y-4"><h1 className="text-xl font-semibold">Email Verification</h1>
    <div className="text-sm opacity-80">{status}</div>
    {status.startsWith('Verified') && (<a className="underline" href="/login">Go to sign in</a>)}
  </div>)
}
