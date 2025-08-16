"use client";
import { useEffect, useRef, useState } from "react";
import { apiBase, getToken, authHeaders } from "@/lib/api";

type ExecEvt = { id?:string; strategy_id?:string; symbol?:string; side?:string; price?:number; ts?:string; msg?:string };

export default function LiveExecutions(){
  const [events, setEvents] = useState<ExecEvt[]>([]);
  const [status, setStatus] = useState("connecting...");
  const sinceRef = useRef<string>("");

  useEffect(()=>{
    const token = getToken();
    const url = `${apiBase()}/api/executions/stream${token ? `?token=${encodeURIComponent(token)}` : ""}`;
    let es: EventSource | null = null;
    let closed = false;

    try {
      es = new EventSource(url);
      es.onopen = ()=> setStatus("connected");
      es.onerror = ()=> {
        setStatus("sse failed; falling back to polling");
        if (es) es.close();
        es = null;
        startPolling();
      };
      es.onmessage = (ev)=>{
        try {
          const data = JSON.parse(ev.data);
          setEvents(prev => [data, ...prev].slice(0,500));
          if (data.ts) sinceRef.current = data.ts;
        } catch(e){ /* ignore */ }
      };
    } catch(e){
      setStatus("sse not available; polling");
      startPolling();
    }

    function startPolling(){
      const iv = setInterval(async ()=>{
        try {
          const qs = sinceRef.current ? `?since=${encodeURIComponent(sinceRef.current)}` : "";
          const res = await fetch(`${apiBase()}/api/executions${qs}`, { headers: authHeaders() as HeadersInit });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length) {
              setEvents(prev => [...data.reverse(), ...prev].slice(0,500));
              const last = data[0];
              if (last?.ts) sinceRef.current = last.ts;
            }
          }
        } catch(_e) {}
      }, 5000);
      return ()=> clearInterval(iv);
    }

    return ()=>{ closed = true; if (es) es.close(); };
  },[]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Live Executions</h2>
        <div className="text-sm text-gray-600">{status}</div>
      </div>
      <div className="border rounded bg-white max-h-[60vh] overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="p-2 text-left">Time</th>
              <th className="p-2">Symbol</th>
              <th className="p-2">Side</th>
              <th className="p-2">Price</th>
              <th className="p-2">Strategy</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e,i)=> (
              <tr key={(e.id||i.toString())+i} className="border-t">
                <td className="p-2">{e.ts ? new Date(e.ts).toLocaleTimeString() : "-"}</td>
                <td className="p-2">{e.symbol || "-"}</td>
                <td className="p-2">{e.side || "-"}</td>
                <td className="p-2">{e.price ?? "-"}</td>
                <td className="p-2 text-xs">{e.strategy_id ? e.strategy_id.slice(0,8) : "-"}</td>
              </tr>
            ))}
            {events.length===0 && <tr><td colSpan={5} className="p-3 text-center text-gray-500">Waiting for events…</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}