"use client"

import type React from "react"

import { useEffect, useState } from "react"

interface ResponsiveLayoutProps {
  children: React.ReactNode
  mobileOnly?: boolean
}

export default function ResponsiveLayout({ children, mobileOnly = false }: ResponsiveLayoutProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  if (!mounted) {
    return <div className="min-h-screen bg-slate-900 text-slate-100">{children}</div>
  }

  if (mobileOnly && !isMobile) {
    // Desktop view for mobile-only components
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <div className="max-w-sm mx-auto bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-700">
          <div className="relative">
            {/* Phone frame */}
            <div className="bg-slate-900 h-6 flex items-center justify-center">
              <div className="w-16 h-1 bg-slate-600 rounded-full"></div>
            </div>
            {children}
          </div>
        </div>
      </div>
    )
  }

  return <div className="min-h-screen bg-slate-900 text-slate-100">{children}</div>
}
