
"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

export const revalidate = 0;



export default function Page(){

  const router = useRouter();

  useEffect(()=>{

    try{

      localStorage.removeItem("token");

    }catch{}

    // expire cookie

    document.cookie = "ad_at=; Path=/; Max-Age=0; SameSite=Lax; Secure";

    router.replace("/login");

  },[router]);

  return <main className="min-h-screen grid place-items-center">Signing you out…</main>;

}

