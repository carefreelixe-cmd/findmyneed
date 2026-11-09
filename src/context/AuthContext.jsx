import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('findmyneed_user') || 'null'))
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const token = localStorage.getItem('findmyneed_token')
    if (!token) return setLoading(false)
    api.get('/auth/me').then(({ data }) => save(data.user, token)).catch(logout).finally(() => setLoading(false))
  }, [])
  function save(nextUser, token) { localStorage.setItem('findmyneed_token', token); localStorage.setItem('findmyneed_user', JSON.stringify(nextUser)); setUser(nextUser) }
  async function login(values) { const { data } = await api.post('/auth/login', values); save(data.user, data.token); return data.user }
  async function register(values) { const { data } = await api.post('/auth/register', values); save(data.user, data.token); return data.user }
  function logout() { localStorage.removeItem('findmyneed_token'); localStorage.removeItem('findmyneed_user'); setUser(null) }
  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext)
