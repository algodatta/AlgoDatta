
"use client";

import Link from "next/link";

import RequireAuth from "@/components/RequireAuth";



const features = [

  { href: "/executions", label: "Executions" },

  { href: "/orders", label: "Orders" },

  { href: "/strategies", label: "Strategies" },

  { href: "/reports", label: "Reports" },

  { href: "/notifications", label: "Notifications" },

  { href: "/admin", label: "Admin" },

];



export default function Page() {

  return (

    <RequireAuth>

      <main className="max-w-6xl mx-auto p-6">

        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {features.map((f) => (

            <Link

              key={f.href}

              href={f.href}

              className="block border rounded-xl p-4 hover:shadow"

            >

              <div className="text-lg">{f.label}</div>

              <div className="text-sm text-gray-500">Go to {f.label}</div>

            </Link>

          ))}

        </div>

      </main>

    </RequireAuth>

  );

}

