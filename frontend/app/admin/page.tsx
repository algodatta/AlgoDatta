"use client";
import React, { useState } from "react";
import { apiBase, authHeaders } from "../../lib/api";

export default function AdminPage() {
  const [health, setHealth] = useState<string>("");

  const pingHealth = async () => {
    try {
      const r = await fetch(`${apiBase()}/api/admin/health`, { headers: authHeaders() });
      const j = await r.json().catch(() => ({}));
      setHealth(JSON.stringify(j));
    } catch (e: any) {
      setHealth(`error: ${e?.message || e}`);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium">Admin</h2>
      <div className="flex items-center gap-2">
        <button onClick={pingHealth} className="px-3 py-2 rounded bg-black text-white">
          Ping Health
        </button>
        <code className="text-sm break-all">{health}</code>
      </div>
    </div>
  );
}
