import { useEffect, useState } from 'react'
import { api } from '../api'
import { Plus, RefreshCcw, Play, Pause, Trash2 } from 'lucide-react'

type Strategy = any

export default function Strategies(){
  const [rows, setRows] = useState<Strategy[]>([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const load = async ()=>{
    setLoading(true); setErr(null)
    try{ setRows((await api().get('/strategies')).data) }
    catch(e:any){ setErr(e.message) }
    finally{ setLoading(false) }
  }
  useEffect(()=>{ load() }, [])

  const create = async ()=>{
    const name = prompt('Strategy name?','My Strategy')
    if(!name) return
    await api().post('/strategies',{ name, symbol:'TEST', qty:'1', paper_trading: true })
    load()
  }
  const toggle = async (id:string)=>{ await api().post(`/strategies/${id}/toggle`); load() }
  const rotate = async (id:string)=>{ const r = await api().post(`/strategies/${id}/rotate-webhook`); alert('New token: '+r.data.webhook_path) }
  const del = async (id:string)=>{ if(confirm('Delete strategy?')){ await api().delete(`/strategies/${id}`); load() } }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-center gap-3 mb-3">
        <h1 className="text-xl font-semibold">Strategies</h1>
        <button className="px-3 py-1 border rounded flex items-center gap-1" onClick={create}><Plus size={16}/> New</button>
        <button className="px-3 py-1 border rounded flex items-center gap-1" onClick={load}><RefreshCcw size={16}/> Refresh</button>
      </div>
      {err && <div className="text-red-600">{err}</div>}
      <table className="w-full bg-white border rounded">
        <thead className="text-left text-sm text-gray-500"><tr>
          <th className="p-2">Name</th><th>Symbol</th><th>Qty</th><th>Status</th><th>Mode</th><th>Webhook</th><th></th>
        </tr></thead>
        <tbody>
          {rows.map((s:any)=>(
            <tr key={s.id} className="border-t">
              <td className="p-2">{s.name}</td>
              <td>{s.symbol}</td>
              <td>{s.qty}</td>
              <td>{s.status}</td>
              <td>{s.paper_trading ? 'paper':'live'}</td>
              <td className="text-xs">{s.webhook_path}</td>
              <td className="p-2 flex gap-2">
                <button className="px-2 py-1 border rounded" onClick={()=>rotate(s.id)}>Rotate</button>
                <button className="px-2 py-1 border rounded flex items-center gap-1" onClick={()=>toggle(s.id)}>{s.status==='active'?<><Pause size={14}/>Pause</>:<><Play size={14}/>Activate</>}</button>
                <button className="px-2 py-1 border rounded text-red-600 flex items-center gap-1" onClick={()=>del(s.id)}><Trash2 size={14}/>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}