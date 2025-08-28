
"use client";
import { useEffect, useState } from "react";
import { getToken } from "../../lib/api";

type ExecMsg = { ts?: number; msg?: string } & Record<string, any>;

export default function ExecStream(){
  const [lines, setLines] = useState<ExecMsg[]>([]);
  const [err, setErr] = useState("");

  useEffect(()=>{
    setErr("");
    const token = getToken();
    const url = `https://api.algodatta.com/api/executions/stream${token ? `?token=${encodeURIComponent(token)}` : ""}`;
    const es = new EventSource(url);
    es.onmessage = (ev) => {
      try{
        const data = JSON.parse(ev.data);
        setLines(prev => [data, ...prev].slice(0, 200));
      } catch { /* ignore */ }
    };
    es.onerror = () => setErr("Stream error (check network / auth)");
    return () => es.close();
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-3">Executions Stream</h1>
      {err && <div className="text-red-600 mb-2">{err}</div>}
      <div className="border rounded p-2 h-[420px] overflow-auto font-mono text-xs bg-gray-50">
        {lines.map((l, i)=>(
          <div key={i}>{JSON.stringify(l)}</div>
        ))}
        {lines.length===0 && <div className="text-gray-500">Waiting for events…</div>}
      </div>
    </div>
  );
}
