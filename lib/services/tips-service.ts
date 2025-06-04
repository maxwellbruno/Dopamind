import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { subscriptionService } from "./subscription-service"

const DEFAULT_TIPS = [
  {
    id: "1",
    tip_text: "Dopamine fasting isn't about complete deprivation - it's about intentional consumption",
    tip_category: "dopamine",
    is_premium: false,
  },
  {
    id: "2",
    tip_text: "Your brain needs 90 minutes to reset dopamine levels after overstimulation",
    tip_category: "dopamine",
    is_premium: false,
  },
  {
    id: "3",
    tip_text: "Natural rewards like sunlight and exercise create sustainable dopamine",
    tip_category: "mindfulness",
    is_premium: false,
  },
  {
    id: "4",
    tip_text: "Every small win builds momentum - celebrate completing sessions",
    tip_category: "productivity",
    is_premium: false,
  },
  {
    id: "5",
    tip_text: "Boredom is your brain's way of encouraging creativity and reflection",
    tip_category: "mindfulness",
    is_premium: false,
  },
  {
    id: "6",
    tip_text: "Try the 'Pomodoro Technique' - 25 minutes of focus followed by a 5-minute break",
    tip_category: "productivity",
    is_premium: false,
  },
  {
    id: "7",
    tip_text: "Advanced: Create a 'dopamine schedule' to balance digital stimulation throughout your day",
    tip_category: "dopamine",
    is_premium: true,
  },
]

export const tipsService = {
  // Get daily tip
  async getDailyTip() {
    if (!isSupabaseConfigured() || !supabase) {
      // Demo mode - return random tip from defaults
      const hasPremiumAccess = await subscriptionService.hasFeatureAccess("advanced_analytics")
      const eligibleTips = hasPremiumAccess ? DEFAULT_TIPS : DEFAULT_TIPS.filter((tip) => !tip.is_premium)

      const randomTip = eligibleTips[Math.floor(Math.random() * eligibleTips.length)]
      return { data: randomTip, error: null }
    }

    const hasPremiumAccess = await subscriptionService.hasFeatureAccess("advanced_analytics")

    const { data, error } = await supabase
      .from("daily_tips")
      .select("*")
      .eq("active", true)
      .eq(hasPremiumAccess ? "is_premium" : "is_premium", hasPremiumAccess)
      .order("display_order", { ascending: true })
      .limit(10)

    if (error || !data || data.length === 0) {
      // Fallback to default tips
      const eligibleTips = hasPremiumAccess ? DEFAULT_TIPS : DEFAULT_TIPS.filter((tip) => !tip.is_premium)

      const randomTip = eligibleTips[Math.floor(Math.random() * eligibleTips.length)]
      return { data: randomTip, error: null }
    }

    // Return random tip from database
    const randomTip = data[Math.floor(Math.random() * data.length)]
    return { data: randomTip, error: null }
  },

  // Get tips by category
  async getTipsByCategory(category: string) {
    if (!isSupabaseConfigured() || !supabase) {
      // Demo mode - filter default tips by category
      const hasPremiumAccess = await subscriptionService.hasFeatureAccess("advanced_analytics")
      const eligibleTips = hasPremiumAccess ? DEFAULT_TIPS : DEFAULT_TIPS.filter((tip) => !tip.is_premium)

      return {
        data: eligibleTips.filter((tip) => tip.tip_category === category),
        error: null,
      }
    }

    const hasPremiumAccess = await subscriptionService.hasFeatureAccess("advanced_analytics")

    return await supabase
      .from("daily_tips")
      .select("*")
      .eq("active", true)
      .eq("tip_category", category)
      .eq(hasPremiumAccess ? "is_premium" : "is_premium", hasPremiumAccess)
      .order("display_order", { ascending: true })
  },
}
