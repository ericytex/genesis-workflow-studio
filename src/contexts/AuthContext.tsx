
import React, { createContext, useContext, useState, ReactNode } from 'react'

interface User {
  id: string
  username: string
  firstName: string
  email: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Check for admin credentials
    if (username === 'admin' && password === 'admin') {
      const adminUser: User = {
        id: '1',
        username: 'admin',
        firstName: 'Admin',
        email: 'admin@workflowai.com'
      }
      setUser(adminUser)
      return true
    }
    
    return false
  }

  const logout = () => {
    setUser(null)
  }

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
