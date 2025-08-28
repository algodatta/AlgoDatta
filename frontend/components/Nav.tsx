"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/executions", label: "Executions" },
  { href: "/orders", label: "Orders" },
  { href: "/strategies", label: "Strategies" },
  { href: "/reports", label: "Reports" },
  { href: "/notifications", label: "Notifications" },
  { href: "/admin", label: "Admin" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
      {items.map((it) => {
        const active = pathname?.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            style={{
              padding:"8px 10px",
              borderRadius:8,
              border:"1px solid rgba(255,255,255,.12)",
              background: active ? "rgba(79,140,255,.2)" : "transparent",
              color:"#dbe7ff",
              textDecoration:"none",
              fontSize:13,
              fontWeight:600
            }}
          >
            {it.label}
          </Link>
        );
      })}
      <span style={{flex:1}} />
      <Link href="/logout" style={{color:"#ffb8b8",fontSize:13,fontWeight:700}}>Logout</Link>
    </nav>
  );
}
