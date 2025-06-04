import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { authService } from "./auth-service"

export const analyticsService = {
  // Track user events
  async trackEvent(eventType: string, eventData = {}, screenName: string | null = null) {
    const { data: userData } = await authService.getCurrentUser()

    if (!isSupabaseConfigured() || !supabase || !userData.user) {
      // In demo mode, just log to console
      console.log(`[Analytics] ${eventType}`, { eventData, screenName })
      return { data: null, error: null }
    }

    return await supabase.from("app_analytics").insert({
      user_id: userData.user.id,
      event_type: eventType,
      event_data: eventData,
      screen_name: screenName,
    })
  },

  // Track session events
  async trackSessionEvent(
    eventType: string,
    sessionData: {
      duration: number
      type: string
      completed: boolean
      interruptions: number
    },
  ) {
    return await this.trackEvent(
      eventType,
      {
        session_duration: sessionData.duration,
        session_type: sessionData.type,
        completed: sessionData.completed,
        interruptions: sessionData.interruptions,
      },
      "FocusTimer",
    )
  },

  // Get user analytics dashboard
  async getUserAnalytics(days = 30) {
    const { data: userData } = await authService.getCurrentUser()

    if (!isSupabaseConfigured() || !supabase || !userData.user) {
      // Demo mode - return empty data
      return { data: [], error: null }
    }

    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - days)

    return await supabase
      .from("app_analytics")
      .select("*")
      .eq("user_id", userData.user.id)
      .gte("created_at", fromDate.toISOString())
      .order("created_at", { ascending: false })
  },
}
