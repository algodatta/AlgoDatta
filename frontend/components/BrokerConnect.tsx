'use client';
import React, { useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.algodatta.com';
const CONNECT_PATH = process.env.NEXT_PUBLIC_BROKER_CONNECT_PATH || '/api/broker/connect';

export default function BrokerConnect() {
  const [clientId, setClientId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!token) {
      setMsg('Not authenticated. Please login first.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}${CONNECT_PATH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          client_id: clientId,
          access_token: accessToken,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err = data?.detail || data?.error || res.statusText;
        throw new Error(String(err));
      }
      setMsg('✅ Broker connected successfully.');
      setClientId('');
      setAccessToken('');
    } catch (err: any) {
      setMsg(`❌ Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Broker Integration</h2>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Connect your broker by providing your <b>Client ID</b> and a valid <b>Access Token</b>.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Client ID</label>
          <input
            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring"
            placeholder="e.g. ZERODHA123"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
            autoComplete="off"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Access Token</label>
          <input
            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring"
            placeholder="Paste your access token"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            required
            autoComplete="off"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl px-4 py-2 bg-black text-white disabled:opacity-50"
          >
            {loading ? 'Integrating…' : 'Integrate'}
          </button>
          {msg && <span className="text-sm">{msg}</span>}
        </div>
      </form>
    </div>
  );
}
