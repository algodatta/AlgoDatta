"use client";
import { useEffect, useState } from "react";
import { apiBase, getToken } from "../../../lib/api";

export default function Live(){
  const [lines, setLines] = useState<string[]>([]);

  useEffect(()=>{
    const t = getToken();
    const url = new URL(`${apiBase()}/api/executions/stream`);
    if (t) url.searchParams.set("token", t);
    const es = new EventSource(url.toString(), { withCredentials: false });
    es.onmessage = (ev)=> setLines((cur)=> [ev.data, ...cur].slice(0,500));
    es.onerror = ()=> es.close();
    return ()=> es.close();
  }, []);

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">Live Stream</h1>
      <div className="bg-black text-green-400 text-xs p-3 rounded min-h-[300px] max-h-[480px] overflow-auto font-mono">
        {lines.map((l,i)=>(<div key={i}>{l}</div>))}
      </div>
    </div>
  );
}
