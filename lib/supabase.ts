import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only create Supabase client if environment variables are provided
export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && supabase)
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      mood_entries: {
        Row: {
          id: string
          user_id: string
          mood: number
          notes: string
          timestamp: string
          after_session: boolean
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mood: number
          notes?: string
          timestamp: string
          after_session?: boolean
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          mood?: number
          notes?: string
          timestamp?: string
          after_session?: boolean
          date?: string
          created_at?: string
        }
      }
      focus_sessions: {
        Row: {
          id: string
          user_id: string
          duration: number
          completed: boolean
          started_at: string
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          duration: number
          completed?: boolean
          started_at: string
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          duration?: number
          completed?: boolean
          started_at?: string
          completed_at?: string | null
          created_at?: string
        }
      }
      user_stats: {
        Row: {
          id: string
          user_id: string
          current_streak: number
          best_streak: number
          total_sessions: number
          total_focus_time: number
          last_session_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          current_streak?: number
          best_streak?: number
          total_sessions?: number
          total_focus_time?: number
          last_session_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          current_streak?: number
          best_streak?: number
          total_sessions?: number
          total_focus_time?: number
          last_session_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
