import React from "react";

export const metadata = { title: "AlgoDatta" };

export default function RootLayout({children}:{children:React.ReactNode}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <div className="max-w-6xl mx-auto p-4">
          <header className="mb-6">
            <h1 className="text-2xl font-semibold">AlgoDatta</h1>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
