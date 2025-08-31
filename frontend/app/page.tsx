
export default function Home() {
  return (
    <main style={{minHeight:"100svh", display:"grid", placeItems:"center", padding:24}}>
      <div style={{maxWidth: 640}}>
        <h1 style={{fontSize: 24, marginBottom: 8}}>AlgoDatta</h1>
        <p>Use <code>/login</code> to sign in. This build points at <code>{process.env.NEXT_PUBLIC_API_BASE}</code>.</p>
      </div>
    </main>
  );
}
