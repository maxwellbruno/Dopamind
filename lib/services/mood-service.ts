import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { authService } from "./auth-service"

interface MoodData {
  score: number
  emoji?: string
  energy?: number
  stress?: number
  notes?: string
}

export const moodService = {
  // Log mood entry
  async logMood(moodData: MoodData, sessionId: string | null = null) {
    const { data: userData } = await authService.getCurrentUser()

    if (!isSupabaseConfigured() || !supabase || !userData.user) {
      // Demo mode - store in localStorage
      const moodEntry = {
        id: `local-${Date.now()}`,
        user_id: "demo",
        session_id: sessionId,
        mood_score: moodData.score,
        mood_emoji: moodData.emoji,
        energy_level: moodData.energy,
        stress_level: moodData.stress,
        notes: moodData.notes,
        created_at: new Date().toISOString(),
        date: new Date().toISOString().split("T")[0],
        afterSession: sessionId !== null,
      }

      const entries = JSON.parse(localStorage.getItem("dopamind_mood_entries") || "[]")
      entries.unshift(moodEntry)
      localStorage.setItem("dopamind_mood_entries", JSON.stringify(entries))

      // Update mood history for chart
      const history = JSON.parse(localStorage.getItem("dopamind_mood_history") || "[]")
      history.push(moodData.score)
      if (history.length > 7) history.shift()
      localStorage.setItem("dopamind_mood_history", JSON.stringify(history))

      return { data: moodEntry, error: null }
    }

    const { data, error } = await supabase
      .from("mood_entries")
      .insert({
        user_id: userData.user.id,
        session_id: sessionId,
        mood_score: moodData.score,
        mood_emoji: moodData.emoji,
        energy_level: moodData.energy,
        stress_level: moodData.stress,
        notes: moodData.notes,
      })
      .select()
      .single()

    return { data, error }
  },

  // Get mood analytics
  async getMoodAnalytics(days = 30) {
    const { data: userData } = await authService.getCurrentUser()

    if (!isSupabaseConfigured() || !supabase || !userData.user) {
      // Demo mode - get from localStorage
      const entries = JSON.parse(localStorage.getItem("dopamind_mood_entries") || "[]")
      const fromDate = new Date()
      fromDate.setDate(fromDate.getDate() - days)

      return {
        data: entries
          .filter((entry: any) => new Date(entry.created_at) >= fromDate)
          .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
        error: null,
      }
    }

    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - days)

    return await supabase
      .from("mood_entries")
      .select("*")
      .eq("user_id", userData.user.id)
      .gte("created_at", fromDate.toISOString())
      .order("created_at", { ascending: true })
  },

  // Get mood history for chart
  async getMoodHistory(days = 7) {
    const { data: userData } = await authService.getCurrentUser()

    if (!isSupabaseConfigured() || !supabase || !userData.user) {
      // Demo mode - get from localStorage
      const history = JSON.parse(localStorage.getItem("dopamind_mood_history") || "[3, 4, 3, 4, 4, 3, 5]")
      return { data: history, error: null }
    }

    const { data, error } = await this.getMoodAnalytics(days)

    if (data) {
      // Extract just the mood scores
      const moodScores = data.map((entry) => entry.mood_score)
      return { data: moodScores, error }
    }

    return { data: [], error }
  },

  // Get all mood entries
  async getMoodEntries(limit = 30) {
    const { data: userData } = await authService.getCurrentUser()

    if (!isSupabaseConfigured() || !supabase || !userData.user) {
      // Demo mode - get from localStorage
      const entries = JSON.parse(localStorage.getItem("dopamind_mood_entries") || "[]")
      return {
        data: entries.slice(0, limit),
        error: null,
      }
    }

    return await supabase
      .from("mood_entries")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false })
      .limit(limit)
  },
}
