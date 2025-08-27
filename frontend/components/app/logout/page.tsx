"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      // Clear cookie
      document.cookie = "algodatta_token=; Max-Age=0; Path=/; Secure; SameSite=Lax";
      // Clear localStorage
      localStorage.removeItem("algodatta_token");
    } catch {}
    const back = "/";
    const t = setTimeout(() => router.replace(back), 150);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <main style={{ padding: 24 }}>
      <h1>Logging out…</h1>
    </main>
  );
}
