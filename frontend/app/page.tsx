"use client";
import { useEffect } from "react";
import { getToken } from "../lib/api";
import { useRouter } from "next/navigation";

export default function Home(){
  const router = useRouter();
  useEffect(()=>{
    if (getToken()) router.replace("/strategies");
    else router.replace("/login");
  }, [router]);
  return null;
}
