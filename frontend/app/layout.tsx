
import './globals.css';

import Nav from '@/components/Nav';

import type { Metadata } from 'next';



export const metadata: Metadata = {

  title: 'AlgoDatta',

  description: 'Trading automation platform',

};



export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (

    <html lang="en">

      <body>

        <Nav />

        <main className="container">{children}</main>

      </body>

    </html>

  );

}

