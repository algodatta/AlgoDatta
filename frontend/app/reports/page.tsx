"use client"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"

type Row = {
  id: number
  strategy_id: number
  symbol: string
  side: string
  qty: number
  price: number
  status: string
  created_at: string
}

export default function ReportsPage(){
  const [rows, setRows] = useState<Row[]>([])
  const [msg, setMsg] = useState<string | null>(null)
  const [since, setSince] = useState<string>("")
  const [until, setUntil] = useState<string>("")
  const [strategyId, setStrategyId] = useState<string>("")
  const [status, setStatus] = useState<string>("")
  const [limit, setLimit] = useState<number>(200)

  async function load(){
    try{
      const params = new URLSearchParams()
      if (since) params.set("since", since)
      if (until) params.set("until", until)
      if (strategyId) params.set("strategy_id", strategyId)
      if (status) params.set("status", status)
      if (limit) params.set("limit", String(limit))
      const data = await api<Row[]>("/api/reports?" + params.toString())
      setRows(data); setMsg(null)
    }catch(e:any){ setMsg("❌ " + e.message) }
  }
  useEffect(()=>{ load() }, [])

  function csvUrl(){
    const base = process.env.NEXT_PUBLIC_API_BASE || ""
    const params = new URLSearchParams()
    if (since) params.set("since", since)
    if (until) params.set("until", until)
    if (strategyId) params.set("strategy_id", strategyId)
    if (status) params.set("status", status)
    return base + "/api/reports/csv?" + params.toString()
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Reports</h1>

      {msg && <div className="p-3 border rounded bg-white">{msg}</div>}

      <div className="p-4 border rounded bg-white grid grid-cols-1 md:grid-cols-5 gap-3">
        <div>
          <label className="block text-sm text-gray-600">Since</label>
          <input className="w-full border rounded p-2" placeholder="2025-08-01" value={since} onChange={e=>setSince(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Until</label>
          <input className="w-full border rounded p-2" placeholder="2025-08-09" value={until} onChange={e=>setUntil(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Strategy ID</label>
          <input className="w-full border rounded p-2" placeholder="e.g., 12" value={strategyId} onChange={e=>setStrategyId(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Status</label>
          <select className="w-full border rounded p-2" value={status} onChange={e=>setStatus(e.target.value)}>
            <option value="">Any</option>
            <option value="FILLED">FILLED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600">Limit</label>
          <input type="number" className="w-full border rounded p-2" value={limit} onChange={e=>setLimit(parseInt(e.target.value||"200"))} />
        </div>
        <div className="md:col-span-5 flex gap-2">
          <button className="px-3 py-2 rounded bg-black text-white" onClick={load}>Apply Filters</button>
          <a href={csvUrl()} className="px-3 py-2 rounded border" target="_blank">Export CSV</a>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="w-full bg-white border rounded min-w-[800px]">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-2">Time</th>
              <th className="text-left p-2">Strategy</th>
              <th className="text-left p-2">Symbol</th>
              <th className="text-left p-2">Side</th>
              <th className="text-left p-2">Qty</th>
              <th className="text-left p-2">Price</th>
              <th className="text-left p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t">
                <td className="p-2 whitespace-nowrap">{r.created_at}</td>
                <td className="p-2">{r.strategy_id}</td>
                <td className="p-2">{r.symbol}</td>
                <td className="p-2">{r.side}</td>
                <td className="p-2">{r.qty}</td>
                <td className="p-2">{r.price}</td>
                <td className="p-2">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
