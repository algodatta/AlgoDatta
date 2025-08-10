'use client'
import { useEffect, useState } from 'react'
type User={id:number,email:string,role:string,status:string}
type Supp={email:string,reason:string,created_at:string|null}
export default function AdminPage(){
  const [users,setUsers]=useState<User[]>([])
  const [supps,setSupps]=useState<Supp[]>([])
  useEffect(()=>{ const token=localStorage.getItem('token'); if(!token){window.location.href='/login'; return}
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/admin/users`,{headers:{Authorization:`Bearer ${'${'}token}`}}).then(r=>r.json()).then(setUsers)
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/admin/suppressions`,{headers:{Authorization:`Bearer ${'${'}token}`}}).then(r=>r.json()).then(setSupps)
  },[])
  const unsuppress=async(email:string)=>{ const token=localStorage.getItem('token')!; await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/admin/suppressions/unsuppress?email=${'${'}encodeURIComponent(email)}`,{method:'POST',headers:{Authorization:`Bearer ${'${'}token}`}}); setSupps(supps.filter(s=>s.email!==email)) }
  return(<div className="space-y-6">
    <h1 className="text-xl font-semibold">Admin</h1>
    <section>
      <h2 className="font-semibold mb-2">Users</h2>
      <div className="grid gap-2">{users.map(u=>(<div key={u.id} className="border border-neutral-800 rounded-xl p-3 bg-neutral-900/50"><div className="font-semibold">{u.email}</div><div className="text-xs opacity-70">{u.role} • {u.status}</div></div>))}</div>
    </section>
    <section>
      <h2 className="font-semibold mb-2">Suppressions</h2>
      {supps.length===0 ? <div className="text-sm opacity-70">No suppressed addresses.</div> : (
        <div className="overflow-x-auto border border-neutral-800 rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-neutral-900/60"><tr><th className="text-left p-2">Email</th><th className="text-left p-2">Reason</th><th className="text-left p-2">Created</th><th className="p-2"></th></tr></thead>
            <tbody>{supps.map(s=>(<tr key={s.email} className="border-t border-neutral-800"><td className="p-2">{s.email}</td><td className="p-2">{s.reason}</td><td className="p-2">{s.created_at? new Date(s.created_at).toLocaleString(): ''}</td><td className="p-2 text-right"><button onClick={()=>unsuppress(s.email)} className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700">Unsuppress</button></td></tr>))}</tbody>
          </table>
        </div>
      )}
    </section>
    <section>
      <h2 className="font-semibold mb-2">Audit log</h2>
      <AuditTable />
    </section>
  </div>)
}

function AuditTable(){
  const [rows,setRows]=useState<any[]>([])
  const [err,setErr]=useState<string|null>(null)
  useEffect(()=>{
    const token=localStorage.getItem('token')
    if(!token){ window.location.href='/login'; return }
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/admin/audit`,{ headers: { Authorization:`Bearer ${token}` } })
      .then(async r=>{ if(!r.ok) throw new Error(await r.text()); return r.json() })
      .then(setRows).catch(e=>setErr(e.message))
  },[])
  if(err) return <div className="text-red-400 text-sm">{err}</div>
  if(!rows.length) return <div className="text-sm opacity-70">No recent events.</div>
  return (
    <div className='overflow-x-auto border border-neutral-800 rounded-xl'>
      <table className='w-full text-sm'>
        <thead className='bg-neutral-900/60'>
          <tr><th className='text-left p-2'>Time</th><th className='text-left p-2'>Event</th><th className='text-left p-2'>User</th><th className='text-left p-2'>IP</th><th className='text-left p-2'>UA</th></tr>
        </thead>
        <tbody>
          {rows.map((r,i)=>(
            <tr key={i} className='border-t border-neutral-800'>
              <td className='p-2'>{r.created_at? new Date(r.created_at).toLocaleString(): ''}</td>
              <td className='p-2'>{r.event}</td>
              <td className='p-2'>{r.email || r.user_id || '-'}</td>
              <td className='p-2'>{r.ip || '-'}</td>
              <td className='p-2 truncate max-w-[360px]' title={r.user_agent || ''}>{r.user_agent || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
