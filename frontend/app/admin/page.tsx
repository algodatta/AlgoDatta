<<<<<<< HEAD
"use client";
import { useEffect, useState } from "react";
import { apiBase, authHeaders } from "@/lib/api";

type User = { id:string; email:string; is_active?:boolean; created_at?:string };

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch(`${apiBase()}/api/admin/users`, { headers: authHeaders() as HeadersInit });
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } else {
        setMsg("Failed to load users");
      }
    } catch (e:any) {
      setMsg(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleUser = async (id:string) => {
    setMsg("...");
    const opts = { method:"PATCH", headers: authHeaders() as HeadersInit };
    let res = await fetch(`${apiBase()}/api/admin/users/${id}/toggle`, opts);
    if (res.status === 404) {
      // fallback for POST action
      res = await fetch(`${apiBase()}/api/admin/users/${id}/toggle`, { ...opts, method:"POST" });
    }
    setMsg(res.ok ? "Toggled user" : "Toggle failed");
    load();
  };

  const resetBroker = async (id:string) => {
    setMsg("...");
    const res = await fetch(`${apiBase()}/api/admin/broker/reset`, {
      method: "POST",
      headers: ({ ...authHeaders(), "Content-Type": "application/json" } as HeadersInit),
      body: JSON.stringify({ user_id: id })
    });
    setMsg(res.ok ? "Broker token reset" : "Reset failed");
  };

  const testNotification = async (id:string) => {
    setMsg("...");
    const res = await fetch(`${apiBase()}/api/notifications/test`, {
      method: "POST",
      headers: ({ ...authHeaders(), "Content-Type": "application/json" } as HeadersInit),
      body: JSON.stringify({ user_id: id, channel: "email" })
    });
    setMsg(res.ok ? "Notification sent" : "Notification failed");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Admin</h2>
        <button onClick={load} className="px-3 py-2 bg-black text-white rounded">{loading ? "Loading..." : "Reload"}</button>
      </div>
      {msg && <div className="text-sm text-gray-600">{msg}</div>}
      <div className="overflow-x-auto border rounded bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Email</th>
              <th className="p-2">Active</th>
              <th className="p-2">Created</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.is_active ? "Yes" : "No"}</td>
                <td className="p-2">{u.created_at ? new Date(u.created_at).toLocaleString() : "-"}</td>
                <td className="p-2 flex gap-2 justify-center">
                  <button onClick={() => toggleUser(u.id)} className="px-2 py-1 border rounded">Enable/Disable</button>
                  <button onClick={() => resetBroker(u.id)} className="px-2 py-1 border rounded">Reset Broker</button>
                  <button onClick={() => testNotification(u.id)} className="px-2 py-1 border rounded">Test Notify</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td className="p-3 text-center text-gray-500" colSpan={4}>No users</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
=======
export default function Admin(){
  return (
    <div className="space-y-2">
      <h2 className="text-xl font-medium">Admin</h2>
      <p>Health check available at <code>/api/admin/health</code> on the backend.</p>
    </div>
  )
}
>>>>>>> 4d0fc9a2464fb0e7af8e4db8841f28a9cb0301df
