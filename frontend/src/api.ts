import axios from 'axios'
import { useApp } from './store'

export function api() {
  const { token, baseUrl } = useApp.getState()
  const inst = axios.create({ baseURL: baseUrl })
  inst.interceptors.request.use(conf => {
    if (token) conf.headers['Authorization'] = `Bearer ${token}`
    return conf
  })
  return inst
}