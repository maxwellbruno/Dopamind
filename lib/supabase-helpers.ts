import { supabase } from "./supabase"
import type { Database } from "./supabase"

type Tables = Database["public"]["Tables"]
type MoodEntry = Tables["mood_entries"]["Row"]
type FocusSession = Tables["focus_sessions"]["Row"]
type UserStats = Tables["user_stats"]["Row"]
type UserPreferences = Tables["user_preferences"]["Row"]

export const supabaseHelpers = {
  // User management
  async createUserProfile(userId: string, email: string, name: string) {
    if (!supabase) return null

    const { data, error } = await supabase.from("users").insert([
      {
        id: userId,
        email,
        name,
      },
    ])

    return { data, error }
  },

  async getUserProfile(userId: string) {
    if (!supabase) return null

    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

    return { data, error }
  },

  // Mood tracking
  async saveMoodEntry(
    userId: string,
    mood: number,
    notes = "",
    afterSession = false,
  ): Promise<{ data: MoodEntry | null; error: any }> {
    if (!supabase) return { data: null, error: "Supabase not configured" }

    const { data, error } = await supabase
      .from("mood_entries")
      .insert([
        {
          user_id: userId,
          mood,
          notes,
          after_session: afterSession,
          timestamp: new Date().toISOString(),
          date: new Date().toISOString().split("T")[0],
        },
      ])
      .select()
      .single()

    return { data, error }
  },

  async getMoodEntries(userId: string, limit = 30) {
    if (!supabase) return { data: null, error: "Supabase not configured" }

    const { data, error } = await supabase
      .from("mood_entries")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false })
      .limit(limit)

    return { data, error }
  },

  async getMoodHistory(userId: string, days = 7) {
    if (!supabase) return { data: null, error: "Supabase not configured" }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from("mood_entries")
      .select("mood, date")
      .eq("user_id", userId)
      .gte("date", startDate.toISOString().split("T")[0])
      .order("date", { ascending: true })

    return { data, error }
  },

  // Focus sessions
  async startFocusSession(userId: string, duration: number) {
    if (!supabase) return { data: null, error: "Supabase not configured" }

    const { data, error } = await supabase
      .from("focus_sessions")
      .insert([
        {
          user_id: userId,
          duration,
          started_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    return { data, error }
  },

  async completeFocusSession(sessionId: string) {
    if (!supabase) return { data: null, error: "Supabase not configured" }

    const { data, error } = await supabase
      .from("focus_sessions")
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq("id", sessionId)
      .select()
      .single()

    return { data, error }
  },

  async getFocusSessions(userId: string, limit = 30) {
    if (!supabase) return { data: null, error: "Supabase not configured" }

    const { data, error } = await supabase
      .from("focus_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .limit(limit)

    return { data, error }
  },

  // User stats
  async getUserStats(userId: string) {
    if (!supabase) return { data: null, error: "Supabase not configured" }

    const { data, error } = await supabase.from("user_stats").select("*").eq("user_id", userId).single()

    return { data, error }
  },

  async updateUserStats(userId: string, sessionDuration: number, completed = true) {
    if (!supabase) return { data: null, error: "Supabase not configured" }

    // Call the database function to update stats
    const { data, error } = await supabase.rpc("update_user_stats", {
      p_user_id: userId,
      p_session_duration: sessionDuration,
      p_completed: completed,
    })

    return { data, error }
  },

  // User preferences
  async getUserPreferences(userId: string) {
    if (!supabase) return { data: null, error: "Supabase not configured" }

    const { data, error } = await supabase.from("user_preferences").select("*").eq("user_id", userId).single()

    return { data, error }
  },

  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>) {
    if (!supabase) return { data: null, error: "Supabase not configured" }

    const { data, error } = await supabase
      .from("user_preferences")
      .update({
        ...preferences,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single()

    return { data, error }
  },

  // Dashboard data
  async getDashboardData(userId: string) {
    if (!supabase) return { data: null, error: "Supabase not configured" }

    const { data, error } = await supabase.rpc("get_user_dashboard", {
      p_user_id: userId,
    })

    return { data, error }
  },

  // Data export
  async exportUserData(userId: string) {
    if (!supabase) return { data: null, error: "Supabase not configured" }

    const [moods, sessions, stats, preferences] = await Promise.all([
      supabase.from("mood_entries").select("*").eq("user_id", userId),
      supabase.from("focus_sessions").select("*").eq("user_id", userId),
      supabase.from("user_stats").select("*").eq("user_id", userId).single(),
      supabase.from("user_preferences").select("*").eq("user_id", userId).single(),
    ])

    return {
      data: {
        mood_entries: moods.data || [],
        focus_sessions: sessions.data || [],
        user_stats: stats.data,
        user_preferences: preferences.data,
        exported_at: new Date().toISOString(),
      },
      error: moods.error || sessions.error || stats.error || preferences.error,
    }
  },
}
