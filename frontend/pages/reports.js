import { useEffect, useState } from 'react'
import axios from 'axios'

export default function ReportsPage() {
  const [executions, setExecutions] = useState([])

  useEffect(() => {
    axios.get('/api/executions').then(res => setExecutions(res.data))
  }, [])

  const downloadCSV = () => {
    const a = document.createElement('a')
    a.href = '/api/reports/csv'
    a.download = 'executions.csv'
    a.click()
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Execution Reports</h1>
      <button onClick={downloadCSV}>Download CSV</button>
      <table border="1" cellPadding="8" style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>Time</th>
            <th>Type</th>
            <th>Status</th>
            <th>Response</th>
          </tr>
        </thead>
        <tbody>
          {executions.map((e, i) => (
            <tr key={i}>
              <td>{e.executed_at}</td>
              <td>{e.type}</td>
              <td>{e.status}</td>
              <td>{JSON.stringify(e.response)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
