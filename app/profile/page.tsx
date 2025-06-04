"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Settings,
  Bell,
  Crown,
  Moon,
  Sun,
  Download,
  HelpCircle,
  LogOut,
  ChevronRight,
  Globe,
  Smartphone,
  TestTube,
} from "lucide-react"
import BottomNav from "@/components/bottom-nav"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const [user, setUser] = useState({ name: "John Doe", email: "john@example.com" })
  const [stats, setStats] = useState({
    totalSessions: 42,
    focusTime: "18h",
    currentStreak: 7,
    bestStreak: 15,
  })
  const [darkMode, setDarkMode] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [showNotificationSettings, setShowNotificationSettings] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)

  const router = useRouter()

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    // Try to load from Supabase if configured
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: authUser } = await supabase.auth.getUser()

        if (authUser.user) {
          // Load user profile
          const { data: profile } = await supabase.from("users").select("*").eq("id", authUser.user.id).single()

          if (profile) {
            setUser({ name: profile.name, email: profile.email })
          }

          // Load user stats
          const { data: userStats } = await supabase
            .from("user_stats")
            .select("*")
            .eq("user_id", authUser.user.id)
            .single()

          if (userStats) {
            setStats({
              totalSessions: userStats.total_sessions,
              focusTime: `${Math.floor(userStats.total_focus_time / 60)}h`,
              currentStreak: userStats.current_streak,
              bestStreak: userStats.best_streak,
            })
          }
          return
        }
      } catch (error) {
        console.log("Supabase error, using localStorage:", error)
      }
    }

    // Fallback to localStorage
    const userData = localStorage.getItem("dopamind_user")
    if (userData) {
      setUser(JSON.parse(userData))
    }

    const streak = localStorage.getItem("dopamind_streak")
    const sessions = localStorage.getItem("dopamind_total_sessions")
    if (streak) setStats((prev) => ({ ...prev, currentStreak: Number.parseInt(streak) }))
    if (sessions) setStats((prev) => ({ ...prev, totalSessions: Number.parseInt(sessions) }))
  }

  const handleExportData = async () => {
    // Try to export from Supabase if configured
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: user } = await supabase.auth.getUser()

        if (user.user) {
          const { data: moodEntries } = await supabase.from("mood_entries").select("*").eq("user_id", user.user.id)
          const { data: focusSessions } = await supabase.from("focus_sessions").select("*").eq("user_id", user.user.id)

          const exportData = {
            moodEntries,
            focusSessions,
            exportDate: new Date().toISOString(),
          }

          const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `dopamind-data-${new Date().toISOString().split("T")[0]}.json`
          a.click()
          URL.revokeObjectURL(url)
          setShowExportDialog(false)
          return
        }
      } catch (error) {
        console.log("Supabase export error, using localStorage:", error)
      }
    }

    // Fallback to localStorage export
    const moodEntries = localStorage.getItem("dopamind_mood_entries")
    const exportData = {
      moodEntries: moodEntries ? JSON.parse(moodEntries) : [],
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `dopamind-data-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    setShowExportDialog(false)
  }

  const handleSignOut = async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut()
      } catch (error) {
        console.log("Sign out error:", error)
      }
    }

    // Clear localStorage
    localStorage.clear()
    window.location.href = "/auth/signin"
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const menuItems = [
    {
      icon: Settings,
      label: "Settings",
      action: () => setShowSettings(true),
    },
    {
      icon: Bell,
      label: "Notifications",
      action: () => setShowNotificationSettings(true),
    },
    {
      icon: Crown,
      label: "Upgrade to Pro",
      action: () => alert("Pro features coming soon!"),
      highlight: true,
    },
    {
      icon: Download,
      label: "Export Data",
      action: () => setShowExportDialog(true),
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      action: () => window.open("mailto:support@dopamind.app", "_blank"),
    },
    {
      icon: TestTube,
      label: "Test Suite",
      action: () => router.push("/test"),
      highlight: false,
    },
  ]

  return (
    <div className="mobile-container">
      <div className="app-header">
        <div className="w-full text-center text-xs text-slate-400">DOPAMIND</div>
      </div>

      <div className="p-6 pb-24">
        {/* Profile Header */}
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4">
            {getInitials(user.name)}
          </div>
          <h1 className="text-2xl font-bold mb-1">{user.name}</h1>
          <p className="text-slate-400">{user.email}</p>
          {!isSupabaseConfigured() && (
            <div className="mt-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full inline-block">
              <p className="text-amber-400 text-xs">Demo Mode</p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700 p-5 text-center">
            <div className="text-3xl font-bold text-emerald-400 mb-1">{stats.totalSessions}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Total Sessions</div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-5 text-center">
            <div className="text-3xl font-bold text-emerald-400 mb-1">{stats.focusTime}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Focus Time</div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-5 text-center">
            <div className="text-3xl font-bold text-emerald-400 mb-1">{stats.currentStreak}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Current Streak</div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-5 text-center">
            <div className="text-3xl font-bold text-emerald-400 mb-1">{stats.bestStreak}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Best Streak</div>
          </Card>
        </div>

        {/* Platform Information */}
        <Card className="bg-slate-800 border-slate-700 p-6 mb-8">
          <h3 className="font-semibold text-slate-300 mb-4">Available Platforms</h3>
          <div className="flex flex-wrap gap-2">
            <span className="platform-badge">
              <Globe className="w-3 h-3 mr-1" /> Web App
            </span>
            <span className="platform-badge">
              <Smartphone className="w-3 h-3 mr-1" /> iOS
            </span>
            <span className="platform-badge">
              <Smartphone className="w-3 h-3 mr-1" /> Android
            </span>
          </div>
        </Card>

        {/* Quick Settings */}
        <Card className="bg-slate-800 border-slate-700 p-6 mb-6">
          <h3 className="font-semibold text-slate-300 mb-4">Quick Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <Moon size={20} className="text-slate-400" />
                ) : (
                  <Sun size={20} className="text-slate-400" />
                )}
                <span className="text-slate-300">Dark Mode</span>
              </div>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-slate-400" />
                <span className="text-slate-300">Notifications</span>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
          </div>
        </Card>

        {/* Menu Items */}
        <Card className="bg-slate-800 border-slate-700 p-6 mb-6">
          <h3 className="font-semibold text-slate-300 mb-4">Account</h3>
          <div className="space-y-1">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                className={`w-full flex items-center justify-between p-4 rounded-lg transition-colors ${
                  item.highlight
                    ? "bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20"
                    : "hover:bg-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} className={item.highlight ? "text-amber-400" : "text-slate-400"} />
                  <span className={item.highlight ? "text-amber-400 font-semibold" : "text-slate-300"}>
                    {item.label}
                  </span>
                  {item.highlight && (
                    <span className="bg-amber-500 text-black text-xs px-2 py-1 rounded-full font-bold">PRO</span>
                  )}
                </div>
                <ChevronRight size={16} className="text-slate-500" />
              </button>
            ))}
          </div>
        </Card>

        {/* Sign Out */}
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
        >
          <LogOut className="mr-2" size={20} />
          Sign Out
        </Button>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-slate-800 border-slate-700 text-slate-100">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                className="bg-slate-700 border-slate-600"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                className="bg-slate-700 border-slate-600"
              />
            </div>
            <Button className="w-full bg-emerald-500 hover:bg-emerald-600">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Data Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-slate-100">
          <DialogHeader>
            <DialogTitle>Export Your Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-slate-300">Download all your mood entries and focus session data as a JSON file.</p>
            <Button onClick={handleExportData} className="w-full bg-emerald-500 hover:bg-emerald-600">
              <Download className="mr-2" size={16} />
              Download Data
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav currentPage="profile" />
    </div>
  )
}
