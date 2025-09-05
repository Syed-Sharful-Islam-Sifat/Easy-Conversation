"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { DatabaseService } from "./database"
import { SubscriptionService } from "./subscription-service"
import type { PlanType } from "./stripe"

interface User {
  id: number
  email: string
  name?: string
  plan: PlanType
  conversationsUsed: number
  conversationsLimit: number
  stripeCustomerId?: string
  subscriptionId?: string
  subscriptionStatus?: string
  currentPeriodEnd?: Date
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => void
  isAuthenticated: boolean
  incrementUsage: () => Promise<void>
  refreshUserData: () => Promise<void>
  canSaveConversation: () => boolean
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
        const parsedUser = JSON.parse(savedUser)
        if (!parsedUser.plan) {
          parsedUser.plan = "free"
          parsedUser.conversationsUsed = 0
          parsedUser.conversationsLimit = 3
        }
        setUser(parsedUser)
      } catch (error) {
        localStorage.removeItem("topicflow_user")
      }
    }
    setIsLoading(false)
  }, [])

  const refreshUserData = async () => {
    if (!user) return

    try {
      const dbUser = await DatabaseService.getUserByEmail(user.email)
      if (dbUser) {
        const subscription = await SubscriptionService.getSubscriptionByUserId(user.id.toString())
        const plan = SubscriptionService.getUserPlan(subscription)
        const limit = SubscriptionService.getConversationLimit(plan)

        const updatedUser: User = {
          ...user,
          plan,
          conversationsLimit: limit,
          conversationsUsed: dbUser.conversationsUsed || 0,
          stripeCustomerId: subscription?.stripeCustomerId,
          subscriptionId: subscription?.stripeSubscriptionId,
          subscriptionStatus: subscription?.status,
          currentPeriodEnd: subscription?.currentPeriodEnd,
        }

        setUser(updatedUser)
        localStorage.setItem("topicflow_user", JSON.stringify(updatedUser))
      }
    } catch (error) {
      console.error("Error refreshing user data:", error)
    }
  }

  const incrementUsage = async () => {
    if (!user) return

    try {
      await DatabaseService.incrementUserUsage(user.id)
      const updatedUser = {
        ...user,
        conversationsUsed: user.conversationsUsed + 1,
      }
      setUser(updatedUser)
      localStorage.setItem("topicflow_user", JSON.stringify(updatedUser))
    } catch (error) {
      console.error("Error incrementing usage:", error)
    }
  }

  const canSaveConversation = () => {
    if (!user) return false
    return SubscriptionService.canSaveConversation(user.plan, user.conversationsUsed)
  }

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)

    try {
      const existingUser = await DatabaseService.getUserByEmail(email)

      if (existingUser && password.length >= 6) {
        // TODO: Add proper password hashing and verification
        const subscription = await SubscriptionService.getSubscriptionByUserId(existingUser.id.toString())
        const plan = SubscriptionService.getUserPlan(subscription)
        const limit = SubscriptionService.getConversationLimit(plan)

        const user: User = {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          plan,
          conversationsUsed: existingUser.conversationsUsed || 0,
          conversationsLimit: limit,
          stripeCustomerId: subscription?.stripeCustomerId,
          subscriptionId: subscription?.stripeSubscriptionId,
          subscriptionStatus: subscription?.status,
          currentPeriodEnd: subscription?.currentPeriodEnd,
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
          plan: "free",
          conversationsUsed: 0,
          conversationsLimit: 3,
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
    incrementUsage,
    refreshUserData,
    canSaveConversation,
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
