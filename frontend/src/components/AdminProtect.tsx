import { Navigate, Outlet } from 'react-router-dom'
import { useApp } from '../store'

export function AdminProtected(){
  const { token, user } = useApp()
  if(!token) return <Navigate to="/login" replace />
  if(!user || user.role !== 'admin') return <Navigate to="/strategies" replace />
  return <Outlet />
}