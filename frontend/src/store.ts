import { create } from 'zustand'

type User = { id: string; email: string; role: 'user' | 'admin' } | null

type State = {
  token: string | null
  user: User
  baseUrl: string
  setToken: (t: string | null) => void
  setUser: (u: User) => void
  setBaseUrl: (u: string) => void
}

export const useApp = create<State>((set) => ({
  token: localStorage.getItem('token'),
  user: null,
  baseUrl: import.meta.env.VITE_API_BASE || 'http://localhost:8000',
  setToken: (t) => { if (t) localStorage.setItem('token', t); else localStorage.removeItem('token'); set({ token: t }) },
  setUser: (u) => set({ user: u }),
  setBaseUrl: (u) => set({ baseUrl: u })
}))