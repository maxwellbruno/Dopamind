"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Pause, Play, Square, Volume2, VolumeX, Settings } from "lucide-react"
import ResponsiveLayout from "@/components/layout/responsive-layout"
import AdaptiveNavigation from "@/components/navigation/adaptive-navigation"
import AppHeader from "@/components/layout/app-header"
import SidebarContent from "@/components/layout/sidebar-content"
import { sessionService } from "@/lib/services/session-service"
import { analyticsService } from "@/lib/services/analytics-service"

export default function FocusPage() {
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionDuration, setSessionDuration] = useState(25)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [selectedAmbient, setSelectedAmbient] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  useEffect(() => {
    analyticsService.trackEvent("page_view", {}, "Focus")
  }, [])

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            handleSessionComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  const handleSessionComplete = async () => {
    if (currentSessionId) {
      const actualDuration = sessionDuration - Math.floor(timeLeft / 60)
      await sessionService.completeSession(currentSessionId, actualDuration)

      await analyticsService.trackSessionEvent("session_complete", {
        duration: actualDuration,
        type: "focus",
        completed: true,
        interruptions: 0,
      })
    }

    router.push("/mood?completed=true")
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const toggleTimer = async () => {
    if (!isRunning && !currentSessionId) {
      const { data: session } = await sessionService.startSession(sessionDuration, "focus")
      if (session) {
        setCurrentSessionId(session.id)
        await analyticsService.trackSessionEvent("session_start", {
          duration: sessionDuration,
          type: "focus",
          completed: false,
          interruptions: 0,
        })
      }
    }

    setIsRunning(!isRunning)
  }

  const stopTimer = async () => {
    setIsRunning(false)
    setTimeLeft(sessionDuration * 60)

    if (currentSessionId) {
      await analyticsService.trackSessionEvent("session_stop", {
        duration: sessionDuration - Math.floor(timeLeft / 60),
        type: "focus",
        completed: false,
        interruptions: 1,
      })

      setCurrentSessionId(null)
    }
  }

  const setDuration = (minutes: number) => {
    if (!isRunning) {
      setSessionDuration(minutes)
      setTimeLeft(minutes * 60)
    }
  }

  const progress = ((sessionDuration * 60 - timeLeft) / (sessionDuration * 60)) * 100

  const ambientSounds = [
    { id: "ocean", name: "Ocean Waves", emoji: "🌊" },
    { id: "forest", name: "Forest", emoji: "🌲" },
    { id: "rain", name: "Rain", emoji: "☔" },
    { id: "fireplace", name: "Fireplace", emoji: "🔥" },
    { id: "cafe", name: "Coffee Shop", emoji: "☕" },
    { id: "white-noise", name: "White Noise", emoji: "📻" },
  ]

  return (
    <ResponsiveLayout
      header={<AppHeader title="Focus Session" showNotifications />}
      sidebar={<SidebarContent />}
      navigation={<AdaptiveNavigation currentPage="focus" layout="desktop" />}
    >
      <div className="space-y-6">
        {/* Session Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-responsive-xl font-bold mb-2">Focus Session</h1>
            <p className="text-slate-400">
              {isRunning
                ? "Stay focused, you're doing great!"
                : timeLeft === 0
                  ? "Session complete! Great job!"
                  : "Ready to start your focus session?"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="border-slate-600 text-slate-300"
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </Button>
            <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
              <Settings size={16} />
            </Button>
          </div>
        </div>

        {/* Duration Selection */}
        {!isRunning && (
          <Card className="mobile-card">
            <h3 className="font-semibold text-slate-300 mb-4">Session Duration</h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {[15, 25, 30, 45, 60, 90].map((duration) => (
                <Button
                  key={duration}
                  variant={sessionDuration === duration ? "default" : "outline"}
                  onClick={() => setDuration(duration)}
                  className={
                    sessionDuration === duration
                      ? "bg-emerald-500 hover:bg-emerald-600"
                      : "border-slate-600 text-slate-300"
                  }
                >
                  {duration}m
                </Button>
              ))}
            </div>
          </Card>
        )}

        {/* Main Timer */}
        <Card className="mobile-card">
          <div className="flex flex-col items-center justify-center">
            <div className="timer-container mb-8">
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
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                    className="text-emerald-500 transition-all duration-1000"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-4xl sm:text-5xl lg:text-6xl font-light font-mono text-slate-100">
                    {formatTime(timeLeft)}
                  </div>
                </div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex gap-4 mb-6">
              <Button
                onClick={toggleTimer}
                size="lg"
                className={`w-16 h-16 rounded-full ${
                  isRunning ? "bg-amber-500 hover:bg-amber-600" : "bg-emerald-500 hover:bg-emerald-600"
                }`}
              >
                {isRunning ? <Pause size={24} /> : <Play size={24} />}
              </Button>
              <Button
                onClick={stopTimer}
                size="lg"
                variant="destructive"
                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600"
              >
                <Square size={24} />
              </Button>
            </div>

            {/* Session Info */}
            <div className="text-center">
              <div className="text-slate-400 text-sm">
                {sessionDuration} minute {isRunning ? "focus session" : "session ready"}
              </div>
              {isRunning && (
                <div className="text-emerald-400 text-xs mt-1">
                  {Math.floor(((sessionDuration * 60 - timeLeft) / (sessionDuration * 60)) * 100)}% complete
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Ambient Sounds */}
        {soundEnabled && (
          <Card className="mobile-card">
            <h3 className="font-semibold text-slate-300 mb-4">Ambient Sounds</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {ambientSounds.map((sound) => (
                <Button
                  key={sound.id}
                  variant={selectedAmbient === sound.id ? "default" : "outline"}
                  onClick={() => setSelectedAmbient(selectedAmbient === sound.id ? null : sound.id)}
                  className={`flex flex-col items-center gap-2 h-auto py-4 ${
                    selectedAmbient === sound.id
                      ? "bg-emerald-500 hover:bg-emerald-600"
                      : "border-slate-600 text-slate-300"
                  }`}
                >
                  <span className="text-2xl">{sound.emoji}</span>
                  <span className="text-xs">{sound.name}</span>
                </Button>
              ))}
            </div>
          </Card>
        )}

        {/* Session Tips */}
        <Card className="mobile-card border-l-4 border-l-blue-500">
          <h3 className="font-semibold text-blue-400 mb-3">💡 Focus Tips</h3>
          <div className="space-y-2 text-slate-300 text-sm">
            <p>• Put your phone in another room or use airplane mode</p>
            <p>• Close unnecessary browser tabs and applications</p>
            <p>• Have water and any needed materials ready</p>
            <p>• Set a clear intention for what you want to accomplish</p>
          </div>
        </Card>
      </div>
    </ResponsiveLayout>
  )
}
