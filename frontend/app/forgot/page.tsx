'use client'
import { useState } from 'react'

export default function ForgotPage(){
  const [email,setEmail]=useState('')
  const [status,setStatus]=useState<string|null>(null)
  const [loading,setLoading]=useState(false)

  const submit=async(e:React.FormEvent)=>{
    e.preventDefault(); setLoading(true); setStatus(null)
    try{
      const res=await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/request_password_reset`,{
        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email})
      })
      if(!res.ok){ throw new Error(await res.text()) }
      const data = await res.json()
      setStatus('If an account exists, you will receive an email with a reset link.')
      if(data.dev_reset_token){
        setStatus(prev => (prev? prev + ' ' : '') + `Dev token: ${data.dev_reset_token}`)
      }
    }catch(e:any){
      setStatus(e.message || 'Failed to request reset')
    }finally{ setLoading(false) }
  }

  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-xl font-semibold mb-6">Forgot password</h1>
      <form onSubmit={submit} className="space-y-4">
        <input className="w-full bg-neutral-900 rounded-xl p-3 border border-neutral-800" placeholder="Your email" value={email} onChange={e=>setEmail(e.target.value)} />
        <button disabled={loading} className="w-full bg-white text-black rounded-xl p-3 font-semibold disabled:opacity-60">{loading? 'Sending…' : 'Send reset link'}</button>
      </form>
      {status && <div className="text-sm mt-4 opacity-90">{status}</div>}
    </div>
  )
}
