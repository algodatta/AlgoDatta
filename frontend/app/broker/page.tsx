'use client';
import { withAuth } from '../../lib/withAuth';
import React, { useState } from 'react';
import { api, authHeaders } from '../../lib/api';
import Alert from '../../components/Alert';

function BrokerPage(){
  const [clientId, setClientId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [msg, setMsg] = useState('');

  const link = async () => {
    try{
      if(!clientId || !accessToken){ setMsg('Please enter both Client ID and Access Token'); return; }
      await api.post('/api/broker', { broker_type: 'dhan', client_id: clientId, access_token: accessToken }, { headers: authHeaders() });
      setMsg('Broker linked successfully');
    }catch{ setMsg('Failed to link broker'); }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-4 space-y-3">
        <h1 className="text-2xl font-bold">Connect Broker</h1>
        {msg && <Alert type={msg.includes('Failed') ? 'error' : 'success'} message={msg} />}
        <label className="block text-sm font-medium text-gray-700 mt-2">Client ID</label>
        <input className="border rounded p-2 w-full" placeholder="Enter Client ID" value={clientId} onChange={e=>setClientId(e.target.value)} />
        <label className="block text-sm font-medium text-gray-700 mt-2">Access Token</label>
        <input className="border rounded p-2 w-full" placeholder="Enter Access Token" type="password" value={accessToken} onChange={e=>setAccessToken(e.target.value)} />
        <button onClick={link} className="px-4 py-2 rounded bg-blue-600 text-white">Link Broker</button>
      </div>
    </div>
  );
}


export default withAuth(BrokerPage);
