import { useEffect, useState } from 'react'
import axios from 'axios'

export default function StrategiesPage() {
  const [strategies, setStrategies] = useState([])
  const [name, setName] = useState('')
  const [script, setScript] = useState('')
  const [paper, setPaper] = useState(true)

  const fetchStrategies = async () => {
    const res = await axios.get('/api/strategies')
    setStrategies(res.data)
  }

  useEffect(() => {
    fetchStrategies()
  }, [])

  const deploy = async () => {
    await axios.post('/api/strategies', {
      name,
      script,
      paper_trading: paper,
      broker_id: 'mock-id'
    })
    setName('')
    setScript('')
    fetchStrategies()
  }

  const remove = async (id) => {
    await axios.delete(`/api/strategies/${id}`)
    fetchStrategies()
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Strategy Manager</h1>
      <input
        placeholder="Strategy name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ display: 'block', marginBottom: 10, width: 400 }}
      />
      <textarea
        placeholder="Pine script"
        value={script}
        onChange={(e) => setScript(e.target.value)}
        style={{ display: 'block', marginBottom: 10, width: 600, height: 100 }}
      />
      <label>
        <input type="checkbox" checked={paper} onChange={(e) => setPaper(e.target.checked)} />
        Paper trading
      </label>
      <br />
      <button onClick={deploy}>Deploy</button>

      <h2>Deployed Strategies</h2>
      <ul>
        {strategies.map(s => (
          <li key={s.id}>
            <strong>{s.name}</strong> - {s.status} - Webhook: <code>{s.webhook_path}</code>
            <button onClick={() => remove(s.id)} style={{ marginLeft: 10 }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
