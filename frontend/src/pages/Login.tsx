import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useApp } from '../store'

export default function Login(){
  const nav = useNavigate()
  const [email, setEmail] = useState('admin@algodatta.com')
  const [password, setPassword] = useState('ChangeMe123!')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const setToken = useApp(s=>s.setToken)
  const setUser = useApp(s=>s.setUser)

  const submit = async (e:any)=>{
    e.preventDefault(); setError(null); setLoading(true)
    try{
      const r = await api().post('/auth/login', { email, password })
      setToken(r.data.access_token)
      const me = await api().get('/auth/me')
      setUser(me.data)
      nav('/strategies')
    }catch(err:any){ setError(err.response?.data?.detail || err.message) } finally{ setLoading(false) }
  }

  return (
    <div className="max-w-md mx-auto mt-16 bg-white border rounded p-6">
      <h1 className="text-xl font-semibold mb-4">Login</h1>
      <form className="grid gap-3" onSubmit={submit}>
        <label className="grid gap-1">
          <span>Email</span>
          <input className="border rounded px-3 py-2" value={email} onChange={e=>setEmail(e.target.value)} />
        </label>
        <label className="grid gap-1">
          <span>Password</span>
          <input type="password" className="border rounded px-3 py-2" value={password} onChange={e=>setPassword(e.target.value)} />
        </label>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button disabled={loading} className="bg-black text-white rounded px-4 py-2">{loading?'...':'Login'}</button>
      </form>
    </div>
  )
}