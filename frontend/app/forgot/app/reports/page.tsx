
"use client";
import { useState } from "react";
import { apiFetch } from "../../lib/api";

export default function ReportsPage(){
  const [fromDate, setFrom] = useState("");
  const [toDate, setTo] = useState("");
  const [msg, setMsg] = useState("");

  const downloadCsv = async () => {
    setMsg("");
    const qs = new URLSearchParams({ ...(fromDate?{from_date:fromDate}:{}) , ...(toDate?{to_date:toDate}:{}) });
    const res = await apiFetch(`/api/reports/executions.csv?${qs.toString()}`, { method: "GET" });
    if(!res.ok){
      const data = await res.json().catch(()=>({}));
      setMsg(data.detail || "Failed to download CSV");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "executions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-3">Reports</h1>
      {msg && <div className="text-red-600 mb-2">{msg}</div>}
      <div className="flex items-end gap-2 mb-4">
        <div>
          <label className="block text-sm">From (YYYY-MM-DD)</label>
          <input value={fromDate} onChange={e=>setFrom(e.target.value)} className="border p-2 rounded" placeholder="2025-08-01"/>
        </div>
        <div>
          <label className="block text-sm">To (YYYY-MM-DD)</label>
          <input value={toDate} onChange={e=>setTo(e.target.value)} className="border p-2 rounded" placeholder="2025-08-24"/>
        </div>
        <button onClick={downloadCsv} className="px-3 py-2 rounded bg-blue-600 text-white">Download CSV</button>
      </div>
      <p className="text-sm text-gray-600">CSV will include executions in the selected range.</p>
    </div>
  );
}
