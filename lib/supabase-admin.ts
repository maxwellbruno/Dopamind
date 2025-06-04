import { createClient } from "@supabase/supabase-js"
import type { Database } from "./supabase"

// Admin client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = supabaseServiceKey
  ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

// Helper functions for admin operations
export const adminHelpers = {
  // Get user stats for analytics
  async getUserStats() {
    if (!supabaseAdmin) return null

    const { data, error } = await supabaseAdmin
      .from("user_stats")
      .select("*")
      .order("total_sessions", { ascending: false })

    return { data, error }
  },

  // Clean up old data
  async cleanupOldData(daysOld = 90) {
    if (!supabaseAdmin) return null

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const { data, error } = await supabaseAdmin.from("mood_entries").delete().lt("created_at", cutoffDate.toISOString())

    return { data, error }
  },

  // Get app analytics
  async getAnalytics() {
    if (!supabaseAdmin) return null

    const { data: userCount } = await supabaseAdmin.from("users").select("id", { count: "exact", head: true })

    const { data: sessionCount } = await supabaseAdmin
      .from("focus_sessions")
      .select("id", { count: "exact", head: true })

    const { data: moodCount } = await supabaseAdmin.from("mood_entries").select("id", { count: "exact", head: true })

    return {
      users: userCount?.length || 0,
      sessions: sessionCount?.length || 0,
      moods: moodCount?.length || 0,
    }
  },
}
