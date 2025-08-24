import "./globals.css";
import Nav from "../components/Nav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AlgoDatta",
  description: "AlgoDatta Trading UI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <Nav />
        <main className="max-w-5xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
