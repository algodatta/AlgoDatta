
import React, { useState } from 'react';
import Alert from '../components/Alert';

function PageHeader({title, subtitle}:{title:string; subtitle?:string}){
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      {subtitle && <p className="text-gray-500">{subtitle}</p>}
    </div>
  );
}

export default function ReportsPage(){
  const [msg, setMsg] = useState('');
  const [filters, setFilters] = useState<any>({ status:'', type:'', start:'', end:'' });

  const download = async () => {
    const base = '/api/reports/csv';
    const params = new URLSearchParams({
      ...(filters.status ? {status: filters.status}:{}) as any,
      ...(filters.type ? {type: filters.type}:{}) as any,
      ...(filters.start ? {start: filters.start}:{}) as any,
      ...(filters.end ? {end: filters.end}:{}) as any,
    } as any).toString();

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    const url = `${base}?${params}`;
    const a = document.createElement('a');
    a.href = url + (params ? '&' : '?') + `token=${token}`;
    a.download = 'executions.csv';
    a.click();
    setMsg('CSV export started');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <PageHeader title="Reports" subtitle="Filter and export executions CSV" />
        {msg && <Alert type="success" message={msg} />}
        <div className="bg-white rounded-xl shadow p-4 grid grid-cols-2 gap-3">
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
          <input type="date" className="border rounded p-2" value={filters.start} onChange={e=>setFilters((f:any)=>({...f, start:e.target.value}))} />
          <input type="date" className="border rounded p-2" value={filters.end} onChange={e=>setFilters((f:any)=>({...f, end:e.target.value}))} />
          <button onClick={download} className="px-4 py-2 rounded bg-green-600 text-white col-span-2">Download CSV</button>
        </div>
      </div>
    </div>
  );
}
