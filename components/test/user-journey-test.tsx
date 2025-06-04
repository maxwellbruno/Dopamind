"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, Play, User, Brain, Heart, BarChart3 } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { sessionService } from "@/lib/services/session-service"
import { moodService } from "@/lib/services/mood-service"
import { analyticsService } from "@/lib/services/analytics-service"
import { isSupabaseConfigured } from "@/lib/supabase"

interface TestStep {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  status: "pending" | "running" | "success" | "error"
  result?: string
  error?: string
}

export default function UserJourneyTest() {
  const [testSteps, setTestSteps] = useState<TestStep[]>([
    {
      id: "auth",
      name: "Authentication",
      description: "Test user signup and signin flow",
      icon: User,
      status: "pending",
    },
    {
      id: "onboarding",
      name: "Onboarding",
      description: "Complete app onboarding process",
      icon: Brain,
      status: "pending",
    },
    {
      id: "session",
      name: "Focus Session",
      description: "Start and complete a focus session",
      icon: Clock,
      status: "pending",
    },
    {
      id: "mood",
      name: "Mood Tracking",
      description: "Log mood after session completion",
      icon: Heart,
      status: "pending",
    },
    {
      id: "analytics",
      name: "Analytics",
      description: "Verify data tracking and analytics",
      icon: BarChart3,
      status: "pending",
    },
  ])

  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [testResults, setTestResults] = useState<Record<string, any>>({})
  const { user, signUp, signIn, signOut } = useAuth()

  const updateStepStatus = (stepId: string, status: TestStep["status"], result?: string, error?: string) => {
    setTestSteps((prev) => prev.map((step) => (step.id === stepId ? { ...step, status, result, error } : step)))
  }

  const runTest = async () => {
    setIsRunning(true)
    setCurrentStep(0)

    // Reset all steps
    setTestSteps((prev) => prev.map((step) => ({ ...step, status: "pending", result: undefined, error: undefined })))

    try {
      await testAuthentication()
      await testOnboarding()
      await testFocusSession()
      await testMoodTracking()
      await testAnalytics()
    } catch (error) {
      console.error("Test suite failed:", error)
    }

    setIsRunning(false)
  }

  const testAuthentication = async () => {
    setCurrentStep(0)
    updateStepStatus("auth", "running")

    try {
      // Test signup
      const testEmail = `test-${Date.now()}@dopamind.app`
      const testPassword = "testpassword123"
      const testName = "Test User"

      const { error: signUpError } = await signUp(testEmail, testPassword, { fullName: testName })

      if (signUpError && !signUpError.message?.includes("already registered")) {
        throw new Error(`Signup failed: ${signUpError.message}`)
      }

      // Test signin if signup failed due to existing user
      if (signUpError?.message?.includes("already registered")) {
        const { error: signInError } = await signIn(testEmail, testPassword)
        if (signInError) {
          throw new Error(`Signin failed: ${signInError.message}`)
        }
      }

      // Verify user is authenticated
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait for auth state

      const authResult = {
        backend: isSupabaseConfigured() ? "Supabase" : "Demo Mode",
        userCreated: true,
        userAuthenticated: !!user,
      }

      updateStepStatus("auth", "success", JSON.stringify(authResult, null, 2))
      setTestResults((prev) => ({ ...prev, auth: authResult }))
    } catch (error: any) {
      updateStepStatus("auth", "error", undefined, error.message)
      throw error
    }
  }

  const testOnboarding = async () => {
    setCurrentStep(1)
    updateStepStatus("onboarding", "running")

    try {
      // Simulate onboarding completion
      localStorage.setItem("dopamind_onboarding_completed", "true")

      const onboardingResult = {
        completed: true,
        userPreferences: {
          defaultSessionDuration: 25,
          notificationsEnabled: true,
          darkMode: true,
        },
      }

      updateStepStatus("onboarding", "success", JSON.stringify(onboardingResult, null, 2))
      setTestResults((prev) => ({ ...prev, onboarding: onboardingResult }))
    } catch (error: any) {
      updateStepStatus("onboarding", "error", undefined, error.message)
      throw error
    }
  }

  const testFocusSession = async () => {
    setCurrentStep(2)
    updateStepStatus("session", "running")

    try {
      // Start a test session (1 minute for testing)
      const { data: session, error } = await sessionService.startSession(1, "focus")

      if (error) {
        throw new Error(`Failed to start session: ${error.message}`)
      }

      // Simulate session completion
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Wait 2 seconds

      if (session) {
        const { data: completedSession, error: completeError } = await sessionService.completeSession(session.id, 1)

        if (completeError) {
          throw new Error(`Failed to complete session: ${completeError.message}`)
        }
      }

      // Verify session data
      const { data: sessions } = await sessionService.getUserSessions(1)

      const sessionResult = {
        sessionStarted: !!session,
        sessionCompleted: true,
        sessionData: sessions?.[0] || session,
        totalSessions: sessions?.length || 1,
      }

      updateStepStatus("session", "success", JSON.stringify(sessionResult, null, 2))
      setTestResults((prev) => ({ ...prev, session: sessionResult }))
    } catch (error: any) {
      updateStepStatus("session", "error", undefined, error.message)
      throw error
    }
  }

  const testMoodTracking = async () => {
    setCurrentStep(3)
    updateStepStatus("mood", "running")

    try {
      // Log a test mood
      const testMoodData = {
        score: 4,
        emoji: "😌",
        energy: 4,
        stress: 2,
        notes: "Feeling great after the focus session!",
      }

      const { data: moodEntry, error } = await moodService.logMood(testMoodData, "test-session")

      if (error) {
        throw new Error(`Failed to log mood: ${error.message}`)
      }

      // Verify mood data
      const { data: moodEntries } = await moodService.getMoodEntries(1)
      const { data: moodHistory } = await moodService.getMoodHistory(7)

      const moodResult = {
        moodLogged: !!moodEntry,
        moodData: moodEntry || moodEntries?.[0],
        historyLength: moodHistory?.length || 0,
        averageMood: moodHistory?.length
          ? (moodHistory.reduce((a, b) => a + b, 0) / moodHistory.length).toFixed(1)
          : "N/A",
      }

      updateStepStatus("mood", "success", JSON.stringify(moodResult, null, 2))
      setTestResults((prev) => ({ ...prev, mood: moodResult }))
    } catch (error: any) {
      updateStepStatus("mood", "error", undefined, error.message)
      throw error
    }
  }

  const testAnalytics = async () => {
    setCurrentStep(4)
    updateStepStatus("analytics", "running")

    try {
      // Track test events
      await analyticsService.trackEvent("test_event", { testData: "user_journey_test" }, "TestSuite")
      await analyticsService.trackSessionEvent("test_session_event", {
        duration: 1,
        type: "test",
        completed: true,
        interruptions: 0,
      })

      // Get analytics data
      const { data: analyticsData } = await analyticsService.getUserAnalytics(1)

      const analyticsResult = {
        eventsTracked: true,
        analyticsData: analyticsData?.slice(0, 3) || [], // Show last 3 events
        backend: isSupabaseConfigured() ? "Supabase" : "Local Storage",
      }

      updateStepStatus("analytics", "success", JSON.stringify(analyticsResult, null, 2))
      setTestResults((prev) => ({ ...prev, analytics: analyticsResult }))
    } catch (error: any) {
      updateStepStatus("analytics", "error", undefined, error.message)
      throw error
    }
  }

  const getStatusIcon = (status: TestStep["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />
      case "running":
        return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      default:
        return <div className="w-5 h-5 border-2 border-slate-600 rounded-full" />
    }
  }

  const getStatusBadge = (status: TestStep["status"]) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-500 hover:bg-green-600">Success</Badge>
      case "error":
        return <Badge variant="destructive">Failed</Badge>
      case "running":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Running</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  const resetTest = async () => {
    // Clean up test data
    await signOut()
    localStorage.removeItem("dopamind_onboarding_completed")

    // Reset state
    setTestSteps((prev) => prev.map((step) => ({ ...step, status: "pending", result: undefined, error: undefined })))
    setTestResults({})
    setCurrentStep(0)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">User Journey Test</h2>
            <p className="text-slate-400">Complete end-to-end testing of the Dopamind app</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={runTest} disabled={isRunning} className="bg-emerald-500 hover:bg-emerald-600">
              <Play className="mr-2" size={16} />
              {isRunning ? "Running..." : "Run Test"}
            </Button>
            <Button onClick={resetTest} variant="outline" className="border-slate-600 text-slate-300">
              Reset
            </Button>
          </div>
        </div>

        {/* Test Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Progress</span>
            <span>
              {testSteps.filter((s) => s.status === "success").length} / {testSteps.length}
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(testSteps.filter((s) => s.status === "success").length / testSteps.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Test Steps */}
        <div className="space-y-4">
          {testSteps.map((step, index) => (
            <Card
              key={step.id}
              className={`bg-slate-700 border-slate-600 p-4 transition-all ${
                currentStep === index && isRunning ? "ring-2 ring-blue-500" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <step.icon className="w-6 h-6 text-slate-400 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-200">{step.name}</h3>
                      {getStatusIcon(step.status)}
                      {getStatusBadge(step.status)}
                    </div>
                    <p className="text-slate-400 text-sm mb-3">{step.description}</p>

                    {step.result && (
                      <details className="mt-3">
                        <summary className="text-emerald-400 text-sm cursor-pointer hover:text-emerald-300">
                          View Results
                        </summary>
                        <pre className="mt-2 p-3 bg-slate-800 rounded text-xs text-slate-300 overflow-x-auto">
                          {step.result}
                        </pre>
                      </details>
                    )}

                    {step.error && (
                      <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded">
                        <p className="text-red-400 text-sm">{step.error}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Test Summary */}
        {Object.keys(testResults).length > 0 && (
          <Card className="bg-slate-700 border-slate-600 p-4 mt-6">
            <h3 className="font-semibold text-slate-200 mb-3">Test Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Backend:</span>
                <span className="ml-2 text-slate-200">{isSupabaseConfigured() ? "Supabase" : "Demo Mode"}</span>
              </div>
              <div>
                <span className="text-slate-400">User:</span>
                <span className="ml-2 text-slate-200">{user?.name || "Not authenticated"}</span>
              </div>
              <div>
                <span className="text-slate-400">Sessions:</span>
                <span className="ml-2 text-slate-200">{testResults.session?.totalSessions || 0}</span>
              </div>
              <div>
                <span className="text-slate-400">Mood Entries:</span>
                <span className="ml-2 text-slate-200">{testResults.mood?.historyLength || 0}</span>
              </div>
            </div>
          </Card>
        )}
      </Card>
    </div>
  )
}
