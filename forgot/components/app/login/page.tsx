import React, { Suspense } from "react";
import LoginClient from "./signin-client";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ margin: "0 0 16px", fontSize: 28, fontWeight: 800 }}>Login</h1>
      <Suspense fallback={<div>Loading…</div>}>
        <LoginClient />
      </Suspense>
    </main>
  );
}
