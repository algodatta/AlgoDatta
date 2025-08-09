'use client';
import React, { useEffect, useState } from 'react';
import { api, authHeaders } from '../../lib/api';
import DataTable from '../../components/DataTable';

export default function StrategiesPage(){
  const [rows, setRows] = useState<any[]>([]);
  useEffect(()=>{ (async()=>{ const res = await api.get('/api/strategies', { headers: authHeaders() }); setRows(res.data || res); })(); }, []);
  return (<div className="min-h-screen bg-gray-100 p-6">
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Strategies</h1>
      <DataTable columns={[
        {key:'id',label:'ID'},
        {key:'name',label:'Name'},
        {key:'status',label:'Status'},
        {key:'paper_trading',label:'Paper?'},
        {key:'webhook_path',label:'Webhook'}
      ]} data={rows} />
    </div>
  </div>);
}
