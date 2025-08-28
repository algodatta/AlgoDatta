
import Link from "next/link";



export default function Nav() {

  return (

    <header className="border-b">

      <nav className="max-w-5xl mx-auto flex gap-4 p-3">

        <Link href="/dashboard" className="font-semibold">Dashboard</Link>

        <Link href="/executions">Executions</Link>

        <Link href="/orders">Orders</Link>

        <Link href="/strategies">Strategies</Link>

        <Link href="/reports">Reports</Link>

        <Link href="/notifications">Notifications</Link>

        <Link href="/admin">Admin</Link>

      </nav>

    </header>

  );

}

