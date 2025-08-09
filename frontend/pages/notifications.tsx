
import React, { useEffect, useState } from 'react';
import { api, authHeaders } from '../lib/api';
import DataTable from '../components/DataTable';
import Alert from '../components/Alert';

function PageHeader({title, subtitle}:{title:string; subtitle?:string}){
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      {subtitle && <p className="text-gray-500">{subtitle}</p>}
    </div>
  );
}

export default function NotificationsPage(){
  const [rows, setRows] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ method: 'telegram', endpoint: '' });

  const load = async () => {
    const res = await api.get('/api/notifications', { headers: authHeaders() });
    setRows(res.data);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    await api.post('/api/notifications', form, { headers: authHeaders() });
    setMsg('Notification endpoint added'); setForm({ method:'telegram', endpoint:'' }); load();
  };
  const del = async (id: string) => {
    await api.delete(`/api/notifications/${id}`, { headers: authHeaders() });
    setMsg('Removed'); load();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <PageHeader title="Notification Settings" subtitle="Add Telegram chat ID or Email address" />
        {msg && <Alert type="success" message={msg} />}
        <div className="bg-white rounded-xl shadow p-4 space-y-3">
          <select className="border rounded p-2" value={form.method} onChange={e=>setForm(f=>({...f, method:e.target.value} as any))}>
            <option value="telegram">Telegram</option>
            <option value="email">Email</option>
          </select>
          <input className="border rounded p-2 w-full" placeholder="Chat ID or Email" value={form.endpoint} onChange={e=>setForm(f=>({...f, endpoint:e.target.value}))} />
          <button onClick={add} className="px-4 py-2 rounded bg-blue-600 text-white">Add</button>
        </div>
        <DataTable columns={[
          {key:'id', label:'ID'},
          {key:'method', label:'Method'},
          {key:'endpoint', label:'Endpoint'},
          {key:'enabled', label:'Enabled'}
        ]} data={rows} />
        <div className="mt-2 space-y-2">
          {rows.map(r => (
            <div key={r.id}><button onClick={() => del(r.id)} className="px-3 py-1 rounded bg-red-600 text-white">Delete</button></div>
          ))}
        </div>
      </div>
    </div>
  );
}
