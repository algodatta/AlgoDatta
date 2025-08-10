'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function ResetPage(){
  const sp = useSearchParams()
  const [password,setPassword]=useState('')
  const [confirm,setConfirm]=useState('')
  const [status,setStatus]=useState<string|null>(null)
  const [loading,setLoading]=useState(false)

  const submit=async(e:React.FormEvent)=>{
    e.preventDefault(); setStatus(null)
    if(password!==confirm){ setStatus('Passwords do not match'); return }
    const token = sp.get('token')
    if(!token){ setStatus('Missing reset token'); return }
    setLoading(true)
    try{
      const res=await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/reset_password`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({token, password})
      })
      if(!res.ok){ throw new Error(await res.text()) }
      setStatus('Password updated. You can now sign in.')
      setTimeout(()=>{ window.location.href='/login' }, 1000)
    }catch(e:any){
      setStatus(e.message || 'Failed to reset password')
    }finally{ setLoading(false) }
  }

  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-xl font-semibold mb-6">Set a new password</h1>
      <form onSubmit={submit} className="space-y-4">
        <input type="password" className="w-full bg-neutral-900 rounded-xl p-3 border border-neutral-800" placeholder="New password" value={password} onChange={e=>setPassword(e.target.value)} />
        <input type="password" className="w-full bg-neutral-900 rounded-xl p-3 border border-neutral-800" placeholder="Confirm password" value={confirm} onChange={e=>setConfirm(e.target.value)} />
        <button disabled={loading} className="w-full bg-white text-black rounded-xl p-3 font-semibold disabled:opacity-60">{loading? 'Updating…' : 'Update password'}</button>
      </form>
      {status && <div className="text-sm mt-4 opacity-90">{status}</div>}
      <ResendBlock />
    </div>
  )
}

function ResendBlock(){
  const [email,setEmail]=useState('')
  const [note,setNote]=useState<string|null>(null)
  const [loading,setLoading]=useState(false)
  const resend=async()=>{
    setLoading(true); setNote(null)
    try{
      const res=await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/request_password_reset`,{
        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email})
      })
      if(!res.ok){ throw new Error(await res.text()) }
      const data=await res.json()
      setNote('If an account exists, a fresh reset link has been sent.')
      if(data.dev_reset_token){ setNote(prev => (prev? prev + ' ' : '') + ` Dev token: ${data.dev_reset_token}`) }
    }catch(e:any){
      setNote(e.message || 'Failed to resend')
    }finally{ setLoading(false) }
  }
  return (
    <div className='mt-6 border border-neutral-800 rounded-xl p-4 bg-neutral-900/40'>
      <div className='font-semibold mb-2'>Resend reset link</div>
      <div className='text-xs opacity-80 mb-2'>If your token expired, request a fresh link here.</div>
      <div className='flex gap-2'>
        <input className='flex-1 bg-neutral-900 rounded-xl p-3 border border-neutral-800' placeholder='Your email' value={email} onChange={e=>setEmail(e.target.value)} />
        <button disabled={loading} onClick={resend} className='px-3 py-2 rounded-lg bg-white text-black font-semibold disabled:opacity-60'>{loading? 'Sending…':'Resend'}</button>
      </div>
      {note && <div className='text-xs mt-2 opacity-90'>{note}</div>}
    </div>
  )
}
