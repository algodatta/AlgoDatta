import { Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { api } from '../api'
import ThemeToggle from './ThemeToggle'
import { useApp } from '../store'

export default function Nav(){
  const { user, setToken, setUser } = useApp()
  useEffect(()=>{ if(!user && localStorage.getItem('token')){ api().get('/auth/me').then(r=>setUser(r.data)).catch(()=>{}) } },[])
  const loc = useLocation()
  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/" className="font-semibold">AlgoDatta</Link>
        {user && (
          <nav className="flex gap-3 text-sm">
            <Link to="/strategies" className={loc.pathname.startsWith('/strategies')?'font-semibold':''}>Strategies</Link>
            <Link to="/orders" className={loc.pathname.startsWith('/orders')?'font-semibold':''}>Executions</Link>
            <Link to="/positions" className={loc.pathname.startsWith('/positions')?'font-semibold':''}>Positions</Link>
            <Link to="/reports" className={loc.pathname.startsWith('/reports')?'font-semibold':''}>Reports</Link>
            {user?.role === 'admin' && <Link to="/admin" className={loc.pathname.startsWith('/admin')?'font-semibold':''}>Admin</Link>}
          </nav>
        )}
        <div className="ml-auto text-sm flex items-center gap-3">
          {user ? (<>
            <span className="text-gray-500">{user.email} ({user.role})</span>
            <button className="px-2 py-1 border rounded" onClick={()=>{ setToken(null); setUser(null); }}>Logout</button>
          </>) : (<Link to="/login" className="px-2 py-1 border rounded">Login</Link>)}
        <ThemeToggle />
        </div>
      </div>
    </header>
  )
}