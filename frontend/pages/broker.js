import { useState } from 'react'
import { api, authHeaders } from '../lib/api';

export default function BrokerPage() {
  const [token, setToken] = useState('')
  const [status, setStatus] = useState(null)

  const linkBroker = async () => {
    try {
      const res = await api.post('/api/broker', { auth_token: token })
      setStatus('success')
    } catch (err) {
      setStatus('error')
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Link Dhan Broker</h1>
      <input
        placeholder="Enter Dhan auth token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        style={{ width: 400, padding: 8 }}
      />
      <button onClick={linkBroker} style={{ marginLeft: 10 }}>Link</button>
      {status === 'success' && <p style={{ color: 'green' }}>Broker linked!</p>}
      {status === 'error' && <p style={{ color: 'red' }}>Failed to link broker</p>}
    </div>
  )
}
