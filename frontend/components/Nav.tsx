"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getToken, clearToken } from "../lib/api";

export default function Nav(){
  const [authed, setAuthed] = useState(false);
  useEffect(()=>{ setAuthed(!!getToken()); }, []);
  const logout = ()=>{ clearToken(); location.href = "/login"; };

  return (
    <nav className="w-full border-b bg-white">
      <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex gap-4">
          <Link href="/" className="font-semibold">AlgoDatta</Link>
          <Link href="/strategies" className="text-sm">Strategies</Link>
          <Link href="/executions" className="text-sm">Executions</Link>
          <Link href="/executions/live" className="text-sm">Live</Link>
          <Link href="/reports" className="text-sm">Reports</Link>
        </div>
        <div className="flex items-center gap-3">
          {authed ? (
            <button onClick={logout} className="text-sm text-red-600 hover:underline">Logout</button>
          ) : (
            <Link href="/login" className="text-sm hover:underline">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
