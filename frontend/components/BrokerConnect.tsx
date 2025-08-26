'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Status = 'idle'|'ok'|'err'|'busy';

export default function BrokerConnect() {
  const [clientId, setClientId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string>('');
  const [linked, setLinked] = useState<boolean | null>(null);
  const [linkedType, setLinkedType] = useState<string | null>(null);
  const router = useRouter();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || '';

  // Redirect to /login if no token and also fetch current status if token exists
  useEffect(() => {
    const tk = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!tk) { router.replace('/login?next=/broker'); return; }
    (async () => {
      try {
        const res = await fetch(`${apiBase}/api/broker`, { headers: { Authorization: `Bearer ${tk}` } });
        if (res.ok) {
          const data = await res.json();
          setLinked(!!data.linked);
          setLinkedType(data.type || null);
        }
      } catch {}
    })();
  }, [apiBase, router]);

  async function integrate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setStatus('busy'); setMessage('');
    try {
      const tk = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!tk) throw new Error('Not authenticated');
      if (!clientId || !accessToken) throw new Error('Both Client ID and Access Token are required');

      const res = await fetch(`${apiBase}/api/broker`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tk}` },
        body: JSON.stringify({ type: 'dhanhq', client_id: clientId, access_token: accessToken }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `HTTP ${res.status}`);
      }
      setStatus('ok');
      setMessage('Broker integrated successfully');
      setLinked(true);
      setLinkedType('dhanhq');
    } catch (e:any) {
      setStatus('err');
      setMessage(e?.message || 'Integration failed');
    }
  }

  const badgeClass = linked ? 'badge ok' : (status==='err' ? 'badge err' : 'badge idle');
  const badgeText = linked ? `Connected${linkedType ? ` • ${linkedType}` : ''}` : (status==='err' ? 'Error' : 'Not connected');

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Broker Integration</h2>
          <p className="card-subtle">Link your broker (DhanHQ) to enable live trading.</p>
        </div>
        <span className={badgeClass} aria-live="polite">{badgeText}</span>
      </div>

      <form className="card-body" onSubmit={integrate}>
        <div className="grid-2">
          <div>
            <label className="label" htmlFor="client_id">Client ID</label>
            <input id="client_id" className="input" placeholder="e.g., 10012345"
              value={clientId} onChange={e=>setClientId(e.target.value)} autoComplete="off" />
            <div className="help">Your Dhan client identifier.</div>
          </div>

          <div>
            <label className="label" htmlFor="access_token">Access Token</label>
            <div className="row" style={{gap:8}}>
              <input id="access_token" className="input" style={{flex:1}}
                type={showToken ? 'text' : 'password'}
                placeholder="Paste token from Dhan"
                value={accessToken} onChange={e=>setAccessToken(e.target.value)} />
              <button type="button" className="btn secondary"
                onClick={()=>setShowToken(v=>!v)} aria-label="Toggle token visibility">
                {showToken ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="help">We send this securely to the API; it is not stored in the browser.</div>
          </div>
        </div>

        <div className="section" style={{display:'flex',gap:8}}>
          <button type="submit" className="btn" disabled={status==='busy'}>
            {status==='busy' ? 'Integrating…' : (linked ? 'Re-integrate' : 'Integrate')}
          </button>
          <a className="btn secondary" href="https://dhan.co/" target="_blank" rel="noreferrer">Get Dhan Token</a>
        </div>

        {message && (
          <p className={status==='ok' ? 'success' : 'error'} style={{margin:'8px 0 0'}} role="status">{message}</p>
        )}
      </form>
    </div>
  );
}
