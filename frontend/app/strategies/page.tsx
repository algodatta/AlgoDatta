"use client"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"

type Strategy = {
  id: number
  name: string
  enabled: boolean
  paper_trading?: boolean
  webhook_url: string
}

export default function StrategiesPage() {
  const [items, setItems] = useState<Strategy[]>([])
  const [msg, setMsg] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState("")
  const [newScript, setNewScript] = useState("")
  const [newPaper, setNewPaper] = useState(false)

  async function load() {
    try {
      setItems(await api<Strategy[]>("/api/strategies"))
      setMsg(null)
    } catch (e: any) {
      setMsg("❌ " + e.message)
    }
  }
  useEffect(() => { load() }, [])

  async function create() {
    try {
      await api("/api/strategies", {
        method: "POST",
        body: JSON.stringify({ name: newName, script: newScript, paper_trading: newPaper })
      })
      setShowCreate(false); setNewName(""); setNewScript(""); setNewPaper(false)
      load()
    } catch (e: any) { setMsg("❌ " + e.message) }
  }

  async function toggleEnabled(id: number, enabled: boolean) {
    try {
      await api(`/api/strategies/${id}?enabled=${!enabled}`, { method: "PUT" })
      load()
    } catch (e: any) { setMsg("❌ " + e.message) }
  }

  async function editName(id: number, current: string) {
    const name = prompt("New name", current)
    if (!name) return
    try {
      await api(`/api/strategies/${id}?name=${encodeURIComponent(name)}`, { method: "PUT" })
      load()
    } catch (e: any) { setMsg("❌ " + e.message) }
  }

  async function remove(id: number) {
    if (!confirm("Delete this strategy?")) return
    try {
      await api(`/api/strategies/${id}`, { method: "DELETE" })
      load()
    } catch (e: any) { setMsg("❌ " + e.message) }
  }

  function copyWebhook(relPath: string) {
    const base = process.env.NEXT_PUBLIC_API_BASE || ""
    const full = base + relPath
    navigator.clipboard.writeText(full)
    setMsg("🔗 Webhook URL copied")
    setTimeout(()=>setMsg(null), 1500)
  }

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Strategies</h1>
        <button className="px-3 py-2 rounded bg-black text-white" onClick={() => setShowCreate(true)}>New</button>
      </div>

      {msg && <div className="p-3 border rounded bg-white">{msg}</div>}

      {showCreate && (
        <div className="p-4 border rounded bg-white space-y-3 max-w-2xl">
          <h2 className="font-semibold">Create Strategy</h2>
          <input className="w-full border rounded p-2" placeholder="Name" value={newName} onChange={e=>setNewName(e.target.value)} />
          <textarea className="w-full border rounded p-2 h-32" placeholder="(Optional) Pine Script" value={newScript} onChange={e=>setNewScript(e.target.value)} />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={newPaper} onChange={e=>setNewPaper(e.target.checked)} />
            Paper trading
          </label>
          <div className="flex gap-2">
            <button className="px-3 py-2 rounded bg-black text-white" onClick={create}>Create</button>
            <button className="px-3 py-2 rounded border" onClick={()=>setShowCreate(false)}>Cancel</button>
          </div>
        </div>
      )}

      <table className="w-full bg-white border rounded">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-2">Name</th>
            <th className="text-left p-2">Enabled</th>
            <th className="text-left p-2">Paper</th>
            <th className="text-left p-2">Webhook</th>
            <th className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(s => (
            <tr key={s.id} className="border-t">
              <td className="p-2">{s.name}</td>
              <td className="p-2">{String(s.enabled)}</td>
              <td className="p-2">{String(!!s.paper_trading)}</td>
              <td className="p-2"><code className="break-all">{s.webhook_url}</code></td>
              <td className="p-2 flex gap-2">
                <button className="px-2 py-1 border rounded" onClick={() => toggleEnabled(s.id, s.enabled)}>{s.enabled ? "Stop" : "Start"}</button>
                <button className="px-2 py-1 border rounded" onClick={() => editName(s.id, s.name)}>Rename</button>
                <button className="px-2 py-1 border rounded" onClick={() => copyWebhook(s.webhook_url)}>Copy Webhook</button>
                <button className="px-2 py-1 border rounded text-red-600" onClick={() => remove(s.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
