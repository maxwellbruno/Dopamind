import { supabase, isSupabaseConfigured } from "@/lib/supabase"

export const authService = {
  // Sign up new user
  async signUp(email: string, password: string, userData: { username?: string; fullName: string }) {
    if (!isSupabaseConfigured() || !supabase) {
      // Demo mode - store in localStorage
      localStorage.setItem(
        "dopamind_user",
        JSON.stringify({
          name: userData.fullName,
          email: email,
          id: `demo-${Date.now()}`,
        }),
      )
      return { data: { user: { id: "demo" } }, error: null }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: userData.username,
          full_name: userData.fullName,
        },
      },
    })

    if (data.user && !error) {
      // Create user profile
      await supabase.from("user_profiles").insert({
        id: data.user.id,
        username: userData.username,
        email: email,
        full_name: userData.fullName,
      })
    }

    return { data, error }
  },

  // Sign in user
  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured() || !supabase) {
      // Demo mode - store in localStorage
      localStorage.setItem(
        "dopamind_user",
        JSON.stringify({
          name: "Demo User",
          email: email,
          id: `demo-${Date.now()}`,
        }),
      )
      return { data: { user: { id: "demo" } }, error: null }
    }

    return await supabase.auth.signInWithPassword({ email, password })
  },

  // Sign out user
  async signOut() {
    if (!isSupabaseConfigured() || !supabase) {
      // Demo mode - clear localStorage
      localStorage.removeItem("dopamind_user")
      return { error: null }
    }

    return await supabase.auth.signOut()
  },

  // Get current user
  async getCurrentUser() {
    if (!isSupabaseConfigured() || !supabase) {
      // Demo mode - get from localStorage
      const userData = localStorage.getItem("dopamind_user")
      if (userData) {
        const user = JSON.parse(userData)
        return { data: { user: { id: user.id, email: user.email, user_metadata: { name: user.name } } }, error: null }
      }
      return { data: { user: null }, error: null }
    }

    return await supabase.auth.getUser()
  },

  // OAuth sign in (Google, Apple)
  async signInWithProvider(provider: "google" | "apple") {
    if (!isSupabaseConfigured() || !supabase) {
      return { error: new Error("OAuth sign in requires Supabase configuration") }
    }

    return await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  },
}
