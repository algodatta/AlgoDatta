
import { Suspense } from "react";

import ResetConfirmClient from "./ResetConfirmClient";

export const dynamic = "force-dynamic";

export const revalidate = 0;

export default function Page(){

  return <Suspense fallback={<main className="min-h-screen grid place-items-center">Loading…</main>}><ResetConfirmClient /></Suspense>;

}

