"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { authService } from "@/lib/services/auth-service"

type User = {
  id: string
  email?: string
  name?: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (
    email: string,
    password: string,
    userData: { username?: string; fullName: string },
  ) => Promise<{ error: any }>
  signOut: () => Promise<void>
  signInWithProvider: (provider: "google" | "apple") => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true)
      const { data } = await authService.getCurrentUser()

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || data.user.user_metadata?.full_name || "User",
        })
      } else {
        setUser(null)
      }

      setLoading(false)
    }

    loadUser()

    // Set up auth state listener if Supabase is configured
    if (isSupabaseConfigured() && supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || "User",
          })
        } else {
          setUser(null)
        }
        setLoading(false)
      })

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await authService.signIn(email, password)
    return { error }
  }

  const signUp = async (email: string, password: string, userData: { username?: string; fullName: string }) => {
    const { data, error } = await authService.signUp(email, password, userData)
    return { error }
  }

  const signOut = async () => {
    await authService.signOut()
    setUser(null)
  }

  const signInWithProvider = async (provider: "google" | "apple") => {
    const { error } = await authService.signInWithProvider(provider)
    return { error }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, signInWithProvider }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
