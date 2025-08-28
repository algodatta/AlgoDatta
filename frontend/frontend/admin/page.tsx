"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

type User = { id: string; email: string; role: string; status: string };

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<User[]>("/admin/users")
      .then(setUsers)
      .catch((e) => setError(e.message || String(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <main className="p-6">Loading…</main>;
  if (error) return <main className="p-6 text-red-600">Error: {error}</main>;

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Admin — Users</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">ID</th>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">Email</th>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">Role</th>
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="odd:bg-white even:bg-gray-50">
                <td className="px-3 py-2 text-sm border-b">{u.id}</td>
                <td className="px-3 py-2 text-sm border-b">{u.email}</td>
                <td className="px-3 py-2 text-sm border-b">{u.role}</td>
                <td className="px-3 py-2 text-sm border-b">{u.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
