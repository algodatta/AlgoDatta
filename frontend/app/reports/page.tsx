"use client";
import { apiBase, authHeaders } from "../lib/api";

export default function Reports(){
  const download = ()=>{
    const url = `${apiBase()}/api/reports/csv`;
    fetch(url,{ headers: authHeaders() as HeadersInit })
      .then(r=>r.blob())
      .then(b=>{
        const a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = 'executions.csv';
        a.click();
      });
  };
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium">Reports</h2>
      <button onClick={download} className="px-3 py-2 bg-black text-white rounded">Download CSV</button>
    </div>
  );
}
