'use client';
import { useEffect, useMemo, useState } from 'react';
import { fetchJson } from '@/lib/fetcher';
import type { Strategy, ToggleResponse } from '@/types/api';
import Toggle from '@/components/ui/Toggle';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';

export default function StrategiesPage() {
  const [items, setItems] = useState<Strategy[]>([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  async function load() {
    setLoading(true); setMsg('');
    try {
      const data = await fetchJson<Strategy[]>('/api/strategies');
      setItems(data || []);
    } catch (e:any) { setMsg(e?.message || 'Failed to load'); }
    finally { setLoading(false); }
  }
  useEffect(()=>{ load(); }, []);

  async function toggle(id: string, next: boolean) {
    setMsg('');
    try {
      const res = await fetchJson<ToggleResponse>(`/api/strategies/${id}/toggle`, { method: 'POST' });
      setMsg(res.message || `Strategy ${res.status}`);
      // Optimistic update
      setItems(prev => prev.map(s => s.id===id ? { ...s, status: res.status } : s));
    } catch (e:any) { setMsg(e?.message || 'Toggle failed'); }
  }

  const filtered = useMemo(()=>{
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(s => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q));
  }, [items, search]);

  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Strategy Manager</h1>
        <div className="flex items-center gap-2">
          <input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}
                 className="border rounded-xl px-3 py-1.5 text-sm" />
          <button onClick={load} className="rounded-xl border px-3 py-1.5 text-sm">Refresh</button>
        </div>
      </div>
      {msg && <p className="text-sm">{msg}</p>}
      <Table>
        <THead>
          <TH>ID</TH><TH>Name</TH><TH>Status</TH><TH numeric>Win %</TH><TH numeric>P&L</TH><TH numeric>Trades</TH><TH>Created</TH><TH>Updated</TH><TH>Action</TH>
        </THead>
        <TBody>
          {filtered.map((s)=>(
            <TR key={s.id}>
              <TD>{s.id}</TD>
              <TD>{s.name}</TD>
              <TD>
                <span className={`px-2 py-0.5 rounded-xl text-xs ${s.status==='running'?'bg-green-100 text-green-700': s.status==='error'?'bg-red-100 text-red-700':'bg-gray-100 text-gray-700'}`}>
                  {s.status}
                </span>
              </TD>
              <TD numeric>{s.metrics?.win_rate != null ? `${(s.metrics.win_rate*100).toFixed(1)}%` : '-'}</TD>
              <TD numeric className={(s.metrics?.pnl ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}>{s.metrics?.pnl?.toFixed(2) ?? '-'}</TD>
              <TD numeric>{s.metrics?.trades ?? '-'}</TD>
              <TD>{s.created_at ? new Date(s.created_at).toLocaleString() : '-'}</TD>
              <TD>{s.updated_at ? new Date(s.updated_at).toLocaleString() : '-'}</TD>
              <TD>
                <Toggle checked={s.status==='running'} onChange={(n)=>toggle(s.id, n)} />
              </TD>
            </TR>
          ))}
          {filtered.length===0 && !loading && <TR><TD colSpan={9}>No strategies.</TD></TR>}
        </TBody>
      </Table>
    </div>
  );
}
