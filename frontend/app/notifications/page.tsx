
"use client";

import RequireAuth from "@/components/RequireAuth";



export default function Page() {

  return (

    <RequireAuth>

      <main className="max-w-5xl mx-auto p-6">

        <h1 className="text-2xl font-bold mb-2">Coming soon</h1>

        <p>This section is being wired up.</p>

      </main>

    </RequireAuth>

  );

}

