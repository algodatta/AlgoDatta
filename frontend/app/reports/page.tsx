'use client'
export default function ReportsPage() {
  const exportCsv = () => {
    const token = localStorage.getItem('token')!
    const url = `${process.env.NEXT_PUBLIC_API_BASE}/api/reports/export?from=2025-01-01&to=2025-12-31`
    fetch(url, { headers: { Authorization: `Bearer ${token}` }}).then(async r=>{
      const blob = await r.blob(); const a=document.createElement('a')
      a.href = URL.createObjectURL(blob); a.download = 'reports.csv'; a.click()
    })
  }
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Reports</h1>
      <button onClick={exportCsv} className="px-3 py-2 rounded-lg bg-white text-black font-semibold">Export CSV</button>
    </div>
  )
}
