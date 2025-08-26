import Link from 'next/link';

export default function Home() {
  return (
    <div className="section" style={{padding:0}}>
      <h1 style={{fontSize:22,fontWeight:600,margin:'16px 0'}}>Dashboard</h1>
      <p style={{color:'#4b5563',margin:'8px 0 16px'}}>You are logged in. Use the navigation to continue.</p>

      <div className="card" style={{marginTop:12}}>
        <div className="card-header">
          <div>
            <h2 className="card-title">Broker Integration</h2>
            <p className="card-subtle">Connect your broker to place live orders.</p>
          </div>
          <div className="card-actions">
            <Link href="/broker" className="btn">Open</Link>
          </div>
        </div>
        <div className="card-body">
          <p style={{margin:0,color:'#6b7280'}}>
            Configure <b>Client ID</b> and <b>Access Token</b> on the Broker page.
          </p>
        </div>
      </div>
    </div>
  );
}
