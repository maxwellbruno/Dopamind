"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TestTube, Database, Smartphone, Globe, AlertTriangle, Zap } from "lucide-react"
import { useRouter } from "next/navigation"
import UserJourneyTest from "@/components/test/user-journey-test"
import SupabaseStatus from "@/components/supabase-status"
import ErrorScanner from "@/components/diagnostics/error-scanner"
import LiveErrorScanner from "@/components/diagnostics/live-error-scanner"
import { isSupabaseConfigured } from "@/lib/supabase"

export default function TestPage() {
  const [activeTest, setActiveTest] = useState<"journey" | "status" | "diagnostics" | "live-scan" | null>(null)
  const router = useRouter()

  const testSuites = [
    {
      id: "live-scan",
      name: "Live Error Scanner",
      description: "Real-time diagnostic analysis with automated fixes and code examples",
      icon: Zap,
      status: "ready",
      featured: true,
    },
    {
      id: "journey",
      name: "User Journey Test",
      description: "Complete end-to-end user flow from signup to session completion",
      icon: TestTube,
      status: "ready",
    },
    {
      id: "status",
      name: "System Status",
      description: "Check backend connectivity and database status",
      icon: Database,
      status: isSupabaseConfigured() ? "connected" : "demo",
    },
    {
      id: "diagnostics",
      name: "Basic Error Scanner",
      description: "Basic error detection and fix suggestions",
      icon: AlertTriangle,
      status: "ready",
    },
  ]

  return (
    <div className="app-container">
      <div className="app-header">
        <div className="w-full text-center text-xs text-slate-400">DOPAMIND - TEST SUITE</div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Button onClick={() => router.back()} variant="outline" size="sm" className="border-slate-600 text-slate-300">
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Test Suite</h1>
            <p className="text-slate-400">Comprehensive app testing and diagnostic tools</p>
          </div>
        </div>

        {/* Platform Info */}
        <Card className="bg-slate-800 border-slate-700 p-4 mb-6">
          <h3 className="font-semibold text-slate-300 mb-3">Platform Status</h3>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-emerald-500 hover:bg-emerald-600">
              <Globe className="w-3 h-3 mr-1" />
              Web App
            </Badge>
            <Badge variant="outline" className="border-slate-600 text-slate-400">
              <Smartphone className="w-3 h-3 mr-1" />
              iOS (PWA)
            </Badge>
            <Badge variant="outline" className="border-slate-600 text-slate-400">
              <Smartphone className="w-3 h-3 mr-1" />
              Android (PWA)
            </Badge>
            <Badge className={isSupabaseConfigured() ? "bg-green-500" : "bg-amber-500"}>
              {isSupabaseConfigured() ? "Supabase" : "Demo Mode"}
            </Badge>
          </div>
        </Card>

        {/* Test Suites */}
        {!activeTest && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-200">Available Tests</h2>
            {testSuites.map((suite) => (
              <Card
                key={suite.id}
                className={`bg-slate-800 border-slate-700 p-6 cursor-pointer hover:bg-slate-750 transition-colors ${
                  suite.featured ? "ring-2 ring-blue-500/50" : ""
                }`}
                onClick={() => setActiveTest(suite.id as any)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <suite.icon className={`w-8 h-8 mt-1 ${suite.featured ? "text-blue-400" : "text-emerald-400"}`} />
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-200">{suite.name}</h3>
                        {suite.featured && <Badge className="bg-blue-500 hover:bg-blue-600 text-xs">NEW</Badge>}
                      </div>
                      <p className="text-slate-400 text-sm">{suite.description}</p>
                    </div>
                  </div>
                  <Badge
                    className={
                      suite.status === "connected"
                        ? "bg-green-500"
                        : suite.status === "demo"
                          ? "bg-amber-500"
                          : "bg-blue-500"
                    }
                  >
                    {suite.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Active Test */}
        {activeTest === "live-scan" && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Button
                onClick={() => setActiveTest(null)}
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300"
              >
                <ArrowLeft size={16} />
              </Button>
              <h2 className="text-xl font-semibold text-slate-200">Live Error Scanner</h2>
            </div>
            <LiveErrorScanner />
          </div>
        )}

        {activeTest === "journey" && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Button
                onClick={() => setActiveTest(null)}
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300"
              >
                <ArrowLeft size={16} />
              </Button>
              <h2 className="text-xl font-semibold text-slate-200">User Journey Test</h2>
            </div>
            <UserJourneyTest />
          </div>
        )}

        {activeTest === "status" && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Button
                onClick={() => setActiveTest(null)}
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300"
              >
                <ArrowLeft size={16} />
              </Button>
              <h2 className="text-xl font-semibold text-slate-200">System Status</h2>
            </div>
            <SupabaseStatus />
          </div>
        )}

        {activeTest === "diagnostics" && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Button
                onClick={() => setActiveTest(null)}
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300"
              >
                <ArrowLeft size={16} />
              </Button>
              <h2 className="text-xl font-semibold text-slate-200">Basic Error Scanner</h2>
            </div>
            <ErrorScanner />
          </div>
        )}

        {/* Quick Actions */}
        {!activeTest && (
          <Card className="bg-slate-800 border-slate-700 p-6 mt-6">
            <h3 className="font-semibold text-slate-300 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => router.push("/auth/signup")}
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                Test Signup
              </Button>
              <Button
                onClick={() => router.push("/auth/signin")}
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                Test Signin
              </Button>
              <Button
                onClick={() => router.push("/focus")}
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                Test Focus
              </Button>
              <Button
                onClick={() => router.push("/mood")}
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                Test Mood
              </Button>
            </div>
          </Card>
        )}

        {/* Test Instructions */}
        {!activeTest && (
          <Card className="bg-slate-800 border-l-4 border-l-blue-500 border-slate-700 p-6 mt-6">
            <h3 className="font-semibold text-blue-400 mb-3">🚀 New: Live Error Scanner</h3>
            <div className="space-y-2 text-slate-300 text-sm">
              <p>
                • <strong>Real-time Analysis:</strong> Advanced diagnostic engine with live health scoring
              </p>
              <p>
                • <strong>Automated Fixes:</strong> Copy-paste code solutions for common issues
              </p>
              <p>
                • <strong>Security Checks:</strong> Comprehensive security and performance analysis
              </p>
              <p>
                • <strong>PWA Validation:</strong> Progressive Web App feature verification
              </p>
              <p>
                • <strong>Accessibility:</strong> UI component accessibility testing
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
