'use client'
import { useEffect, useState } from 'react'
type Alarm = { AlarmName: string; StateValue: string; StateReason?: string; Threshold?: number; MetricName?: string }
type Health = {
  ses?: {
    quota?: { Max24HourSend?: number; MaxSendRate?: number; SentLast24Hours?: number }
    account?: { ProductionAccessEnabled?: boolean; SendingEnabled?: boolean; SuppressionAttributes?: any }
    quota_error?: string
    account_error?: string
  },
  cloudwatch?: { alarms?: Alarm[]; error?: string }
}
export default function OpsHealthPage(){
  const [data,setData]=useState<Health|null>(null)
  const [error,setError]=useState<string|null>(null)
  useEffect(()=>{
    const token = localStorage.getItem('token')
    if(!token){ window.location.href='/login'; return }
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/ops/health`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async r=>{ if(!r.ok) throw new Error(await r.text()); return r.json() })
      .then(setData).catch(e=>setError(e.message))
  },[])
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Ops Health</h1>
      {error && <div className="text-red-400 text-sm">{error}</div>}
      {!data && !error && <div>Loading…</div>}
      {data && (
        <div className="grid gap-4">
          <section className="border border-neutral-800 rounded-xl p-4 bg-neutral-900/40">
            <h2 className="font-semibold mb-2">SES</h2>
            {data.ses?.quota_error && <div className="text-yellow-400 text-sm mb-2">Quota error: {data.ses.quota_error}</div>}
            {data.ses?.account_error && <div className="text-yellow-400 text-sm mb-2">Account error: {data.ses.account_error}</div>}
            <pre className="text-xs overflow-auto">{JSON.stringify(data.ses, null, 2)}</pre>
          </section>
          <section className="border border-neutral-800 rounded-xl p-4 bg-neutral-900/40">
            <h2 className="font-semibold mb-2">CloudWatch Alarms</h2>
            {data.cloudwatch?.error && <div className="text-yellow-400 text-sm mb-2">CW error: {data.cloudwatch.error}</div>}
            <div className="grid gap-2">
              {data.cloudwatch?.alarms?.map((a,idx)=>(
                <div key={idx} className={`rounded-lg p-3 border ${a.StateValue==='ALARM'?'border-red-500 bg-red-500/10':'border-neutral-800 bg-neutral-900/40'}`}>
                  <div className="font-medium">{a.AlarmName}</div>
                  <div className="text-xs opacity-80">{a.MetricName} • State: {a.StateValue}</div>
                  {a.StateReason && <div className="text-xs mt-1 opacity-80">{a.StateReason}</div>}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
