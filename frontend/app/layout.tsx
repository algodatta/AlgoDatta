import SiteFooter from '@/components/SiteFooter';
import SiteNavbar from '@/components/SiteNavbar';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50" className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100"> <SiteNavbar />
        <div className="min-h-[70vh]">{children}</div>
        <SiteFooter /> </body>
    </html>
  );
}
