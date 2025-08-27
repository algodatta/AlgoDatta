import React from "react";
import BrokerConnect from "@/components/BrokerConnect";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ margin: "0 0 16px", fontSize: 28, fontWeight: 800 }}>Dashboard</h1>

      <div style={{ display: "grid", gap: 16 }}>
        {/* Existing dashboard cards can sit in a grid; broker connect goes near the top */}
        <BrokerConnect />

        {/* TODO: Keep or re-add your other tiles: Strategies, Executions, Orders, Reports, Admin... */}
      </div>
    </main>
  );
}
