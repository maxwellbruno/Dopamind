"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

interface ResponsiveLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  navigation?: React.ReactNode
  header?: React.ReactNode
}

export default function ResponsiveLayout({ children, sidebar, navigation, header }: ResponsiveLayoutProps) {
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">("mobile")
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
    const updateScreenSize = () => {
      const width = window.innerWidth
      if (width < 768) {
        setScreenSize("mobile")
      } else if (width < 1024) {
        setScreenSize("tablet")
      } else {
        setScreenSize("desktop")
      }
    }

    updateScreenSize()
    window.addEventListener("resize", updateScreenSize)
    return () => window.removeEventListener("resize", updateScreenSize)
  }, [])

  if (!mounted) {
    return (
      <div className="app-container">
        <div className="flex items-center justify-center min-h-screen">
          <div className="loading-spinner" />
        </div>
      </div>
    )
  }

  // Desktop Layout
  if (screenSize === "desktop") {
    return (
      <div className="app-container">
        <div className="desktop-layout responsive-container">
          {/* Desktop Sidebar */}
          {sidebar && (
            <aside className="desktop-sidebar-area">
              <div className="sticky top-6 space-y-6">
                {header && <div className="desktop-content-card">{header}</div>}
                {sidebar}
                {navigation && <div className="desktop-content-card">{navigation}</div>}
              </div>
            </aside>
          )}

          {/* Main Content */}
          <main className="desktop-main-area">
            <div className="desktop-content-card min-h-[calc(100vh-3rem)]">{children}</div>
          </main>
        </div>
      </div>
    )
  }

  // Tablet Layout
  if (screenSize === "tablet") {
    return (
      <div className="app-container">
        <div className="responsive-container spacing-responsive">
          {header && <div className="mobile-card">{header}</div>}
          <div className="tablet-layout">
            <div className="tablet-full">{children}</div>
          </div>
          {navigation && <div className="mobile-card">{navigation}</div>}
        </div>
      </div>
    )
  }

  // Mobile Layout
  return (
    <div className="app-container">
      <div className="responsive-container">
        {header && <div className="app-header">{header}</div>}
        <div className="spacing-responsive pb-24">{children}</div>
        {navigation && <div className="bottom-nav">{navigation}</div>}
      </div>
    </div>
  )
}
