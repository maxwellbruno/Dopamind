"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, Target, Zap, Calendar } from "lucide-react"

export default function SidebarContent() {
  const stats = {
    currentStreak: 7,
    totalSessions: 42,
    focusTime: "18h",
    weeklyGoal: 5,
  }

  const achievements = [
    { name: "First Session", icon: "🎯", unlocked: true },
    { name: "Week Warrior", icon: "🔥", unlocked: true },
    { name: "Focus Master", icon: "🧠", unlocked: false },
    { name: "Zen Mode", icon: "🧘", unlocked: false },
  ]

  const upcomingGoals = [
    { name: "Complete 5 sessions this week", progress: 3, total: 5 },
    { name: "Maintain 10-day streak", progress: 7, total: 10 },
    { name: "Log mood daily", progress: 4, total: 7 },
  ]

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h3 className="font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <TrendingUp size={16} />
          Quick Stats
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Current Streak</span>
            <div className="flex items-center gap-1">
              <span className="font-bold text-emerald-400">{stats.currentStreak}</span>
              <span className="text-xs text-slate-500">days</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Total Sessions</span>
            <span className="font-bold text-emerald-400">{stats.totalSessions}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Focus Time</span>
            <span className="font-bold text-emerald-400">{stats.focusTime}</span>
          </div>
        </div>
      </Card>

      {/* Achievements */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h3 className="font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <Target size={16} />
          Achievements
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg text-center ${
                achievement.unlocked ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-slate-700"
              }`}
            >
              <div className="text-2xl mb-1">{achievement.icon}</div>
              <div className={`text-xs ${achievement.unlocked ? "text-emerald-400" : "text-slate-500"}`}>
                {achievement.name}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Weekly Goals */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h3 className="font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <Calendar size={16} />
          Weekly Goals
        </h3>
        <div className="space-y-4">
          {upcomingGoals.map((goal, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400 text-sm">{goal.name}</span>
                <span className="text-xs text-slate-500">
                  {goal.progress}/{goal.total}
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(goal.progress / goal.total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Daily Tip */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20 p-6">
        <h3 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
          <Zap size={16} />
          Daily Tip
        </h3>
        <p className="text-slate-300 text-sm leading-relaxed">
          Your brain needs 90 minutes to reset dopamine levels after overstimulation. Take regular breaks!
        </p>
      </Card>
    </div>
  )
}
