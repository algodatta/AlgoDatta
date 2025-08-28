"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function getToken() {
  if (typeof document !== "undefined") {
    const m = document.cookie.match(/(?:^|;\s*)algodatta_token=([^;]+)/);
    if (m && m[1]) return decodeURIComponent(m[1]);
    const ls = localStorage.getItem("algodatta_token");
    if (ls) return ls;
  }
  return "";
}

export default function Nav() {
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    setToken(getToken());
  }, []);

  const linkStyle: React.CSSProperties = {
    padding: "8px 12px",
    borderRadius: 8,
    fontWeight: 600,
    color: "#111827",
    border: "1px solid transparent",
    textDecoration: "none",
    display: "inline-block",
  };

  return (
    <nav style={{
      position: "sticky",
      top: 0,
      zIndex: 20,
      background: "#fff",
      borderBottom: "1px solid #e5e7eb",
      padding: "10px 16px",
    }}>
      <div style={{display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap"}}>
        <Link href="/" style={{ ...linkStyle, fontSize: 18 }}>AlgoDatta</Link>

        {token ? (
          <>
            <Link href="/" style={linkStyle}>Dashboard</Link>
            <Link href="/strategies" style={linkStyle}>Strategies</Link>
            <Link href="/executions" style={linkStyle}>Executions</Link>
            <Link href="/orders" style={linkStyle}>Orders</Link>
            <Link href="/reports" style={linkStyle}>Reports</Link>
            <Link href="/admin" style={linkStyle}>Admin</Link>
            <div style={{flex: 1}} />
            <Link
              href="/logout"
              style={{ ...linkStyle, borderColor: "#111827" }}
              title="Logout"
            >
              Logout
            </Link>
          </>
        ) : (
          <>
            <div style={{flex: 1}} />
            <Link href="/login" style={{ ...linkStyle, borderColor: "#111827" }}>Login</Link>
          </>
        )}
      </div>
    </nav>
  );
}
