import { Navigate, Outlet } from 'react-router-dom'
import { useApp } from '../store'

export function Protected(){
  const { token } = useApp()
  if(!token) return <Navigate to="/login" replace />
  return <Outlet />
}