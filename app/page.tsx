"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import PlatformInfo from "@/components/platform-info"

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => router.push("/auth/signup"), 500)
          return 100
        }
        return prev + 2
      })
    }, 50)

    return () => clearInterval(interval)
  }, [router])

  return (
    <div className="mobile-container">
      <div className="app-header">
        <div className="w-full text-center text-xs text-slate-400">DOPAMIND</div>
      </div>

      <div className="flex flex-col items-center justify-center h-full px-8 text-center">
        <div className="w-32 h-32 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center text-6xl mb-8 shadow-lg shadow-emerald-500/30">
          🧠
        </div>

        <h1 className="text-4xl font-bold mb-3">Dopamind</h1>
        <p className="text-slate-400 text-lg mb-16">Rebalance Your Digital Life</p>

        <div className="w-48 h-1 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        <PlatformInfo />
      </div>
    </div>
  )
}
