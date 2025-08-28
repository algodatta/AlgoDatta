
import { Suspense } from "react";

import LoginClient from "./LoginClient";



export const dynamic = "force-dynamic"; // avoid static export pitfalls



export default function Page() {

  return (

    <Suspense fallback={<main className="max-w-sm mx-auto p-6">Loading…</main>}>

      <LoginClient />

    </Suspense>

  );

}

