"use client";
import RequireAuth from "../components/RequireAuth";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
