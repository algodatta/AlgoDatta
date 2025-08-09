
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

export default function AdminPage(){
  const [users, setUsers] = useState<any[]>([]);
  const [msg, setMsg] = useState<string>('');

  const fetchUsers = async () => {
    const res = await api.get('/api/admin/users', { headers: authHeaders() });
    setUsers(res.data);
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleStatus = async (id: string, status: 'active'|'disabled') => {
    await api.patch(`/api/admin/users/${id}/status`, null, { params: { status }, headers: authHeaders() });
    setMsg(`Updated user status to ${status}`);
    fetchUsers();
  };

  const resetBroker = async (id: string) => {
    await api.post(`/api/admin/users/${id}/reset-broker`, null, { headers: authHeaders() });
    setMsg('Broker tokens reset');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <PageHeader title="Admin Panel" subtitle="Manage users and broker tokens" />
        {msg && <Alert type='success' message={msg} />}
        <DataTable
          columns={[
            {key:'id', label:'ID'},
            {key:'email', label:'Email'},
            {key:'role', label:'Role'},
            {key:'status', label:'Status'},
            {key:'created_at', label:'Created'}
          ]}
          data={users}
        />
        <div className="mt-4 space-y-2">
          {users.map(u => (
            <div key={u.id} className="flex items-center gap-2">
              <span className="text-sm text-gray-600 w-64 truncate">{u.email}</span>
              <button onClick={() => toggleStatus(u.id, u.status === 'active' ? 'disabled' : 'active')} className="px-3 py-1 rounded bg-gray-800 text-white">Toggle Status</button>
              <button onClick={() => resetBroker(u.id)} className="px-3 py-1 rounded bg-indigo-600 text-white">Reset Broker</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
