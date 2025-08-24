
"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

export default function DashboardPage(){
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState("");
  useEffect(()=>{
    (async ()=>{
      const res = await apiFetch("/api/dashboards/overview");
      const j = await res.json().catch(()=>({}));
      if(res.ok) setData(j); else setErr(j.detail || "Failed to load overview");
    })();
  }, []);
  return (
    <div>
      <h1 className="text-xl font-semibold mb-3">Dashboard</h1>
      {err && <div className="text-red-600">{err}</div>}
      <pre className="border rounded p-3 bg-gray-50 overflow-auto text-sm">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
