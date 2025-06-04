export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          username: string | null
          email: string | null
          full_name: string | null
          avatar_url: string | null
          subscription_tier: string
          subscription_status: string
          subscription_ends_at: string | null
          onboarding_completed: boolean
          preferred_session_duration: number
          notifications_enabled: boolean
          theme_preference: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: string
          subscription_status?: string
          subscription_ends_at?: string | null
          onboarding_completed?: boolean
          preferred_session_duration?: number
          notifications_enabled?: boolean
          theme_preference?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: string
          subscription_status?: string
          subscription_ends_at?: string | null
          onboarding_completed?: boolean
          preferred_session_duration?: number
          notifications_enabled?: boolean
          theme_preference?: string
          created_at?: string
          updated_at?: string
        }
      }
      focus_sessions: {
        Row: {
          id: string
          user_id: string
          session_duration: number
          actual_duration: number | null
          session_type: string
          soundscape_used: string | null
          completed: boolean
          interruption_count: number
          emergency_unlocks: number
          notes: string | null
          started_at: string
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_duration: number
          actual_duration?: number | null
          session_type?: string
          soundscape_used?: string | null
          completed?: boolean
          interruption_count?: number
          emergency_unlocks?: number
          notes?: string | null
          started_at?: string
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_duration?: number
          actual_duration?: number | null
          session_type?: string
          soundscape_used?: string | null
          completed?: boolean
          interruption_count?: number
          emergency_unlocks?: number
          notes?: string | null
          started_at?: string
          completed_at?: string | null
          created_at?: string
        }
      }
      mood_entries: {
        Row: {
          id: string
          user_id: string
          session_id: string | null
          mood_score: number
          mood_emoji: string | null
          energy_level: number | null
          stress_level: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id?: string | null
          mood_score: number
          mood_emoji?: string | null
          energy_level?: number | null
          stress_level?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string | null
          mood_score?: number
          mood_emoji?: string | null
          energy_level?: number | null
          stress_level?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      user_streaks: {
        Row: {
          id: string
          user_id: string
          streak_type: string
          current_streak: number
          longest_streak: number
          last_activity_date: string | null
          streak_freeze_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          streak_type?: string
          current_streak?: number
          longest_streak?: number
          last_activity_date?: string | null
          streak_freeze_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          streak_type?: string
          current_streak?: number
          longest_streak?: number
          last_activity_date?: string | null
          streak_freeze_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          user_id: string
          achievement_type: string
          achievement_name: string | null
          achievement_description: string | null
          badge_icon: string | null
          unlocked_at: string
          is_premium: boolean
        }
        Insert: {
          id?: string
          user_id: string
          achievement_type: string
          achievement_name?: string | null
          achievement_description?: string | null
          badge_icon?: string | null
          unlocked_at?: string
          is_premium?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          achievement_type?: string
          achievement_name?: string | null
          achievement_description?: string | null
          badge_icon?: string | null
          unlocked_at?: string
          is_premium?: boolean
        }
      }
      app_analytics: {
        Row: {
          id: string
          user_id: string
          event_type: string | null
          event_data: Json | null
          screen_name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_type?: string | null
          event_data?: Json | null
          screen_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_type?: string | null
          event_data?: Json | null
          screen_name?: string | null
          created_at?: string
        }
      }
      daily_tips: {
        Row: {
          id: string
          tip_text: string
          tip_category: string | null
          is_premium: boolean
          display_order: number | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          tip_text: string
          tip_category?: string | null
          is_premium?: boolean
          display_order?: number | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          tip_text?: string
          tip_category?: string | null
          is_premium?: boolean
          display_order?: number | null
          active?: boolean
          created_at?: string
        }
      }
    }
    Functions: {
      calculate_user_streak: {
        Args: {
          user_uuid: string
        }
        Returns: number
      }
    }
  }
}
