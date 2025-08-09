'use client';
import React, { useState } from 'react';
import { api } from '../../lib/api';
import Alert from '../../components/Alert';

export default function SignupPage(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const signup = async () => {
    try{
      setLoading(true);
      // register
      await api.post('/api/register', { email, password });
      // login
      const res = await api.post('/api/login', { email, password });
      const token = res.data?.access_token || res.data?.token || '';
      if(!token){ setMsg('Signup ok, but login failed (no token)'); setLoading(false); return; }
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        document.cookie = `token=${token}; path=/; SameSite=Lax`;
        window.location.href = '/';
      }
    }catch(e:any){
      const detail = e?.response?.data?.detail || e?.message || 'Signup failed';
      setMsg(String(detail));
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow p-6 space-y-4">
        <h1 className="text-2xl font-bold">Sign up</h1>
        {msg && <Alert type="error" message={msg} />}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input className="border rounded p-2 w-full" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input className="border rounded p-2 w-full" type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        <button onClick={signup} disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white w-full">{loading ? 'Creating account…' : 'Create account'}</button>
      </div>
    </div>
  );
}
