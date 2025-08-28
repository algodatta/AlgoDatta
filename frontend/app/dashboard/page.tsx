
export const dynamic = "force-dynamic";

export const revalidate = 0;



const features = [

  { href: "/executions", label: "Executions" },

  { href: "/orders", label: "Orders" },

  { href: "/strategies", label: "Strategies" },

  { href: "/reports", label: "Reports" },

  { href: "/notifications", label: "Notifications" },

  { href: "/admin", label: "Admin" },

];



export default function Page() {

  return (

    <main className="max-w-5xl mx-auto p-6">

      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

        {features.map((f) => (

          <li key={f.href}>

            <a href={f.href} className="block border rounded p-4 hover:bg-gray-50">

              {f.label}

            </a>

          </li>

        ))}

      </ul>

    </main>

  );

}

