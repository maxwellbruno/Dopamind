import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { authService } from "./auth-service"

type SubscriptionTier = "free" | "pro" | "elite"
type SubscriptionStatus = "active" | "cancelled" | "expired"

export const subscriptionService = {
  // Update user subscription
  async updateSubscription(tier: SubscriptionTier, status: SubscriptionStatus, endsAt: string | null = null) {
    const { data: userData } = await authService.getCurrentUser()

    if (!isSupabaseConfigured() || !supabase || !userData.user) {
      // Demo mode - store in localStorage
      localStorage.setItem(
        "dopamind_subscription",
        JSON.stringify({
          tier,
          status,
          endsAt,
        }),
      )
      return { data: { tier, status, endsAt }, error: null }
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .update({
        subscription_tier: tier,
        subscription_status: status,
        subscription_ends_at: endsAt,
      })
      .eq("id", userData.user.id)
      .select()
      .single()

    return { data, error }
  },

  // Check subscription status
  async checkSubscriptionStatus() {
    const { data: userData } = await authService.getCurrentUser()

    if (!isSupabaseConfigured() || !supabase || !userData.user) {
      // Demo mode - get from localStorage
      const subscription = localStorage.getItem("dopamind_subscription")
      if (subscription) {
        return { data: JSON.parse(subscription), error: null }
      }
      return {
        data: { subscription_tier: "free", subscription_status: "active", subscription_ends_at: null },
        error: null,
      }
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .select("subscription_tier, subscription_status, subscription_ends_at")
      .eq("id", userData.user.id)
      .single()

    return { data, error }
  },

  // Get premium features access
  async hasFeatureAccess(feature: string) {
    const { data: subscription, error } = await this.checkSubscriptionStatus()

    if (error || !subscription) {
      return false
    }

    const featureMap: Record<string, SubscriptionTier[]> = {
      unlimited_sessions: ["pro", "elite"],
      advanced_analytics: ["pro", "elite"],
      premium_soundscapes: ["pro", "elite"],
      personal_coaching: ["elite"],
      custom_programs: ["elite"],
    }

    return featureMap[feature]?.includes(subscription.subscription_tier as SubscriptionTier) || false
  },
}
