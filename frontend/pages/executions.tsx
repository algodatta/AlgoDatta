
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

export default function ExecutionsPage(){
  const [rows, setRows] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [filters, setFilters] = useState<any>({ status:'', type:'', limit:50 });

  const load = async () => {
    const res = await api.get('/api/executions', { headers: authHeaders(), params: filters });
    setRows(res.data);
  };

  useEffect(() => { load(); }, [filters]);

  useEffect(() => {
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <PageHeader title="Execution Status" subtitle="Auto-refreshing every 5s" />
        {msg && <Alert type="success" message={msg} />}
        <div className="bg-white rounded-xl shadow p-4 flex flex-wrap gap-3">
          <select className="border rounded p-2" value={filters.status} onChange={e=>setFilters((f:any)=>({...f, status:e.target.value}))}>
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="fail">Fail</option>
          </select>
          <select className="border rounded p-2" value={filters.type} onChange={e=>setFilters((f:any)=>({...f, type:e.target.value}))}>
            <option value="">All Types</option>
            <option value="paper">Paper</option>
            <option value="live">Live</option>
          </select>
          <input type="number" className="border rounded p-2 w-32" value={filters.limit} onChange={e=>setFilters((f:any)=>({...f, limit:Number(e.target.value)}))} />
          <button onClick={load} className="px-4 py-2 rounded bg-blue-600 text-white">Refresh</button>
        </div>
        <DataTable
          
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

export default function ExecutionsPage(){
  const [rows, setRows] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [filters, setFilters] = useState<any>({ status:'', type:'', limit:50 });

  const load = async () => {
    const res = await api.get('/api/executions', { headers: authHeaders(), params: filters });
    setRows(res.data);
  };

  useEffect(() => { load(); }, [filters]);

  useEffect(() => {
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <PageHeader title="Execution Status" subtitle="Auto-refreshing every 5s" />
        {msg && <Alert type="success" message={msg} />}
        <div className="bg-white rounded-xl shadow p-4 flex flex-wrap gap-3">
          <select className="border rounded p-2" value={filters.status} onChange={e=>setFilters((f:any)=>({...f, status:e.target.value}))}>
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="fail">Fail</option>
          </select>
          <select className="border rounded p-2" value={filters.type} onChange={e=>setFilters((f:any)=>({...f, type:e.target.value}))}>
            <option value="">All Types</option>
            <option value="paper">Paper</option>
            <option value="live">Live</option>
          </select>
          <input type="number" className="border rounded p-2 w-32" value={filters.limit} onChange={e=>setFilters((f:any)=>({...f, limit:Number(e.target.value)}))} />
          <button onClick={load} className="px-4 py-2 rounded bg-blue-600 text-white">Refresh</button>
        </div>
        <DataTable
          columns={[
            {key:'executed_at', label:'Executed At'},
            {key:'type', label:'Type'},
            {key:'status', label:'Status'},
            {key:'alert_id', label:'Alert ID'},
            {key:'response', label:'Response'}
          ]}
          data={rows}
        />
      </div>
    </div>
  );
}

            {key:'executed_at', label:'Executed At'},
            {key:'type', label:'Type'},
            {key:'status', label:'Status'},
            {key:'alert_id', label:'Alert ID'},
            {key:'response', label:'Response'}
          ]}
          data={rows}
        />
      </div>
    </div>
  );
}
