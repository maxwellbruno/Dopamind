import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { authService } from "./auth-service"

export const sessionService = {
  // Start new focus session
  async startSession(duration: number, sessionType = "focus") {
    const { data: userData } = await authService.getCurrentUser()

    if (!isSupabaseConfigured() || !supabase || !userData.user) {
      // Demo mode - store in localStorage
      const sessionId = `local-${Date.now()}`
      const session = {
        id: sessionId,
        user_id: "demo",
        session_duration: duration,
        session_type: sessionType,
        started_at: new Date().toISOString(),
        completed: false,
      }

      const sessions = JSON.parse(localStorage.getItem("dopamind_sessions") || "[]")
      sessions.push(session)
      localStorage.setItem("dopamind_sessions", JSON.stringify(sessions))

      return { data: session, error: null }
    }

    const { data, error } = await supabase
      .from("focus_sessions")
      .insert({
        user_id: userData.user.id,
        session_duration: duration,
        session_type: sessionType,
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    return { data, error }
  },

  // Complete session
  async completeSession(sessionId: string, actualDuration: number) {
    if (!isSupabaseConfigured() || !supabase) {
      // Demo mode - update in localStorage
      const sessions = JSON.parse(localStorage.getItem("dopamind_sessions") || "[]")
      const updatedSessions = sessions.map((s: any) => {
        if (s.id === sessionId) {
          return {
            ...s,
            completed: true,
            actual_duration: actualDuration,
            completed_at: new Date().toISOString(),
          }
        }
        return s
      })

      localStorage.setItem("dopamind_sessions", JSON.stringify(updatedSessions))

      // Update streak
      const streak = Number(localStorage.getItem("dopamind_streak") || "0")
      localStorage.setItem("dopamind_streak", (streak + 1).toString())

      // Update total sessions
      const totalSessions = Number(localStorage.getItem("dopamind_total_sessions") || "0")
      localStorage.setItem("dopamind_total_sessions", (totalSessions + 1).toString())

      return {
        data: updatedSessions.find((s: any) => s.id === sessionId),
        error: null,
      }
    }

    const { data, error } = await supabase
      .from("focus_sessions")
      .update({
        completed: true,
        actual_duration: actualDuration,
        completed_at: new Date().toISOString(),
      })
      .eq("id", sessionId)
      .select()
      .single()

    // Update streak after completion
    if (!error) {
      await this.updateUserStreak()
    }

    return { data, error }
  },

  // Get user session history
  async getUserSessions(limit = 50) {
    const { data: userData } = await authService.getCurrentUser()

    if (!isSupabaseConfigured() || !supabase || !userData.user) {
      // Demo mode - get from localStorage
      const sessions = JSON.parse(localStorage.getItem("dopamind_sessions") || "[]")
      return {
        data: sessions
          .sort((a: any, b: any) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
          .slice(0, limit),
        error: null,
      }
    }

    return await supabase
      .from("focus_sessions")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("started_at", { ascending: false })
      .limit(limit)
  },

  // Update streak
  async updateUserStreak() {
    const { data: userData } = await authService.getCurrentUser()

    if (!isSupabaseConfigured() || !supabase || !userData.user) {
      return { data: null, error: null }
    }

    // Call the streak calculation function
    const { data } = await supabase.rpc("calculate_user_streak", {
      user_uuid: userData.user.id,
    })

    // Update or insert streak record
    const { data: streakData, error } = await supabase
      .from("user_streaks")
      .upsert({
        user_id: userData.user.id,
        current_streak: data,
        last_activity_date: new Date().toISOString().split("T")[0],
      })
      .select()
      .single()

    return { data: streakData, error }
  },
}
