import { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import Card from '../components/Card'
import { Tabs } from '../components/Tabs'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Pagination from '../components/ui/Pagination'
import { Upload, RefreshCcw, Plus, Send } from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

type User = { id:string; email:string; role:'user'|'admin' }
type Strategy = any

export default function Admin(){
  const [tab, setTab] = useState('overview')

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Admin Panel</h1>
      <Tabs items={[
        {id:'overview', title:'Overview'},
        {id:'users', title:'Users'},
        {id:'brokers', title:'Brokers (Dhan)'},
        {id:'instruments', title:'Instruments Upload'},
        {id:'strategy_cfg', title:'Strategy Config (Dhan)'},
        {id:'risk', title:'Risk Controls'},
        {id:'notifications', title:'Notifications'},
        {id:'executions', title:'Executions'},
        {id:'metrics', title:'Metrics'},
        {id:'equity', title:'Equity Chart'},
      ]} active={tab} onChange={setTab}/>

      <div className="mt-4 grid gap-4">
        {tab==='overview' && <Overview/>}
        {tab==='users' && <UsersTab/>}
        {tab==='brokers' && <BrokersTab/>}
        {tab==='instruments' && <InstrumentsTab/>}
        {tab==='strategy_cfg' && <StrategyConfigTab/>}
        {tab==='risk' && <RiskTab/>}
        {tab==='notifications' && <NotificationsTab/>}
        {tab==='executions' && <ExecutionsTab/>}
        {tab==='metrics' && <MetricsTab/>}
        {tab==='equity' && <EquityTab/>}
      </div>
    </div>
  )
}

function Overview(){
  const [summary, setSummary] = useState<any>({})
  useEffect(()=>{ api().get('/admin/summary').then(r=>setSummary(r.data)).catch(()=>{}) },[])
  return <Card title="System Summary"><pre className="text-xs">{JSON.stringify(summary,null,2)}</pre></Card>
}

function UsersTab(){
  const [users, setUsers] = useState<User[]>([]); const [q, setQ] = useState(''); const [page, setPage] = useState(1); const pageSize=20; const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'user'|'admin'>('user')

  const load = async ()=>{ setLoading(true); try{ const r = (await api().get('/admin/users/search', { params: { q, limit: pageSize, offset: (page-1)*pageSize } })).data; setUsers(r.items); setTotal(r.total) } finally{ setLoading(false) } }
  useEffect(()=>{ load() },[])

  const create = async ()=>{
    if(!email) return
    await api().post('/admin/users', { email, password:'ChangeMe123!', role })
    setEmail(''); setRole('user'); load()
  }

  return (
    <div className="grid gap-4"><div className='flex items-center gap-2'><Input placeholder='search email' value={q} onChange={e=>setQ(e.target.value)} /><Button onClick={()=>{setPage(1);load()}}>Search</Button></div>
      <Card title="Create User">
        <div className="flex gap-2">
          <input className="border rounded px-3 py-2" placeholder="email@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
          <select className="border rounded px-3 py-2" value={role} onChange={e=>setRole(e.target.value as any)}>
            <option value="user">user</option><option value="admin">admin</option>
          </select>
          <button className="px-3 py-2 border rounded flex items-center gap-1" onClick={create}><Plus size={16}/>Create</button>
          <button className="px-3 py-2 border rounded flex items-center gap-1" onClick={load}><RefreshCcw size={16}/>Refresh</button>
        </div>
      </Card>
      <Card title="All Users">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500"><tr><th className="p-2">Email</th><th>Role</th></tr></thead>
          <tbody>{users.map(u=>(<tr key={u.id} className="border-t"><td className="p-2">{u.email}</td><td>{u.role}</td></tr>))}</tbody>
        </table>
        <div className='mt-3 flex justify-end'><Pagination page={page} pageSize={pageSize} total={total} onPage={p=>{setPage(p); load()}}/></div>
      </Card>
    </div>
  )
}

function BrokersTab(){
  const [users, setUsers] = useState<User[]>([]); const [q, setQ] = useState(''); const [page, setPage] = useState(1); const pageSize=20; const [total, setTotal] = useState(0)
  const [userId, setUserId] = useState('')
  const [clientId, setClientId] = useState('')
  const [token, setToken] = useState('')

  useEffect(()=>{ api().get('/admin/users').then(r=>setUsers(r.data)).catch(()=>{}) },[])
  const upsert = async ()=>{
    if(!userId || !clientId || !token) return alert('Fill all fields')
    await api().post('/admin/brokers/upsert', { user_id:userId, type:'dhanhq', client_id:clientId, access_token:token })
    alert('Broker saved')
  }
  return (
    <Card title="DhanHQ Broker (per user)">
      <div className="grid grid-cols-2 gap-3 max-w-2xl">
        <label className="grid"><span>User</span>
          <select className="border rounded px-3 py-2" value={userId} onChange={e=>setUserId(e.target.value)}>
            <option value="">Select user...</option>
            {users.map(u=><option key={u.id} value={u.id}>{u.email}</option>)}
          </select>
        </label>
        <label className="grid"><span>Dhan ClientId</span><input className="border rounded px-3 py-2" value={clientId} onChange={e=>setClientId(e.target.value)} /></label>
        <label className="grid col-span-2"><span>Access Token</span><input className="border rounded px-3 py-2" value={token} onChange={e=>setToken(e.target.value)} /></label>
      </div>
      <div className="mt-3"><button className="px-3 py-2 border rounded" onClick={upsert}>Save</button></div>
    </Card>
  )
}

