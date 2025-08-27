<<<<<<< HEAD
import './globals.css';
import Nav from '@/components/Nav';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AlgoDatta',
  description: 'Trading automation platform',
};
=======

export const dynamic = 'force-dynamic';

export const revalidate = 0;

export const fetchCache = 'force-no-store';



import './globals.css';


>>>>>>> 70c56dd2decfcb9a464e980fc93d3b81cb1e9180

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (

    <html lang="en">
<<<<<<< HEAD
      <body>
        <Nav />
        <main className="container">{children}</main>
      </body>
=======

      <body>{children}</body>

>>>>>>> 70c56dd2decfcb9a464e980fc93d3b81cb1e9180
    </html>

  );

}

