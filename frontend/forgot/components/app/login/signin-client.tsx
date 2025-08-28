"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") || "https://api.algodatta.com";

export default function LoginClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState("admin@algodatta.com");
  const [password, setPassword] = useState("Admin@123");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{type:"error"|"info"|"success";text:string}|null>(null);

  useEffect(() => {
    const token = (typeof document !== "undefined")
      ? (document.cookie.match(/(?:^|;\s*)algodatta_token=([^;]+)/)?.[1] || localStorage.getItem("algodatta_token"))
      : null;
    if (token) {
      setMsg({ type: "info", text: "You are already logged in." });
    }
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      const r = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!r.ok) {
        const t = await r.text();
        throw new Error(`Login failed: ${r.status} ${t}`);
      }
      const data = await r.json();
      const token = data?.access_token || "";

      if (!token) throw new Error("No token in response");

      // Persist session (cookie + localStorage)
      document.cookie = `algodatta_token=${encodeURIComponent(token)}; Max-Age=${60*60*8}; Path=/; Secure; SameSite=Lax`;
      localStorage.setItem("algodatta_token", token);

      setMsg({ type: "success", text: "Login successful. Redirecting…" });

      // Respect ?next=/path, else go dashboard
      const next = searchParams.get("next") || "/";
      setTimeout(() => router.push(next), 200);
    } catch (err: any) {
      setMsg({ type: "error", text: err?.message || "Login error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{
      display: "grid", gap: 12, maxWidth: 420,
      background: "#fff", padding: 16, borderRadius: 12,
      border: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,.05)"
    }}>
      {msg && (
        <div style={{
          padding: "8px 10px", borderRadius: 8,
          background: msg.type === "error" ? "#fef2f2" : msg.type === "success" ? "#ecfdf5" : "#eff6ff",
          color: msg.type === "error" ? "#991b1b" : msg.type === "success" ? "#065f46" : "#1e40af",
          border: "1px solid rgba(0,0,0,.06)"
        }}>
          {msg.text}
        </div>
      )}

      <label style={{ display: "grid", gap: 8 }}>
        <span style={{ fontWeight: 600 }}>Email</span>
        <input
          type="email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          placeholder="you@example.com"
          style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e7eb" }}
        />
      </label>

      <label style={{ display: "grid", gap: 8 }}>
        <span style={{ fontWeight: 600 }}>Password</span>
        <input
          type="password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          placeholder="••••••••"
          style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e7eb" }}
        />
      </label>

      <button
        type="submit"
        disabled={busy}
        style={{
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid #111827",
          background: "#111827",
          color: "#fff",
          fontWeight: 700,
          cursor: busy ? "wait" : "pointer"
        }}
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
