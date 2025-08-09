
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

export default function ErrorLogsPage(){
  const [rows, setRows] = useState<any[]>([]);
  const [msg, setMsg] = useState('');

  const load = async () => {
    try {
      const res = await api.get('/api/error-logs', { headers: authHeaders() });
      setRows(res.data);
    } catch (e) { /* optional */ }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <PageHeader title="Error Logs" subtitle="Recent webhook and execution errors" />
        {msg && <Alert type="success" message={msg} />}
        <DataTable columns={[
          {key:'id', label:'ID'},
          {key:'error_type', label:'Type'},
          {key:'message', label:'Message'},
          {key:'details', label:'Details'},
          {key:'created_at', label:'At'}
        ]} data={rows} />
      </div>
    </div>
  );
}
