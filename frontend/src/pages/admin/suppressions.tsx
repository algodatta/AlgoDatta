import React, { useEffect, useMemo, useState } from "react";

const DEFAULT_PAGE_SIZE = 50;

function Input({ label, children }: any) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}

function Button({ children, onClick, type = "button", className = "", disabled }: any) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`px-3 py-2 rounded-2xl shadow-sm border border-gray-200 hover:shadow transition text-sm ${
        disabled ? "opacity-60 cursor-not-allowed" : "bg-white"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function Pill({ children, color = "slate" }: any) {
  const map: any = {
    slate: "bg-slate-100 text-slate-700",
    red: "bg-red-100 text-red-700",
    amber: "bg-amber-100 text-amber-800",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[color] || map.slate}`}>
      {children}
    </span>
  );
}

export default function SuppressionsAdminPage() {
  const [apiBase, setApiBase] = useState<string>("");
  const [token, setToken] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  const [kind, setKind] = useState<string>(""); // BO
  const [email, setEmail] = useState<string>("");
  const [since, setSince] = useState<string>(""); // yyyy-mm-dd
  const [until, setUntil] = useState<string>("");
  const [sort, setSort] = useState<string>("-created_at");
  const [limit, setLimit] = useState<number>(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState<number>(0);

  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const savedBase = localStorage.getItem("admin.apiBase") || window.location.origin;
    const savedToken = localStorage.getItem("admin.apiToken") || "";
    setApiBase(savedBase);
    setToken(savedToken);
  }, []);

  const q = useMemo(() => {
    const params = new URLSearchParams();
    params.set("limit", String(limit));
    params.set("offset", String(page * limit));
    params.set("sort", sort);
    if (kind) params.set("kind", kind);
    if (email) params.set("email", email);
    if (since) params.set("since", new Date(since + "T00:00:00Z").toISOString());
    if (until) params.set("until", new Date(until + "T23:59:59Z").toISOString());
    return params.toString();
  }, [limit, page, sort, kind, email, since, until]);

  async function fetchList() {
    setLoading(true);
    setError("");
    try {
      const url = `${apiBase}/admin/suppressions?${q}`;
      const res = await fetch(url, { headers: { "X-Admin-Token": token } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setItems(Array.isArray(data.items) ? data.items : []);
      setTotal(Number(data.total || 0));
      setSelected({});
    } catch (e: any) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (token && apiBase) fetchList(); }, [q]); // eslint-disable-line

  function savePrefs() {
    localStorage.setItem("admin.apiBase", apiBase);
    localStorage.setItem("admin.apiToken", token);
    fetchList();
  }

  function toggleAll() {
    if (!items.length) return;
    const allSelected = items.every((r) => selected[r.email]);
    const next: Record<string, boolean> = {};
    if (!allSelected) items.forEach((r: any) => (next[r.email] = true));
    setSelected(next);
  }

  async function delOne(id: number) {
    if (!confirm("Delete this suppression entry?")) return;
    try {
      const res = await fetch(`${apiBase}/admin/suppressions/${id}`, {
        method: "DELETE",
        headers: { "X-Admin-Token": token },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      fetchList();
    } catch (e: any) {
      alert("Delete failed: " + (e.message || e));
    }
  }

  async function bulkUnsuppress() {
    const emails = Object.keys(selected).filter((k) => selected[k]);
    if (emails.length === 0) return alert("Select at least one email");
    if (!confirm(`Unsuppress ${emails.length} email(s)?`)) return;
    try {
      const res = await fetch(`${apiBase}/admin/suppressions/unsuppress`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Token": token },
        body: JSON.stringify({ emails }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      fetchList();
    } catch (e: any) {
      alert("Unsuppress failed: " + (e.message || e));
    }
  }

  async function exportCSV() {
    try {
      const url = `${apiBase}/admin/suppressions?${q}&format=csv`;
      const res = await fetch(url, { headers: { "X-Admin-Token": token } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `suppressions-${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e: any) {
      alert("Export failed: " + (e.message || e));
    }
  }

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Admin · Suppressions</h1>
            <p className="text-sm text-gray-600">Bounces & complaints captured from SES via SNS.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportCSV}>Export CSV</Button>
            <Button onClick={fetchList}>{loading ? "Loading…" : "Refresh"}</Button>
          </div>
        </header>

        <div className="bg-white rounded-2xl shadow p-4 grid grid-cols-1 md:grid-cols-3 gap-4 border border-gray-100">
          <Input label="API Base URL">
            <input value={apiBase} onChange={(e)=>setApiBase(e.target.value)} placeholder="https://api.algodatta.com" className="w-full rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-200" />
          </Input>
          <Input label="Admin Token (X-Admin-Token)">
            <input value={token} onChange={(e)=>setToken(e.target.value)} placeholder="paste ADMIN_API_KEY" className="w-full rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-200" />
          </Input>
          <div className="flex items-end">
            <Button onClick={savePrefs} className="w-full">Save & Connect</Button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-4 grid grid-cols-1 md:grid-cols-6 gap-4 border border-gray-100">
          <Input label="Kind">
            <select value={kind} onChange={(e)=>{setPage(0); setKind(e.target.value);}} className="w-full rounded-xl border-gray-300">
              <option value="">All</option>
              <option value="BOUNCE">BOUNCE</option>
              <option value="COMPLAINT">COMPLAINT</option>
            </select>
          </Input>
          <Input label="Email contains">
            <input value={email} onChange={(e)=>{setPage(0); setEmail(e.target.value);}} placeholder="user@domain.com" className="w-full rounded-xl border-gray-300" />
          </Input>
          <Input label="Since">
            <input type="date" value={since} onChange={(e)=>{setPage(0); setSince(e.target.value);}} className="w-full rounded-xl border-gray-300" />
          </Input>
          <Input label="Until">
            <input type="date" value={until} onChange={(e)=>{setPage(0); setUntil(e.target.value);}} className="w-full rounded-xl border-gray-300" />
          </Input>
          <Input label="Sort">
            <select value={sort} onChange={(e)=>setSort(e.target.value)} className="w-full rounded-xl border-gray-300">
              <option value="-created_at">Newest first</option>
              <option value="created_at">Oldest first</option>
            </select>
          </Input>
          <Input label="Page size">
            <select value={limit} onChange={(e)=>{setPage(0); setLimit(Number(e.target.value));}} className="w-full rounded-xl border-gray-300">
              {[25,50,100,200].map(n=> <option key={n} value={n}>{n}</option>)}
            </select>
          </Input>
        </div>

        <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
              <Button onClick={toggleAll}>Select all / none</Button>
              <Button onClick={bulkUnsuppress}>Unsuppress selected</Button>
            </div>
            <div className="text-sm text-gray-600 pr-2">Total: {total}</div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-2 text-left">Sel</th>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Kind</th>
                  <th className="px-4 py-2 text-left">Created</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                      {loading ? "Loading…" : "No data"}
                    </td>
                  </tr>
                )}
                {items.map((r: any) => (
                  <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2 align-middle">
                      <input type="checkbox" checked={!!selected[r.email]} onChange={(e)=>setSelected(s=>({...s, [r.email]: e.target.checked}))} />
                    </td>
                    <td className="px-4 py-2">{r.id}</td>
                    <td className="px-4 py-2 font-medium">{r.email}</td>
                    <td className="px-4 py-2">
                      <Pill color={r.kind === "BOUNCE" ? "red" : "amber"}>{r.kind}</Pill>
                    </td>
                    <td className="px-4 py-2">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="px-4 py-2">
                      <Button onClick={() => delOne(r.id)} className="bg-red-50 hover:bg-red-100">Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between p-3 border-t border-gray-100">
            <div className="text-sm text-gray-600">
              Page {page + 1} / {totalPages}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setPage(0)} disabled={page === 0}>« First</Button>
              <Button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>‹ Prev</Button>
              <Button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>Next ›</Button>
              <Button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}>Last »</Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-2xl">
            Error: {error}
          </div>
        )}
      </div>
    </div>
  );
}
