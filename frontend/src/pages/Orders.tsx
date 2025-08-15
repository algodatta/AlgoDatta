import { useEffect, useState } from 'react'
import { api } from '../api'

export default function Orders(){
  const [rows, setRows] = useState<any[]>([])
  const [tick, setTick] = useState(0)
  useEffect(()=>{
    const t = setInterval(()=>setTick(x=>x+1), 3000)
    return ()=>clearInterval(t)
  },[])
  useEffect(()=>{ api().get('/orders?limit=50').then(r=>setRows(r.data)).catch(()=>{}) }, [tick])

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-3">Executions (live)</h1>
      <table className="w-full bg-white border rounded text-sm">
        <thead className="text-left text-gray-500"><tr>
          <th className="p-2">Time</th><th>Side</th><th>Qty</th><th>Price</th><th>Status</th><th>Order Id</th>
        </tr></thead>
        <tbody>
          {rows.map((e:any)=>(
            <tr key={e.id} className="border-t">
              <td className="p-2">{e.created_at}</td>
              <td>{e.side}</td>
              <td>{e.qty}</td>
              <td>{e.price}</td>
              <td>{e.status}</td>
              <td className="text-xs">{e.broker_order_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}