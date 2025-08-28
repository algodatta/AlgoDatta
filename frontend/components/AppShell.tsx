
"use client";

import { useEffect, useState } from "react";

import { usePathname } from "next/navigation";

import Nav from "@/components/Nav";



export default function AppShell({ children }: { children: React.ReactNode }) {

  const pathname = usePathname();

  const hideNav = pathname === "/login" || pathname?.startsWith("/reset") || pathname === "/signup";

  const [authed, setAuthed] = useState(false);

  useEffect(() => {

    setAuthed(document.cookie.includes("ad_at="));

  }, [pathname]);



  return (

    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">

      {!hideNav && <Nav />}

      {!hideNav && authed && (

        <div className="fixed top-3 right-3">

          <a href="/logout" className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm shadow hover:bg-slate-50">Sign out</a>

        </div>

      )}

      {children}

    </div>

  );

}

