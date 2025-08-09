
import React, { useEffect, useState } from 'react';
import { api, authHeaders } from '../../lib/api';
import DataTable from '../../components/DataTable';
import Alert from '../../components/Alert';

function PageHeader({title, subtitle}:{title:string; subtitle?:string}){
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      {subtitle && <p className="text-gray-500">{subtitle}</p>}
    </div>
  );
}

export default function StrategiesPage(){
  const [strategies, setStrategies] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ name:'', script:'', broker_id:'', paper_trading:true });
  const [msg, setMsg] = useState<string>('');

  const fetchStrategies = async () => {
    const res = await api.get('/api/strategies', { headers: authHeaders() }).catch(() => null);
    if(res) setStrategies(res.data);
  };

  useEffect(() => { fetchStrategies(); }, []);

  const createStrategy = async () => {
    const res = await api.post('/api/strategies', form, { headers: authHeaders() });
    setMsg('Strategy created'); setForm({ name:'', script:'', broker_id:'', paper_trading:true });
    fetchStrategies();
  };

  const updateStrategy = async (id: string, updates: any) => {
    await api.patch(`/api/strategies/${id}`, updates, { headers: authHeaders() });
    setMsg('Strategy updated'); fetchStrategies();
  };

  const deleteStrategy = async (id: string) => {
    await api.delete(`/api/strategies/${id}`, { headers: authHeaders() });
    setMsg('Strategy deleted'); fetchStrategies();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader title="Strategy Manager" subtitle="Create, update, delete strategies" />
        {msg && <Alert type="success" message={msg} />}
        <div className="bg-white rounded-xl shadow p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input className="border rounded p-2" placeholder="Name" value={form.name} onChange={e => setForm((f:any)=>({...f, name:e.target.value}))} />
            <input className="border rounded p-2" placeholder="Broker ID" value={form.broker_id} onChange={e => setForm((f:any)=>({...f, broker_id:e.target.value}))} />
            <textarea className="border rounded p-2 col-span-2" rows={4} placeholder="Pine Script" value={form.script} onChange={e => setForm((f:any)=>({...f, script:e.target.value}))} />
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.paper_trading} onChange={e => setForm((f:any)=>({...f, paper_trading:e.target.checked}))} />
              Paper Trading
            </label>
            <button onClick={createStrategy} className="px-4 py-2 rounded bg-blue-600 text-white">Create</button>
          </div>
        </div>

        <DataTable
          columns={[
            {key:'id', label:'ID'},
            {key:'name', label:'Name'},
            {key:'status', label:'Status'},
            {key:'paper_trading', label:'Paper?'},
            {key:'webhook_path', label:'Webhook'},
            {key:'created_at', label:'Created'}
          ]}
          data={strategies}
        />
        <div className="mt-4 space-y-2">
          {strategies.map(s => (
            <div key={s.id} className="flex items-center gap-2">
              <button onClick={() => updateStrategy(s.id, { status: s.status === 'active' ? 'paused' : 'active' })} className="px-3 py-1 rounded bg-gray-800 text-white">Toggle Active</button>
              <button onClick={() => deleteStrategy(s.id)} className="px-3 py-1 rounded bg-red-600 text-white">Delete</button>
              <button onClick={() => navigator.clipboard.writeText(`/api/webhooks/${s.webhook_path}`)} className="px-3 py-1 rounded bg-indigo-600 text-white">Copy Webhook URL</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
