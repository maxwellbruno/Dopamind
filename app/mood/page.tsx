"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, TrendingUp } from "lucide-react"
import BottomNav from "@/components/bottom-nav"
import { moodService } from "@/lib/services/mood-service"
import { analyticsService } from "@/lib/services/analytics-service"

const moodOptions = [
  { emoji: "😫", label: "Stressed", value: 1 },
  { emoji: "😐", label: "Neutral", value: 2 },
  { emoji: "😊", label: "Happy", value: 3 },
  { emoji: "😌", label: "Calm", value: 4 },
  { emoji: "🤩", label: "Energized", value: 5 },
]

interface MoodEntry {
  id?: string
  mood: number
  notes: string
  timestamp: string
  afterSession: boolean
  date: string
}

export default function MoodPage() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [notes, setNotes] = useState("")
  const [moodHistory, setMoodHistory] = useState<number[]>([])
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([])
  const [sessionCompleted, setSessionCompleted] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    loadMoodData()
    // Track page view
    analyticsService.trackEvent("page_view", {}, "Mood")
  }, [])

  useEffect(() => {
    const completed = searchParams.get("completed")
    if (completed === "true") {
      setSessionCompleted(true)
    }
  }, [searchParams.get("completed")])

  const loadMoodData = async () => {
    try {
      // Get mood entries
      const { data: entries } = await moodService.getMoodEntries(30)
      if (entries) {
        setMoodEntries(entries)
      }

      // Get mood history for chart
      const { data: history } = await moodService.getMoodHistory(7)
      if (history) {
        setMoodHistory(history)
      }
    } catch (error) {
      console.error("Error loading mood data:", error)
    }
  }

  const saveMood = async () => {
    if (selectedMood === null) return
    setLoading(true)

    try {
      const moodData = {
        score: selectedMood,
        emoji: moodOptions.find((m) => m.value === selectedMood)?.emoji,
        notes,
      }

      await moodService.logMood(moodData, sessionCompleted ? "session" : null)

      // Track mood log
      await analyticsService.trackEvent(
        "mood_logged",
        {
          mood_score: selectedMood,
          after_session: sessionCompleted,
          has_notes: notes.length > 0,
        },
        "Mood",
      )

      await loadMoodData()

      if (sessionCompleted) {
        router.push("/home")
      } else {
        setSelectedMood(null)
        setNotes("")
      }
    } catch (error) {
      console.error("Error saving mood:", error)
    }

    setLoading(false)
  }

  const getBarHeight = (value: number) => {
    return `${(value / 5) * 100}%`
  }

  const getMoodEmoji = (mood: number) => {
    return moodOptions.find((option) => option.value === mood)?.emoji || "😐"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      weekday: "short",
    })
  }

  if (showHistory) {
    return (
      <div className="mobile-container">
        <div className="app-header">
          <div className="w-full text-center text-xs text-slate-400">DOPAMIND</div>
        </div>

        <div className="p-6 pb-24">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Mood History</h1>
            <Button
              onClick={() => setShowHistory(false)}
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300"
            >
              Back
            </Button>
          </div>

          <div className="space-y-4">
            {moodEntries.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700 p-6 text-center">
                <p className="text-slate-400">No mood entries yet. Start tracking your mood!</p>
              </Card>
            ) : (
              moodEntries.map((entry, index) => (
                <Card key={index} className="bg-slate-800 border-slate-700 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{getMoodEmoji(entry.mood)}</div>
                      <div>
                        <div className="font-semibold text-slate-200">
                          {moodOptions.find((m) => m.value === entry.mood)?.label}
                        </div>
                        <div className="text-sm text-slate-400">{formatDate(entry.timestamp)}</div>
                        {entry.afterSession && <div className="text-xs text-emerald-400 mt-1">After focus session</div>}
                      </div>
                    </div>
                  </div>
                  {entry.notes && (
                    <div className="mt-3 text-sm text-slate-300 bg-slate-700 p-3 rounded-lg">{entry.notes}</div>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>

        <BottomNav currentPage="mood" />
      </div>
    )
  }

  return (
    <div className="mobile-container">
      <div className="app-header">
        <div className="w-full text-center text-xs text-slate-400">DOPAMIND</div>
      </div>

      <div className="p-4 pb-24 overflow-y-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">{sessionCompleted ? "Session Complete!" : "How are you feeling?"}</h1>
          <p className="text-slate-400 text-sm">
            {sessionCompleted
              ? "Great job! How do you feel after your focus session?"
              : "Track your mood and build awareness"}
          </p>
        </div>

        {/* Mood Selector - Optimized for screen fit */}
        <div className="grid grid-cols-5 gap-2 mb-6">
          {moodOptions.map((mood) => (
            <button
              key={mood.value}
              onClick={() => setSelectedMood(mood.value)}
              className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                selectedMood === mood.value
                  ? "bg-emerald-500 scale-105 shadow-lg"
                  : "hover:bg-slate-800 bg-slate-800/50"
              }`}
            >
              <div className="text-2xl mb-1">{mood.emoji}</div>
              <div className="text-xs text-slate-400 text-center leading-tight">{mood.label}</div>
            </button>
          ))}
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-300 mb-2">Notes (optional)</label>
          <Textarea
            placeholder="How are you feeling? What's on your mind?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-emerald-500"
            rows={3}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button
            onClick={() => setShowHistory(true)}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <Calendar className="mr-2" size={16} />
            View History
          </Button>
          <Button
            onClick={saveMood}
            disabled={selectedMood === null || loading}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Mood"}
          </Button>
        </div>

        {/* Mood Chart */}
        <Card className="bg-slate-800 border-slate-700 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-300">Weekly Trend</h3>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-end gap-1 h-16">
            {moodHistory.map((mood, index) => (
              <div
                key={index}
                className="flex-1 bg-emerald-500 rounded-t opacity-70 transition-all"
                style={{ height: getBarHeight(mood) }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </Card>

        {/* Insights */}
        {moodHistory.length > 0 && (
          <Card className="bg-slate-800 border-slate-700 p-4">
            <h3 className="font-semibold text-emerald-400 mb-2">💡 Insight</h3>
            <p className="text-slate-300 text-sm">
              Your mood improves 40% after focus sessions. Keep up the great work!
            </p>
          </Card>
        )}
      </div>

      <BottomNav currentPage="mood" />
    </div>
  )
}
