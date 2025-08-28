
"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";



const items = [

  { href: "/dashboard", label: "Dashboard" },

  { href: "/executions", label: "Executions" },

  { href: "/orders", label: "Orders" },

  { href: "/strategies", label: "Strategies" },

  { href: "/reports", label: "Reports" },

  { href: "/notifications", label: "Notifications" },

  { href: "/admin", label: "Admin" },

];



export default function Nav() {

  const pathname = usePathname();

  return (

    <nav className="w-full border-b">

      <div className="max-w-6xl mx-auto flex flex-wrap gap-3 p-3">

        {items.map((i) => {

          const active = pathname === i.href;

          return (

            <Link

              key={i.href}

              href={i.href}

              className={`px-3 py-1 rounded ${active ? "font-semibold underline" : "hover:underline"}`}

            >

              {i.label}

            </Link>

          );

        })}

      </div>

    </nav>

  );

}

