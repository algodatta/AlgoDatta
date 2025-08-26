import "./globals.css";
import type { Metadata } from "next";
import Nav from "../components/Nav";

export const metadata: Metadata = {
  title: "AlgoDatta",
  description: "Algo trading control panel",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: "#f9fafb", color: "#111827" }}>
        <Nav />
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {children}
        </div>
      </body>
    </html>
  );
}
