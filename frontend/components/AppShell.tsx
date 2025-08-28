
"use client";



import { usePathname } from "next/navigation";

import type { PropsWithChildren } from "react";

import Nav from "@/components/Nav";



export default function AppShell({ children }: PropsWithChildren) {

  const pathname = usePathname();

  const hideNav = pathname === "/login";



  return (

    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">

      {!hideNav && <Nav />}

      {children}

    </div>

  );

}

