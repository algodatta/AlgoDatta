
"use client";

import Link from "next/link";



export default function Nav() {

  return (

    <header className="w-full border-b">

      <div className="mx-auto max-w-6xl flex items-center justify-between p-4">

        <Link href="/" className="font-semibold">AlgoDatta</Link>

        <nav className="flex items-center gap-4 text-sm">

          <Link href="/dashboard">Dashboard</Link>

          <Link href="/login">Login</Link>

        </nav>

      </div>

    </header>

  );

}

