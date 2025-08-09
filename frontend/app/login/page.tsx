'use client';
import React, { useState } from 'react';
import { api } from '../../lib/api';
import Alert from '../../components/Alert';

export default function LoginPage(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async () => {
    try{
      setLoading(true);
      const res = await api.post('/api/login', { email, password });
      const token = res.data?.access_token || res.data?.token || '';
      if(!token){ setMsg('Login failed: no token returned'); setLoading(false); return; }

      // store in localStorage (used by fetch helper) and cookie (checked by middleware)
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        document.cookie = `token=${token}; path=/; SameSite=Lax`;
      }

      const params = new URLSearchParams(window.location.search);
      const nxt = params.get('next') || '/';
      window.location.href = nxt;
    }catch(e:any){
      setMsg(e?.response?.data?.detail || 'Login failed');
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow p-6 space-y-4">
        <h1 className="text-2xl font-bold">Login</h1>
        {msg && <Alert type="error" message={msg} />}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input className="border rounded p-2 w-full" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input className="border rounded p-2 w-full" type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        <button onClick={login} disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white w-full">{loading ? 'Signing in...' : 'Sign in'}</button>
      </div>
    </div>
  );
}
