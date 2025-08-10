'use client'
import { useEffect, useState } from 'react'
type Strategy={id:number,name:string,symbol:string,qty:number,mode:'paper'|'live',status:'enabled'|'disabled',webhook_secret?:string}
export default function StrategiesPage(){
  const [list,setList]=useState<Strategy[]>([]); const [loading,setLoading]=useState(true)
  const load=async()=>{ const token=localStorage.getItem('token'); if(!token){window.location.href='/login'; return}
    const res=await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/strategies`,{headers:{Authorization:`Bearer ${'${'}token}`}}); const data=await res.json(); setList(data); setLoading(false)}
  useEffect(()=>{load()},[])
  const toggle=async(id:number)=>{const token=localStorage.getItem('token')!; await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/strategies/${'${'}id}/toggle`,{method:'POST',headers:{Authorization:`Bearer ${'${'}token}`}}); load()}
  const deploy=async(id:number)=>{const token=localStorage.getItem('token')!; const res=await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/strategies/${'${'}id}/deploy`,{method:'POST',headers:{Authorization:`Bearer ${'${'}token}`}}); const data=await res.json(); alert(`Webhook URL: ${'${'}process.env.NEXT_PUBLIC_API_BASE}/api/webhook/tradingview\nSecret: ${'${'}data.webhook_secret}`); load()}
  return(<div className="space-y-4"><h1 className="text-xl font-semibold">Strategies</h1>
    {loading? <div>Loading…</div> : (
      <div className="grid gap-3">
        {list.map(s=>(<div key={s.id} className="border border-neutral-800 rounded-xl p-4 bg-neutral-900/50">
          <div className="flex items-center justify-between">
            <div><div className="font-semibold">{s.name}</div><div className="text-xs opacity-70">{s.symbol} • qty {s.qty} • {s.mode}</div></div>
            <div className="flex gap-2">
              <button onClick={()=>toggle(s.id)} className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700">{s.status==='enabled'?'Disable':'Enable'}</button>
              <button onClick={()=>deploy(s.id)} className="px-3 py-2 rounded-lg bg-white text-black font-semibold">Deploy</button>
            </div>
          </div>
          {s.webhook_secret && <div className="text-xs mt-2 opacity-70">Secret: {s.webhook_secret}</div>}
        </div>))}
      </div>
    )}
  </div>)
}
