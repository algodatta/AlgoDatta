
"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";



export default function RequireAuth({ children }: { children: React.ReactNode }) {

  const router = useRouter();

  useEffect(() => {

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {

      const next = typeof window !== "undefined" ? window.location.pathname : "/dashboard";

      router.replace(`/login?next=${encodeURIComponent(next)}`);

    }

  }, [router]);

  return <>{children}</>;

}

