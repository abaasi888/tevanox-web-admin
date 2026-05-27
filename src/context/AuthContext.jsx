import React, { createContext, useState, useContext, useEffect } from 'react'
import { authApi } from '../api/auth'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      loadUser()
    } else {
      setLoading(false)
    }
  }, [])

  const loadUser = async () => {
    try {
      const response = await authApi.getMe()
      if (response.data.role === 'admin') {
        setUser(response.data)
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('refreshToken')
      }
    } catch (error) {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('refreshToken')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const response = await authApi.login(email, password)
    const { access_token, refresh_token, user } = response.data
    
    if (user.role !== 'admin') {
      throw new Error('Admin access required')
    }
    
    localStorage.setItem('adminToken', access_token)
    localStorage.setItem('refreshToken', refresh_token)
    setUser(user)
    setIsAuthenticated(true)
    return user
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}