"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { DatabaseService } from "./database"

interface User {
  id: number
  email: string
  name?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const savedUser = localStorage.getItem("topicflow_user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        localStorage.removeItem("topicflow_user")
      }
    }
    setIsLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)

    try {
      const existingUser = await DatabaseService.getUserByEmail(email)

      if (existingUser && password.length >= 6) {
        // TODO: Add proper password hashing and verification
        const user: User = {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
        }

        setUser(user)
        localStorage.setItem("topicflow_user", JSON.stringify(user))
        setIsLoading(false)
        return { success: true }
      }

      setIsLoading(false)
      return { success: false, error: "Invalid email or password" }
    } catch (error) {
      setIsLoading(false)
      return { success: false, error: "Sign in failed. Please try again." }
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true)

    try {
      const existingUser = await DatabaseService.getUserByEmail(email)
      if (existingUser) {
        setIsLoading(false)
        return { success: false, error: "User with this email already exists" }
      }

      // Basic validation
      if (email && password.length >= 6 && name) {
        // TODO: Add proper password hashing (bcrypt, etc.)
        const passwordHash = password // Temporary - should be hashed
        const dbUser = await DatabaseService.createUser(email, passwordHash, name)

        const user: User = {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
        }

        setUser(user)
        localStorage.setItem("topicflow_user", JSON.stringify(user))
        setIsLoading(false)
        return { success: true }
      }

      setIsLoading(false)
      return { success: false, error: "Please fill in all fields with valid data" }
    } catch (error) {
      setIsLoading(false)
      return { success: false, error: "Sign up failed. Please try again." }
    }
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem("topicflow_user")
  }

  const value = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
