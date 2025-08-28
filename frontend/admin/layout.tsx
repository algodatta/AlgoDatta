"use client";
import RequireAuth from '../components/RequireAuth';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RequireAuth roles={['admin']}>{children}</RequireAuth>;
}
