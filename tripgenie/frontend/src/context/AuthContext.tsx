/**
 * TripGenie — Auth Context
 * Manages JWT token and user state globally across the app.
 */
import React, { createContext, useContext, useState, useCallback } from 'react'
import type { User } from '../types'

interface AuthContextValue {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('tripgenie_token')
  )
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('tripgenie_user')
    return stored ? (JSON.parse(stored) as User) : null
  })

  const login = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem('tripgenie_token', newToken)
    localStorage.setItem('tripgenie_user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('tripgenie_token')
    localStorage.removeItem('tripgenie_user')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
