
import '../globals.css';



export default function SiteLayout({ children }: { children: React.ReactNode }) {

  return (

    <div className="min-h-dvh bg-slate-50">

      <main className="p-4">{children}</main>

    </div>

  );

}

