"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ResponsiveButton } from "@/components/ui/responsive-button"
import { Card } from "@/components/ui/card"
import { Play, Calendar } from "lucide-react"
import ResponsiveLayout from "@/components/layout/responsive-layout"
import AdaptiveNavigation from "@/components/navigation/adaptive-navigation"
import AppHeader from "@/components/layout/app-header"
import SidebarContent from "@/components/layout/sidebar-content"
import { useAuth } from "@/components/auth/auth-provider"
import { sessionService } from "@/lib/services/session-service"
import { tipsService } from "@/lib/services/tips-service"
import { analyticsService } from "@/lib/services/analytics-service"

export default function HomePage() {
  const [currentStreak, setCurrentStreak] = useState(7)
  const [totalSessions, setTotalSessions] = useState(42)
  const [dailyTip, setDailyTip] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    loadData()
    analyticsService.trackEvent("page_view", {}, "Home")
  }, [])

  const loadData = async () => {
    setLoading(true)

    try {
      const { data: sessions } = await sessionService.getUserSessions(10)
      const streak = localStorage.getItem("dopamind_streak")
      if (streak) setCurrentStreak(Number.parseInt(streak))

      const totalSessionsStored = localStorage.getItem("dopamind_total_sessions")
      if (totalSessionsStored) setTotalSessions(Number.parseInt(totalSessionsStored))

      const { data: tip } = await tipsService.getDailyTip()
      if (tip) setDailyTip(tip.tip_text)
    } catch (error) {
      console.error("Error loading data:", error)
    }

    setLoading(false)
  }

  const handleStartSession = async () => {
    await analyticsService.trackEvent("focus_session_start_clicked", {}, "Home")
    router.push("/focus")
  }

  const handleLogMood = async () => {
    await analyticsService.trackEvent("mood_log_clicked", {}, "Home")
    router.push("/mood")
  }

  const handleViewProgress = async () => {
    await analyticsService.trackEvent("progress_view_clicked", {}, "Home")
    router.push("/profile")
  }

  if (loading) {
    return (
      <ResponsiveLayout
        header={<AppHeader showSearch showNotifications />}
        navigation={<AdaptiveNavigation currentPage="home" />}
      >
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner" />
        </div>
      </ResponsiveLayout>
    )
  }

  return (
    <ResponsiveLayout
      header={<AppHeader showSearch showNotifications />}
      sidebar={<SidebarContent />}
      navigation={<AdaptiveNavigation currentPage="home" layout="desktop" />}
    >
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="text-center lg:text-left">
          <h1 className="text-responsive-xl font-bold mb-4">Ready to Focus?</h1>
          <p className="text-slate-400 text-responsive-base mb-8">
            Start your digital wellness journey with a focused session
          </p>
        </div>

        {/* Main Timer Card */}
        <Card className="mobile-card text-center">
          <div className="timer-container mx-auto mb-8">
            <div className="relative w-full h-full">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-slate-700"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45}`}
                  className="text-emerald-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-4xl sm:text-5xl lg:text-6xl font-light font-mono text-slate-100">25:00</div>
              </div>
            </div>
          </div>

          {/* Using the fixed responsive button class */}
          <ResponsiveButton
            onClick={handleStartSession}
            variant="emerald"
            size="lg"
            responsive="default"
            className="font-semibold py-4 text-lg"
          >
            <Play className="mr-2" size={20} />
            Start Focus Session
          </ResponsiveButton>
        </Card>

        {/* Stats Grid */}
        <div className="stats-grid">
          <Card className="mobile-card text-center">
            <div className="text-3xl font-bold text-emerald-400 mb-2">{currentStreak}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Day Streak</div>
            <div className="text-2xl mt-2">🔥</div>
          </Card>
          <Card className="mobile-card text-center">
            <div className="text-3xl font-bold text-emerald-400 mb-2">{totalSessions}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Total Sessions</div>
            <div className="text-2xl mt-2">⏱️</div>
          </Card>
          <Card className="mobile-card text-center">
            <div className="text-3xl font-bold text-emerald-400 mb-2">{Math.floor((totalSessions * 25) / 60)}h</div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Focus Time</div>
            <div className="text-2xl mt-2">🧠</div>
          </Card>
          <Card className="mobile-card text-center">
            <div className="text-3xl font-bold text-emerald-400 mb-2">85%</div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Success Rate</div>
            <div className="text-2xl mt-2">📊</div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="feature-grid">
          <Card
            className="mobile-card text-center cursor-pointer hover:bg-slate-750 transition-colors"
            onClick={handleLogMood}
          >
            <div className="text-4xl mb-4">😊</div>
            <h3 className="font-semibold text-slate-300 mb-2">Log Mood</h3>
            <p className="text-slate-400 text-sm">Track your emotional state</p>
          </Card>
          <Card
            className="mobile-card text-center cursor-pointer hover:bg-slate-750 transition-colors"
            onClick={handleViewProgress}
          >
            <div className="text-4xl mb-4">📈</div>
            <h3 className="font-semibold text-slate-300 mb-2">View Progress</h3>
            <p className="text-slate-400 text-sm">See your improvement</p>
          </Card>
          <Card className="mobile-card text-center cursor-pointer hover:bg-slate-750 transition-colors">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="font-semibold text-slate-300 mb-2">Set Goals</h3>
            <p className="text-slate-400 text-sm">Plan your sessions</p>
          </Card>
        </div>

        {/* Daily Tip - Mobile Only */}
        {dailyTip && (
          <Card className="mobile-card lg:hidden border-l-4 border-l-emerald-500">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <h3 className="font-semibold text-emerald-400 mb-2">Daily Tip</h3>
                <p className="text-slate-300 leading-relaxed">{dailyTip}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Recent Activity */}
        <Card className="mobile-card">
          <h3 className="font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <Calendar size={16} />
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span className="text-slate-300 text-sm">Completed 25min focus session</span>
              </div>
              <span className="text-slate-500 text-xs">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-slate-300 text-sm">Logged mood: Happy</span>
              </div>
              <span className="text-slate-500 text-xs">4 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full" />
                <span className="text-slate-300 text-sm">Achieved 7-day streak</span>
              </div>
              <span className="text-slate-500 text-xs">1 day ago</span>
            </div>
          </div>
        </Card>
      </div>
    </ResponsiveLayout>
  )
}
