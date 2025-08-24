"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken, getToken } from "../lib/api";
import { useEffect, useState } from "react";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/strategies", label: "Strategies" },
  { href: "/executions", label: "Executions" },
  { href: "/orders", label: "Orders" },
  { href: "/reports", label: "Reports" },
  { href: "/admin", label: "Admin" },
];

export default function Nav(){
  const pathname = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(()=>{ setAuthed(!!getToken()); }, []);

  const logout = () => {
    clearToken();
    router.push("/login");
  };

  // Hide on login page
  if (pathname?.startsWith("/login")) return null;

  return (
    <header className="w-full border-b bg-white sticky top-0 z-40">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold">AlgoDatta</Link>
        <nav className="flex items-center gap-1 flex-wrap">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded text-sm ${pathname?.startsWith(l.href) ? "bg-blue-600 text-white" : "hover:bg-gray-100"}`}
            >
              {l.label}
            </Link>
          ))}
          {authed ? (
            <button onClick={logout} className="ml-2 px-3 py-1.5 rounded bg-gray-800 text-white text-sm">Logout</button>
          ) : (
            <Link href="/login" className="ml-2 px-3 py-1.5 rounded bg-blue-600 text-white text-sm">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
