import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_BASE || '';

export const api = axios.create({
  baseURL: baseURL || '',
});

export function authHeaders() {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}