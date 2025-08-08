import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-white shadow p-4 flex gap-6 text-blue-600 font-semibold">
      <Link href="/" className="hover:underline">Home</Link>
      <Link href="/broker" className="hover:underline">Broker</Link>
      <Link href="/strategies" className="hover:underline">Strategies</Link>
      <Link href="/reports" className="hover:underline">Reports</Link>
    </nav>
  )
}
