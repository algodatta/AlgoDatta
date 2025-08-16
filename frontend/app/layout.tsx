export const metadata = { title: "AlgoDatta" };

export default function RootLayout({children}:{children:React.ReactNode}){
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <div className="max-w-6xl mx-auto p-4">
          <header className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">AlgoDatta</h1>
            <nav className="space-x-3 text-sm">
              <a className="hover:underline" href="/">Home</a>
              <a className="hover:underline" href="/broker">Broker</a>
              <a className="hover:underline" href="/strategies">Strategies</a>
              <a className="hover:underline" href="/executions">Executions</a>
<<<<<<< HEAD
              <a className="hover:underline" href="/executions/live">Live</a>
=======
>>>>>>> 4d0fc9a2464fb0e7af8e4db8841f28a9cb0301df
              <a className="hover:underline" href="/reports">Reports</a>
              <a className="hover:underline" href="/admin">Admin</a>
            </nav>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 4d0fc9a2464fb0e7af8e4db8841f28a9cb0301df
