'use client';
import { useEffect, useState } from 'react';
import { apiBase } from '@/app/lib/api';
type Note = { id: string; title?: string; body?: string; created_at?: string; [k:string]: any };
export default function NotificationsPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { (async () => {
    try {
      const res = await fetch(`${apiBase}/api/notifications`, { credentials: 'include' });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json().catch(()=> []);
      setNotes(Array.isArray(data) ? data : []);
    } catch { setErr('Unable to load notifications.'); setNotes([]); }
  })(); }, []);
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Notifications</h2>
      {err && <div className="text-amber-700 text-sm mb-2">{err}</div>}
      {notes.length === 0 && <div className="text-sm text-neutral-500">No notifications.</div>}
      <div className="grid gap-2">
        {notes.map(n => (
          <div key={n.id} className="p-3 rounded border">
            <div className="font-medium">{n.title || n.id}</div>
            {n.body && <div className="text-sm">{n.body}</div>}
            {n.created_at && <div className="text-xs text-neutral-500">{n.created_at}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
