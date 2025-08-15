import { useEffect, useState } from 'react'
import { api } from '../api'

export default function Reports(){
  const [equity, setEquity] = useState<any>({ points: [] })
  const [csvUrl, setCsvUrl] = useState('')
  useEffect(()=>{
    api().get('/dashboards/pnl/equity').then(r=>setEquity(r.data))
    setCsvUrl(`${api().defaults.baseURL}/reports/executions.csv`)
  },[])
  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-3">Reports</h1>
      <div className="mb-3">
        <a className="px-3 py-1 border rounded inline-block" href={csvUrl} target="_blank">Download Executions CSV</a>
      </div>
      <div className="bg-white border rounded p-3">
        <pre className="text-xs overflow-x-auto">{JSON.stringify(equity, null, 2)}</pre>
      </div>
    </div>
  )
}