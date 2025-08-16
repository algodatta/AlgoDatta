"use client";
import React, { useEffect, useState } from "react";
import { apiBase, authHeaders } from "../../lib/api";

type User = { id: string; email: string; role: string; status: string };
type Summary = { counts: Record<string, number>, latest_executions: any[] };

export default function AdminPage() {
  const [health, setHealth] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [q, setQ] = useState("");

  const pingHealth = async () => {
    const r = await fetch(`${apiBase()}/api/admin/health`, { headers: authHeaders() });
    const j = await r.json().catch(() => ({}));
    setHealth(JSON.stringify(j));
  };

  const loadUsers = async () => {
    const url = `${apiBase()}/api/admin/users${q ? `?q=${encodeURIComponent(q)}` : ""}`;
    const r = await fetch(url, { headers: authHeaders() });
    if (r.ok) setUsers(await r.json());
  };

  const loadSummary = async () => {
    const r = await fetch(`${apiBase()}/api/admin/summary`, { headers: authHeaders() });
    if (r.ok) setSummary(await r.json());
  };

  useEffect(() => { loadUsers(); loadSummary(); }, []);

  const setStatus = async (id: string, status: "active" | "disabled") => {
    await fetch(`${apiBase()}/api/admin/users/${id}/status`, {
      method: "PATCH",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    loadUsers();
  };

  const [brokerForm, setBrokerForm] = useState({ user_id: "", client_id: "", access_token: "" });
  const submitBroker = async () => {
    await fetch(`${apiBase()}/api/admin/brokers/upsert`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(brokerForm)
    });
    alert("Broker upserted");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Admin</h2>

      <div className="flex items-center gap-2">
        <button onClick={pingHealth} className="px-3 py-2 rounded bg-black text-white">Ping Health</button>
        <code className="text-sm break-all">{health}</code>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="font-medium text-lg">Users</h3>
          <div className="flex gap-2">
            <input className="border rounded p-2 flex-1" placeholder="Search email..." value={q} onChange={e=>setQ(e.target.value)} />
            <button onClick={loadUsers} className="px-3 py-2 rounded border">Search</button>
          </div>
          <table className="w-full text-sm bg-white rounded border">
            <thead className="bg-gray-100">
              <tr><th className="p-2 text-left">Email</th><th className="p-2">Role</th><th className="p-2">Status</th><th className="p-2">Actions</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t">
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.role}</td>
                  <td className="p-2">{u.status}</td>
                  <td className="p-2 space-x-2">
                    <button onClick={()=>setStatus(u.id, "active")} className="px-2 py-1 border rounded">Enable</button>
                    <button onClick={()=>setStatus(u.id, "disabled")} className="px-2 py-1 border rounded">Disable</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium text-lg">Summary</h3>
          <pre className="text-xs bg-gray-50 p-2 rounded border overflow-x-auto">{JSON.stringify(summary, null, 2)}</pre>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-medium text-lg">Upsert Broker for User</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input className="border rounded p-2" placeholder="User ID" value={brokerForm.user_id} onChange={e=>setBrokerForm({...brokerForm, user_id: e.target.value})}/>
          <input className="border rounded p-2" placeholder="Client ID" value={brokerForm.client_id} onChange={e=>setBrokerForm({...brokerForm, client_id: e.target.value})}/>
          <input className="border rounded p-2" placeholder="Access Token" value={brokerForm.access_token} onChange={e=>setBrokerForm({...brokerForm, access_token: e.target.value})}/>
        </div>
        <button onClick={submitBroker} className="px-3 py-2 rounded bg-black text-white">Save Broker</button>
      </div>
    </div>
  );
}
