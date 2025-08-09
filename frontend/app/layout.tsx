import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'AlgoDatta',
  description: 'Automated Trading Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-white shadow p-4 flex gap-6 text-blue-600 font-semibold">
          <Link className="hover:underline" href="/">Home</Link>
          <Link className="hover:underline" href="/broker">Broker</Link>
          <Link className="hover:underline" href="/strategies">Strategies</Link>
          <Link className="hover:underline" href="/reports">Reports</Link>
        </nav>
        <div className="p-6 max-w-7xl mx-auto">{children}</div>
      </body>
    </html>
  );
}
