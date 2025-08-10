'use client'
import { useEffect, useState } from 'react'
export default function BrokerPage(){
  const [profile,setProfile]=useState<any>(null); const [loading,setLoading]=useState(true); const [error,setError]=useState<string|null>(null)
  useEffect(()=>{ const token=localStorage.getItem('token'); if(!token){window.location.href='/login'; return}
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/broker/profile`,{headers:{Authorization:`Bearer ${'${'}token}`}})
      .then(async r=>{ if(!r.ok) throw new Error('Not connected'); return r.json() }).then(setProfile).catch(e=>setError(e.message)).finally(()=>setLoading(false))
  },[])
  return(<div className="space-y-4"><h1 className="text-xl font-semibold">Broker</h1>
    {loading && <div>Loading…</div>}
    {error && <div className="text-yellow-300">Status: {error}.</div>}
    {profile && <pre className="bg-neutral-900 rounded-xl p-4 border border-neutral-800 overflow-auto">{JSON.stringify(profile,null,2)}</pre>}
  </div>)
}
