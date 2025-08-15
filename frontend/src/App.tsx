import { Routes, Route, Navigate } from 'react-router-dom'
import Nav from './components/Nav'
import { Protected } from './components/Protect'
import Login from './pages/Login'
import Strategies from './pages/Strategies'
import Orders from './pages/Orders'
import Positions from './pages/Positions'
import Reports from './pages/Reports'
import Admin from './pages/Admin'
import { AdminProtected } from './components/AdminProtect'

export default function App(){
  return (
    <div>
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/strategies" replace />} />
          <Route path="/login" element={<Login />} />
          <Route element={<Protected />}>
            <Route path="/strategies" element={<Strategies />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/positions" element={<Positions />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
          <Route element={<AdminProtected />}>
            <Route path="/strategies" element={<Strategies />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/positions" element={<Positions />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Routes>
      </main>
    </div>
  )
}