function InstrumentsTab(){
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState('')
  const upload = async ()=>{
    if(!file) return
    const fd = new FormData(); fd.append('file', file)
    const r = await api().post('/admin/dhan/instruments/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    setStatus(`Uploaded: ${r.data.rows} rows`)
  }
  return (
    <Card title="Upload Dhan Instruments CSV">
      <div className="flex items-center gap-3">
        <input type="file" accept=".csv" onChange={e=>setFile(e.target.files?.[0] || null)} />
        <button className="px-3 py-2 border rounded flex items-center gap-1" onClick={upload}><Upload size={16}/> Upload</button>
        {status && <span className="text-green-700">{status}</span>}
      </div>
    </Card>
  )
}

function StrategyConfigTab(){
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [sid, setSid] = useState('')
  const [form, setForm] = useState<any>({ dhan_security_id:'', dhan_exchange_segment:'NSE_EQ', dhan_product_type:'INTRADAY', dhan_order_type:'MARKET', dhan_validity:'DAY', paper_trading:false, broker_id:'' }); const [symQ,setSymQ]=useState(''); const [symResults,setSymResults]=useState<any[]>([])
  const [brokers, setBrokers] = useState<any[]>([])

  useEffect(()=>{
    api().get('/strategies').then(r=>setStrategies(r.data))
    // brokers require an endpoint; we reuse admin/brokers/upsert for save, but listing isn't available -> leave broker_id manual
  },[])

  const save = async ()=>{
    if(!sid) return alert('Pick a strategy')
    await api().post(`/admin/dhan/strategies/${sid}/config`, form)
    alert('Strategy updated')
  }

  return (
    <Card title="Configure Strategy (Dhan Live)">
      <div className="grid grid-cols-2 gap-3 max-w-3xl">
        <label className="grid"><span>Strategy</span>
          <select className="border rounded px-3 py-2" value={sid} onChange={e=>setSid(e.target.value)}>
            <option value="">Select...</option>
            {strategies.map((s:any)=><option key={s.id} value={s.id}>{s.name} ({s.symbol})</option>)}
          </select>
        </label>
        <label className="grid"><span>Broker UUID</span><input className="border rounded px-3 py-2" value={form.broker_id} onChange={e=>setForm({...form, broker_id:e.target.value})} placeholder="paste from /admin/brokers/upsert response"/></label>
        <label className="grid"><span>Security ID</span><input className="border rounded px-3 py-2" value={form.dhan_security_id} onChange={e=>setForm({...form, dhan_security_id:e.target.value})}/></label>
        <label className="grid col-span-2"><span>Search Symbol</span>
          <div className='flex gap-2'>
            <input className='border rounded px-3 py-2 flex-1' placeholder='e.g., RELI' value={symQ} onChange={async e=>{ setSymQ(e.target.value); if(e.target.value.length>=3){ const r = await api().get('/instruments/search', { params: { q: e.target.value, exchange_segment: form.dhan_exchange_segment } }); setSymResults(r.data) } else { setSymResults([]) } }} />
            <Button onClick={async()=>{ const r = await api().get('/instruments/search', { params: { q: symQ, exchange_segment: form.dhan_exchange_segment } }); setSymResults(r.data) }}>Find</Button>
          </div>
          <div className='text-xs text-gray-600 mt-1'>Click a row to fill.</div>
          <div className='max-h-40 overflow-auto border rounded mt-2'>
            <table className='w-full text-sm'>
              <thead className='text-left text-gray-500 sticky top-0 bg-white'><tr><th className='p-1'>Symbol</th><th>SecId</th><th>Exch</th></tr></thead>
              <tbody>{symResults.map((r:any)=>(<tr key={r.security_id} className='border-t hover:bg-gray-50 cursor-pointer' onClick={()=>setForm({...form, dhan_security_id:r.security_id, dhan_exchange_segment:r.exchange_segment})}><td className='p-1'>{r.trading_symbol}</td><td>{r.security_id}</td><td>{r.exchange_segment}</td></tr>))}</tbody>
            </table>
          </div>
        </label>
        <label className="grid"><span>Exchange Segment</span><input className="border rounded px-3 py-2" value={form.dhan_exchange_segment} onChange={e=>setForm({...form, dhan_exchange_segment:e.target.value})}/></label>
        <label className="grid"><span>Product Type</span><input className="border rounded px-3 py-2" value={form.dhan_product_type} onChange={e=>setForm({...form, dhan_product_type:e.target.value})}/></label>
        <label className="grid"><span>Order Type</span><input className="border rounded px-3 py-2" value={form.dhan_order_type} onChange={e=>setForm({...form, dhan_order_type:e.target.value})}/></label>
        <label className="grid"><span>Validity</span><input className="border rounded px-3 py-2" value={form.dhan_validity} onChange={e=>setForm({...form, dhan_validity:e.target.value})}/></label>
        <label className="flex items-center gap-2 col-span-2"><input type="checkbox" checked={!!form.paper_trading} onChange={e=>setForm({...form, paper_trading:e.target.checked})}/> Paper Trading</label>
      </div>
      <div className="mt-3"><button className="px-3 py-2 border rounded" onClick={save}>Save</button></div>
    </Card>
  )
}

function RiskTab(){
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [sid, setSid] = useState('')
  const [cfg, setCfg] = useState<any>({ max_signals_per_minute: 30, trading_start:'09:15', trading_end:'15:30', allow_weekends:false, kill_switch:false })

  useEffect(()=>{ api().get('/strategies').then(r=>setStrategies(r.data)) },[])

  const load = async (id:string)=>{
    setSid(id)
    if(!id) return
    const r = await api().get(`/risk/strategies/${id}`)
    if(r.data && Object.keys(r.data).length>0) setCfg(r.data)
  }
  const save = async ()=>{
    if(!sid) return
    await api().post(`/risk/strategies/${sid}`, cfg)
    alert('Risk saved')
  }

  return (
    <Card title="Strategy Risk Controls">
      <div className="grid grid-cols-3 gap-3 max-w-4xl">
        <label className="grid col-span-3"><span>Strategy</span>
          <select className="border rounded px-3 py-2" value={sid} onChange={e=>load(e.target.value)}>
            <option value="">Select...</option>
            {strategies.map((s:any)=><option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <label className="grid"><span>Max Signals / min</span><input className="border rounded px-3 py-2" value={cfg.max_signals_per_minute || ''} onChange={e=>setCfg({...cfg, max_signals_per_minute:Number(e.target.value)})}/></label>
        <label className="grid"><span>Trading Start</span><input className="border rounded px-3 py-2" value={cfg.trading_start || ''} onChange={e=>setCfg({...cfg, trading_start:e.target.value})}/></label>
        <label className="grid"><span>Trading End</span><input className="border rounded px-3 py-2" value={cfg.trading_end || ''} onChange={e=>setCfg({...cfg, trading_end:e.target.value})}/></label>
        <label className="grid"><span>Max Position Qty</span><input className="border rounded px-3 py-2" value={cfg.max_position_qty || ''} onChange={e=>setCfg({...cfg, max_position_qty:Number(e.target.value)})}/></label>
        <label className="grid"><span>Max Daily Loss</span><input className="border rounded px-3 py-2" value={cfg.max_daily_loss || ''} onChange={e=>setCfg({...cfg, max_daily_loss:Number(e.target.value)})}/></label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={!!cfg.allow_weekends} onChange={e=>setCfg({...cfg, allow_weekends:e.target.checked})}/> Allow Weekends</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={!!cfg.kill_switch} onChange={e=>setCfg({...cfg, kill_switch:e.target.checked})}/> Kill Switch</label>
      </div>
      <div className="mt-3"><button className="px-3 py-2 border rounded" onClick={save}>Save</button></div>
    </Card>
  )
}

function NotificationsTab(){
  const [rows, setRows] = useState<any[]>([]); const [page, setPage] = useState(1); const pageSize=50; const [total,setTotal]=useState(0); const [status,setStatus]=useState(''); const [side,setSide]=useState(''); const [symbol,setSymbol]=useState('')
  const [type, setType] = useState<'telegram'|'email'>('telegram')
  const [dest, setDest] = useState('')
  const load = ()=> api().get('/notifications').then(r=>setRows(r.data)).catch(()=>{})
  useEffect(()=>{ load() },[])
  const add = async ()=>{ await api().post('/notifications', { type, destination: dest }); setDest(''); load() }
  const verify = async (id:string, v:boolean)=>{ await api().patch(`/notifications/${id}/verify`, { verified:v }); load() }
  const del = async (id:string)=>{ await api().delete(`/notifications/${id}`); load() }
  return (
    <div className="grid gap-4"><div className='flex items-center gap-2'><Input placeholder='search email' value={q} onChange={e=>setQ(e.target.value)} /><Button onClick={()=>{setPage(1);load()}}>Search</Button></div>
      <Card title="Add Notification">
        <div className="flex gap-2">
          <select className="border rounded px-3 py-2" value={type} onChange={e=>setType(e.target.value as any)}>
            <option value="telegram">telegram</option><option value="email">email</option>
          </select>
          <input className="border rounded px-3 py-2" placeholder={type==='telegram'?'Telegram chat_id':'email@example.com'} value={dest} onChange={e=>setDest(e.target.value)} />
          <button className="px-3 py-2 border rounded" onClick={add}>Add</button>
        </div>
      </Card>
      <Card title="Destinations">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500"><tr><th className="p-2">Type</th><th>Destination</th><th>Verified</th><th></th></tr></thead>
          <tbody>
            {rows.map((n:any)=>(
              <tr key={n.id} className="border-t">
                <td className="p-2">{n.type}</td><td>{n.destination}</td><td>{String(n.verified)}</td>
                <td className="p-2 flex gap-2">
                  <button className="px-2 py-1 border rounded" onClick={()=>verify(n.id, true)}>Verify</button>
                  <button className="px-2 py-1 border rounded" onClick={()=>verify(n.id, false)}>Unverify</button>
                  <button className="px-2 py-1 border rounded text-red-600" onClick={()=>del(n.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className='mt-3 flex justify-end'><Pagination page={page} pageSize={pageSize} total={total} onPage={p=>{setPage(p); load()}}/></div>
      </Card>
    </div>
  )
}

function ExecutionsTab(){
  const [rows, setRows] = useState<any[]>([]); const [page, setPage] = useState(1); const pageSize=50; const [total,setTotal]=useState(0); const [status,setStatus]=useState(''); const [side,setSide]=useState(''); const [symbol,setSymbol]=useState('')
  const refresh = ()=> api().get('/admin/executions', { params: { limit: pageSize, offset: (page-1)*pageSize, status: status || undefined, side: side || undefined, symbol: symbol || undefined } }).then(r=>{ const d=r.data; setRows(d.items || d); setTotal(d.total || (d.items?d.items.length:0)); }).catch(()=>{})
  useEffect(()=>{ refresh() },[page])
  return (
    <Card title="Recent Executions">
      <div className='grid grid-cols-4 gap-2 mb-2'>
        <Input placeholder='Symbol filter' value={symbol} onChange={e=>setSymbol(e.target.value)} />
        <Select value={status} onChange={e=>setStatus(e.target.value)}><option value=''>All Status</option><option>success</option><option>fail</option><option>pending</option></Select>
        <Select value={side} onChange={e=>setSide(e.target.value)}><option value=''>All Sides</option><option>BUY</option><option>SELL</option></Select>
        <Button onClick={()=>{setPage(1); refresh()}}>Apply</Button>
      </div>
      <div className="flex justify-end mb-2"><button className="px-3 py-1 border rounded flex items-center gap-1" onClick={refresh}><RefreshCcw size={16}/> Refresh</button></div>
      <table className="w-full text-sm">
        <thead className="text-left text-gray-500"><tr><th className="p-2">Time</th><th>Side</th><th>Qty</th><th>Price</th><th>Status</th><th>OrderId</th></tr></thead>
        <tbody>{rows.map((e:any)=>(<tr key={e.id} className="border-t"><td className="p-2">{e.created_at}</td><td>{e.side}</td><td>{e.qty}</td><td>{e.price}</td><td>{e.status}</td><td className="text-xs">{e.broker_order_id}</td></tr>))}</tbody>
      </table>
      <div className='mt-3 flex justify-end'><Pagination page={page} pageSize={pageSize} total={total} onPage={p=>{setPage(p)}}/></div>
    </Card>
  )
}

function MetricsTab(){
  const [text, setText] = useState('')
  const load = async ()=>{ const r = await fetch((import.meta as any).env.VITE_API_BASE + '/metrics'); setText(await r.text()) }
  useEffect(()=>{ load() },[])
  return <Card title="Prometheus /metrics"><pre className="text-xs overflow-x-auto">{text}</pre></Card>
}

function EquityTab(){
  const [data, setData] = useState<any>({ points: [] })
  useEffect(()=>{ api().get('/dashboards/pnl/equity').then(r=>setData(r.data)).catch(()=>{}) },[])
  const chart = useMemo(()=> (data.points || []).map((p:any)=>({ date:p.date, equity: Number(p.equity || 0), pnl: Number(p.pnl || 0) })), [data])
  return (
    <Card title="Equity Curve">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chart}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="equity" stroke="#111827" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <pre className="text-xs mt-3">{JSON.stringify(data, null, 2)}</pre>
    </Card>
  )
}
