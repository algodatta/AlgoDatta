"use client";

import React, { useEffect, useState } from "react";

type BrokerType = "dhanhq";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") || "https://api.algodatta.com";

function getToken(): string {
  // Try cookie first
  const m = typeof document !== "undefined"
    ? document.cookie.match(/(?:^|;\s*)algodatta_token=([^;]+)/)
    : null;
  if (m && m[1]) return decodeURIComponent(m[1]);

  // Fallback to localStorage
  if (typeof window !== "undefined") {
    const ls = window.localStorage.getItem("algodatta_token");
    if (ls) return ls;
  }
  return "";
}

async function fetchMe(token: string) {
  const r = await fetch(`${API_BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`Auth check failed: ${r.status}`);
  return r.json() as Promise<{ email?: string; role?: string }>;
}

export default function BrokerConnect() {
  const [token, setToken] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const [brokerType, setBrokerType] = useState<BrokerType>("dhanhq");
  const [clientId, setClientId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "info"|"success"|"error"; text: string }|null>(null);

  useEffect(() => {
    const t = getToken();
    setToken(t);
    if (!t) {
      setMsg({ type: "error", text: "You are not logged in. Please log in first." });
      return;
    }
    fetchMe(t).then((me) => {
      setRole(me.role || "");
      setEmail(me.email || "");
    }).catch(() => {
      setMsg({ type: "error", text: "Unable to verify session. Please login again." });
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const t = token || getToken();
    if (!t) {
      setMsg({ type: "error", text: "Missing auth token. Login again." });
      return;
    }
    if (!clientId || !accessToken) {
      setMsg({ type: "error", text: "Please fill Client ID and Access Token." });
      return;
    }
    setBusy(true);
    try {
      // NB: backend requires admin role (per OpenAPI)
      const resp = await fetch(`${API_BASE}/api/admin/brokers/upsert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${t}`,
        },
        body: JSON.stringify({
          // backend schema: BrokerUpsert { user_id, type="dhanhq", client_id, access_token }
          // user_id is taken from the token server-side; if your backend needs it explicitly, add it.
          type: brokerType,
          client_id: clientId.trim(),
          access_token: accessToken.trim(),
        }),
      });

      if (resp.ok) {
        setMsg({ type: "success", text: "Broker connected/updated successfully." });
      } else if (resp.status === 401 || resp.status === 403) {
        setMsg({ type: "error", text: "Unauthorized. Admin role required or session expired." });
      } else {
        const text = await resp.text();
        setMsg({ type: "error", text: `Failed: ${resp.status} ${text}` });
      }
    } catch (err: any) {
      setMsg({ type: "error", text: String(err?.message || err) });
    } finally {
      setBusy(false);
    }
  }

  const disabled = !token || (role && role !== "admin");

  return (
    <div style={{
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: 16,
      background: "#fff",
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      maxWidth: 640
    }}>
      <h2 style={{ margin: "0 0 12px", fontSize: 20, fontWeight: 700 }}>
        Broker Integration
      </h2>

      <p style={{ margin: "0 0 16px", color: "#4b5563" }}>
        Connect your trading broker to enable live order routing.
      </p>

      {email && (
        <p style={{ margin: "0 0 12px", fontSize: 14, color: "#6b7280" }}>
          Signed in as <strong>{email}</strong> {role ? `(role: ${role})` : ""}
        </p>
      )}

      {msg && (
        <div
          role="status"
          style={{
            marginBottom: 12,
            padding: "10px 12px",
            borderRadius: 8,
            background:
              msg.type === "success" ? "#ecfdf5" :
              msg.type === "error" ? "#fef2f2" : "#eff6ff",
            color:
              msg.type === "success" ? "#065f46" :
              msg.type === "error" ? "#991b1b" : "#1e40af",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          {msg.text}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 8 }}>
          <span style={{ fontWeight: 600 }}>Broker</span>
          <select
            value={brokerType}
            onChange={(e) => setBrokerType(e.target.value as BrokerType)}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              fontSize: 14,
            }}
          >
            <option value="dhanhq">Dhan</option>
          </select>
        </label>

        <label style={{ display: "grid", gap: 8 }}>
          <span style={{ fontWeight: 600 }}>Client ID</span>
          <input
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="Your Dhan Client ID"
            autoComplete="off"
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              fontSize: 14,
            }}
          />
        </label>

        <label style={{ display: "grid", gap: 8 }}>
          <span style={{ fontWeight: 600 }}>Access Token</span>
          <input
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="Broker Access Token"
            autoComplete="off"
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              fontSize: 14,
            }}
          />
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="submit"
            disabled={busy || disabled}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #111827",
              background: disabled ? "#e5e7eb" : "#111827",
              color: disabled ? "#6b7280" : "#fff",
              fontWeight: 600,
              cursor: disabled ? "not-allowed" : "pointer"
            }}
            title={disabled ? "Login as admin to connect broker" : "Connect Broker"}
          >
            {busy ? "Saving..." : "Connect / Update"}
          </button>
        </div>

        <p style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
          Note: This action requires an <strong>admin</strong> session and calls
          <code> /api/admin/brokers/upsert</code>.
        </p>
      </form>
    </div>
  );
}
