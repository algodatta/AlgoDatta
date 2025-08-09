'use client';
import React, { useEffect, useState } from 'react';
import Alert from '../../components/Alert';
import DataTable from '../../components/DataTable';
import { api, authHeaders } from '../../lib/api';

export default function ReportsPage(){
  const [msg, setMsg] = useState('');
  const [rows, setRows] = useState<any[]>([]);
  const [filters, setFilters] = useState<any>({ status:'', type:'', start:'', end:'', limit: 200, client_id:'' });

  const load = async () => {
    const res = await api.get('/api/reports/json', { headers: authHeaders(), params: filters });
    setRows(res.data || res);
  };

  useEffect(()=>{ load(); }, []);

  const download = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    const params = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([k,v]) => v)));
    const a = document.createElement('a');
    a.href = `/api/reports/csv?${params.toString()}&token=${token}`;
    a.download = 'executions.csv';
    a.click();
    setMsg('CSV export started');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Reports</h1>
        {msg && <Alert type="success" message={msg} />}
        <div className="bg-white rounded-xl shadow p-4 grid grid-cols-2 md:grid-cols-7 gap-3">
          <select className="border rounded p-2" value={filters.status} onChange={e=>setFilters((f:any)=>({...f, status:e.target.value}))}>
            <option value="">All Status</option><option value="success">Success</option><option value="fail">Fail</option>
          </select>
          <select className="border rounded p-2" value={filters.type} onChange={e=>setFilters((f:any)=>({...f, type:e.target.value}))}>
            <option value="">All Types</option><option value="paper">Paper</option><option value="live">Live</option>
          </select>
          <input type="date" className="border rounded p-2" value={filters.start} onChange={e=>setFilters((f:any)=>({...f, start:e.target.value}))} />
          <input type="date" className="border rounded p-2" value={filters.end} onChange={e=>setFilters((f:any)=>({...f, end:e.target.value}))} />
          <input type="number" className="border rounded p-2" placeholder="Limit" value={filters.limit} onChange={e=>setFilters((f:any)=>({...f, limit:Number(e.target.value)}))} />
          <input className="border rounded p-2" placeholder="Client ID" value={filters.client_id||''} onChange={e=>setFilters((f:any)=>({...f, client_id:e.target.value}))} />
          <div className="flex gap-2">
            <button onClick={load} className="px-3 py-2 rounded bg-blue-600 text-white w-full">Apply</button>
            <button onClick={download} className="px-3 py-2 rounded bg-green-600 text-white w-full">Download CSV</button>
          </div>
        </div>
        <DataTable columns={[
          {key:'executed_at',label:'Executed At'},
          {key:'type',label:'Type'},
          {key:'status',label:'Status'},
          {key:'broker_client_id',label:'Broker Client ID'},
          {key:'alert_id',label:'Alert ID'},
          {key:'response',label:'Response'}
        ]} data={rows} />
      </div>
    </div>
  );
}
