"use client"
import { useEffect, useRef, useState } from "react"
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

export default function ExecutionsPage(){
  const [rows, setRows] = useState<Row[]>([])
  const [msg, setMsg] = useState<string | null>(null)
  const esRef = useRef<EventSource | null>(null)

  async function fetchLatest(){
    try{
      const data = await api<Row[]>("/api/executions")
      setRows(data)
    }catch(e:any){ setMsg("❌ " + e.message) }
  }

  useEffect(() => {
    fetchLatest()
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const base = process.env.NEXT_PUBLIC_API_BASE || ""
    if (typeof window !== 'undefined' && token && 'EventSource' in window){
      // pass token as query param (SSE can't send headers easily)
      const url = base + "/api/executions/stream?token=" + encodeURIComponent(token)
      const es = new EventSource(url)
      es.onmessage = (evt) => {
        try{
          const data: Row[] = JSON.parse(evt.data || '[]')
          if (Array.isArray(data) && data.length){
            setRows(prev => {
              const merged = [...prev]
              for (const r of data){
                if (!merged.find(x => x.id === r.id)){
                  merged.unshift(r)
                }
              }
              return merged.slice(0, 500) // keep cap
            })
          }
        }catch{}
      }
      es.onerror = () => {
        // fallback: poll every 5s if SSE fails
        if (esRef.current){
          esRef.current.close()
          esRef.current = null
        }
      }
      esRef.current = es
      return () => { es.close() }
    } else {
      // polling fallback
      const t = setInterval(fetchLatest, 5000)
      return () => clearInterval(t)
    }
  }, [])

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Executions (Live)</h1>
      {msg && <div className="p-3 border rounded bg-white">{msg}</div>}

      <div className="overflow-auto">
        <table className="w-full bg-white border rounded min-w-[900px]">
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
