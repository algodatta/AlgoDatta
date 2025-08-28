"use client";
import React from "react";
import RequireAuth from "../components/RequireAuth";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}