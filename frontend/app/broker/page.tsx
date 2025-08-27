'use client';
import { useEffect, useState } from 'react';
import { fetchJson } from '@/lib/fetcher';
import type { BrokerProfile, Holding, Position } from '@/types/api';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';

export default function BrokerPage() {
  const [profile, setProfile] = useState<BrokerProfile | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [msg, setMsg] = useState<string>('');

  async function load() {
    setMsg('');
    try {
      const [p, h, pos] = await Promise.all([
        fetchJson<BrokerProfile>('/api/broker/profile'),
        fetchJson<Holding[]>('/api/broker/holdings'),
        fetchJson<Position[]>('/api/broker/positions'),
      ]);
      setProfile(p || null); setHoldings(h || []); setPositions(pos || []);
    } catch (e: any) { setMsg(e?.message || 'Failed to load broker info'); }
  }
  useEffect(()=>{ load(); }, []);

  async function connect() {
    setMsg('');
    try {
      const res = await fetchJson<{ message: string }>('/api/broker/connect', { method: 'POST' });
      setMsg(res.message || 'Connected');
      load();
    } catch (e: any) { setMsg(e?.message || 'Connect failed'); }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Broker Integration</h1>
        <button onClick={connect} className="rounded-2xl bg-black text-white px-4 py-2">Connect</button>
      </div>
      {msg && <p className="text-sm">{msg}</p>}

      <section className="space-y-2">
        <h2 className="font-medium">Profile</h2>
        {profile ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="border rounded-xl p-3"><div className="text-xs opacity-60">Client ID</div><div>{profile.client_id || '-'}</div></div>
            <div className="border rounded-xl p-3"><div className="text-xs opacity-60">Name</div><div>{profile.name || '-'}</div></div>
            <div className="border rounded-xl p-3"><div className="text-xs opacity-60">Email</div><div>{profile.email || '-'}</div></div>
            <div className="border rounded-xl p-3"><div className="text-xs opacity-60">Phone</div><div>{profile.phone || '-'}</div></div>
            <div className="border rounded-xl p-3"><div className="text-xs opacity-60">Segments</div><div>{(profile.segment||[]).join(', ') || '-'}</div></div>
            <div className="border rounded-xl p-3"><div className="text-xs opacity-60">Balance</div><div>₹{profile.balance ?? '-'}</div></div>
          </div>
        ) : <div className="text-sm opacity-70">No profile yet.</div>}
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Holdings</h2>
        <Table>
          <THead>
            <TH>Symbol</TH><TH numeric>Qty</TH><TH numeric>Avg</TH><TH numeric>LTP</TH><TH numeric>PnL</TH>
          </THead>
          <TBody>
            {holdings.map((h, i)=>(
              <TR key={i}>
                <TD>{h.symbol}</TD>
                <TD numeric>{h.qty}</TD>
                <TD numeric>{h.avg_price.toFixed(2)}</TD>
                <TD numeric>{(h.ltp ?? 0).toFixed(2)}</TD>
                <TD numeric className={((h.pnl ?? 0) >= 0 ? 'text-green-600':'text-red-600')}>{(h.pnl ?? 0).toFixed(2)}</TD>
              </TR>
            ))}
            {holdings.length===0 && <TR><TD colSpan={5}>No holdings.</TD></TR>}
          </TBody>
        </Table>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Positions</h2>
        <Table>
          <THead>
            <TH>Symbol</TH><TH>Side</TH><TH numeric>Qty</TH><TH numeric>Avg</TH><TH numeric>LTP</TH><TH numeric>PnL</TH>
          </THead>
          <TBody>
            {positions.map((p, i)=>(
              <TR key={i}>
                <TD>{p.symbol}</TD>
                <TD>{p.side}</TD>
                <TD numeric>{p.qty}</TD>
                <TD numeric>{p.avg_price.toFixed(2)}</TD>
                <TD numeric>{(p.ltp ?? 0).toFixed(2)}</TD>
                <TD numeric className={((p.pnl ?? 0) >= 0 ? 'text-green-600':'text-red-600')}>{(p.pnl ?? 0).toFixed(2)}</TD>
              </TR>
            ))}
            {positions.length===0 && <TR><TD colSpan={6}>No positions.</TD></TR>}
          </TBody>
        </Table>
      </section>
    </div>
  );
}
