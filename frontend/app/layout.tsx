import './globals.css'
import Link from 'next/link'
export const metadata = { title: 'AlgoDatta', description: 'Auto Trading Platform' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body className="min-h-screen antialiased">
    <div className="flex">
      <aside className="w-64 hidden md:block bg-neutral-900/60 border-r border-neutral-800 min-h-screen p-4">
        <div className="text-xl font-semibold mb-6">AlgoDatta</div>
        <nav className="space-y-2 text-sm">
          <NavItem href="/">Home</NavItem>
          <NavItem href="/broker">Broker</NavItem>
          <NavItem href="/strategies">Strategies</NavItem>
          <NavItem href="/executions">Executions</NavItem>
          <NavItem href="/reports">Reports</NavItem>
          <NavItem href="/admin">Admin</NavItem>
        </nav>
      </aside>
      <main className="flex-1 p-4">{children}</main>
    </div>
  </body></html>)
}
function NavItem({ href, children }: { href: string, children: React.ReactNode }) {
  return (<Link className="block rounded-xl px-3 py-2 hover:bg-neutral-800/60" href={href}>{children}</Link>)
}
