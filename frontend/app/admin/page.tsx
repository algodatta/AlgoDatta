
"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

type User = { id:string; email:string; role:string; status:string };

export default function AdminUsers(){
  const [users, setUsers] = useState<User[]>([]);
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", role: "user" });

  const search = async () => {
    setErr("");
    const res: Response = await apiFetch(`/api/admin/users${q ? `?q=${encodeURIComponent(q)}` : ""}`);
    const data = await res.json().catch(()=>[]);
    if(res.ok) setUsers(Array.isArray(data) ? data : (data.items || []));
    else setErr(data.detail || "Failed to load users");
  };

  useEffect(()=>{ search(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const res: Response = await apiFetch("/api/admin/users", {
      method: "POST",
      body: JSON.stringify(form)
    });
    const data = await res.json().catch(()=>({}));
    if(res.ok){ setCreating(false); setForm({email:"", password:"", role:"user"}); search(); }
    else setErr(data.detail || "Create user failed");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold">Admin / Users</h1>
        <div className="flex items-center gap-2">
          <input placeholder="Search email…" value={q} onChange={e=>setQ(e.target.value)} className="border p-2 rounded"/>
          <button className="px-3 py-1.5 rounded border" onClick={search}>Search</button>
          <button className="px-3 py-1.5 rounded bg-blue-600 text-white" onClick={()=>setCreating(true)}>New</button>
        </div>
      </div>
      {err && <div className="text-red-600 mb-2">{err}</div>}
      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50"><tr>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Role</th>
            <th className="p-2 text-left">Status</th>
          </tr></thead>
          <tbody>
            {users.map(u=>(
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2">{u.status}</td>
              </tr>
            ))}
            {users.length===0 && <tr><td colSpan={3} className="p-3 text-gray-500">No results</td></tr>}
          </tbody>
        </table>
      </div>

      {creating && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <form onSubmit={create} className="bg-white rounded p-4 w-[420px] space-y-2">
            <h2 className="font-medium text-lg mb-2">Create User</h2>
            <input className="w-full border p-2 rounded" placeholder="Email" value={form.email}
              onChange={e=>setForm({...form, email:e.target.value})} required />
            <input className="w-full border p-2 rounded" placeholder="Password" type="password" value={form.password}
              onChange={e=>setForm({...form, password:e.target.value})} required />
            <select className="w-full border p-2 rounded" value={form.role} onChange={e=>setForm({...form, role:e.target.value})}>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="px-3 py-1.5 rounded border" onClick={()=>setCreating(false)}>Cancel</button>
              <button className="px-3 py-1.5 rounded bg-blue-600 text-white">Create</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
