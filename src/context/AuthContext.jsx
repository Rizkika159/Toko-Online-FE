import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [isAuthenticated, setIsAuthenticated] = useState(!!token)

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
      setIsAuthenticated(true)
    } else {
      localStorage.removeItem('token')
      setIsAuthenticated(false)
    }
  }, [token])

  const login = (newToken) => setToken(newToken)

  const logout = () => {
    setToken(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
