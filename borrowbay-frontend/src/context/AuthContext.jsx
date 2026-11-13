import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axiosConfig'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser  = localStorage.getItem('user')

    if (savedToken && savedUser) {
      setToken(savedToken)
      const parsedUser = JSON.parse(savedUser)
      setUser(parsedUser)
      refreshUser(parsedUser.email, savedToken)
    } else {
      setLoading(false)
    }
  }, [])

  const refreshUser = async (email, jwt) => {
    try {
      const res = await api.get(`/users/email/${email}`, {
        headers: { Authorization: `Bearer ${jwt}` }
      })
      const freshUser = res.data
      setUser(freshUser)
      localStorage.setItem('user', JSON.stringify(freshUser))
    } catch (err) {
      console.error('Failed to refresh user:', err)
    } finally {
      setLoading(false)
    }
  }

  const login = async (userData, jwtToken) => {
    setToken(jwtToken)
    localStorage.setItem('token', jwtToken)

    try {
      const res = await api.get(`/users/email/${userData.email}`, {
        headers: { Authorization: `Bearer ${jwtToken}` }
      })
      const fullUser = res.data
      setUser(fullUser)
      localStorage.setItem('user', JSON.stringify(fullUser))
    } catch (err) {
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  const isLoggedIn = !!token
  const isAdmin    = user?.isAdmin === true
  const isSeller   = user?.role === 'ROLE_SELLER'
  const isCustomer = user?.role === 'ROLE_CUSTOMER'

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, logout, refreshUser,
      isLoggedIn, isAdmin, isSeller, isCustomer
    }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}