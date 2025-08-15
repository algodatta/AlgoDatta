import { useEffect, useState } from 'react'
import { api } from '../api'

export default function Positions(){
  const [rows, setRows] = useState<any[]>([])
  const load = ()=> api().get('/positions').then(r=>setRows(r.data))
  useEffect(()=>{ load() },[])
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-3">Positions</h1>
      <table className="w-full bg-white border rounded text-sm">
        <thead className="text-left text-gray-500"><tr>
          <th className="p-2">Strategy</th><th>Symbol</th><th>Mode</th><th>Qty</th><th>Avg Price</th>
        </tr></thead>
        <tbody>
          {rows.map((p:any)=>(
            <tr key={p.strategy_id} className="border-t">
              <td className="p-2">{p.strategy_id}</td>
              <td>{p.symbol}</td>
              <td>{p.mode}</td>
              <td>{p.position_qty}</td>
              <td>{p.avg_price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}