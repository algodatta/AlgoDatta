'use client'
import { useEffect, useState } from 'react'
type User={id:number,email:string,role:string,status:string}
export default function AdminPage(){
  const [users,setUsers]=useState<User[]>([])
  useEffect(()=>{ const token=localStorage.getItem('token'); if(!token){window.location.href='/login'; return}
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/admin/users`,{headers:{Authorization:`Bearer ${'${'}token}`}}).then(r=>r.json()).then(setUsers)
  },[])
  return(<div className="space-y-4"><h1 className="text-xl font-semibold">Admin</h1><div className="grid gap-2">{users.map(u=>(<div key={u.id} className="border border-neutral-800 rounded-xl p-3 bg-neutral-900/50"><div className="font-semibold">{u.email}</div><div className="text-xs opacity-70">{u.role} • {u.status}</div></div>))}</div></div>)
}
