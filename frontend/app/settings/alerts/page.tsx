"use client"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"

type Prefs = {
  enable_telegram: boolean
  telegram_chat_id: string
  enable_email: boolean
  email: string
}

export default function AlertSettingsPage(){
  const [p, setP] = useState<Prefs>({ enable_telegram:false, telegram_chat_id:"", enable_email:false, email:"" })
  const [msg, setMsg] = useState<string | null>(null)

  async function load(){
    try{
      const data = await api<Prefs>("/api/alerts/prefs")
      setP(data)
    }catch(e:any){ setMsg("❌ " + e.message) }
  }
  useEffect(()=>{ load() }, [])

  async function save(){
    try{
      setMsg("Saving...")
      await api("/api/alerts/prefs?enable_telegram="+(p.enable_telegram?"true":"false")+"&telegram_chat_id="+encodeURIComponent(p.telegram_chat_id||"")+"&enable_email="+(p.enable_email?"true":"false")+"&email="+encodeURIComponent(p.email||""), { method:"POST" })
      setMsg("✅ Saved")
    }catch(e:any){ setMsg("❌ " + e.message) }
  }

  return (
    <main className="p-6 space-y-4 max-w-xl">
      <h1 className="text-xl font-semibold">Alert Preferences</h1>
      {msg && <div className="p-3 border rounded bg-white">{msg}</div>}
      <div className="p-4 border rounded bg-white space-y-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={p.enable_telegram} onChange={e=>setP({...p, enable_telegram:e.target.checked})} />
          Enable Telegram alerts
        </label>
        <input className="w-full border rounded p-2" placeholder="Telegram Chat ID" value={p.telegram_chat_id} onChange={e=>setP({...p, telegram_chat_id:e.target.value})} />
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={p.enable_email} onChange={e=>setP({...p, enable_email:e.target.checked})} />
          Enable Email alerts
        </label>
        <input className="w-full border rounded p-2" placeholder="Email address" value={p.email} onChange={e=>setP({...p, email:e.target.value})} />
        <button className="px-3 py-2 rounded bg-black text-white" onClick={save}>Save</button>
      </div>
    </main>
  )
}
