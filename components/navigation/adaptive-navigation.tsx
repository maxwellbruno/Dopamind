"use client"

import { useRouter, usePathname } from "next/navigation"
import { Home, Timer, Smile, User, Settings, Bell, Crown } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface NavigationProps {
  currentPage?: "home" | "focus" | "mood" | "profile"
  layout?: "mobile" | "desktop"
}

export default function AdaptiveNavigation({ currentPage, layout = "mobile" }: NavigationProps) {
  const router = useRouter()
  const pathname = usePathname()

  const navItems = [
    { id: "home", icon: Home, label: "Home", path: "/home" },
    { id: "focus", icon: Timer, label: "Focus", path: "/focus" },
    { id: "mood", icon: Smile, label: "Mood", path: "/mood" },
    { id: "profile", icon: User, label: "Profile", path: "/profile" },
  ]

  const secondaryItems = [
    { id: "settings", icon: Settings, label: "Settings", path: "/settings" },
    { id: "notifications", icon: Bell, label: "Notifications", path: "/notifications" },
    { id: "upgrade", icon: Crown, label: "Upgrade", path: "/upgrade", highlight: true },
  ]

  const isActive = (path: string) => pathname === path

  // Desktop Navigation
  if (layout === "desktop") {
    return (
      <nav className="space-y-6">
        {/* Primary Navigation */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider px-4">Navigation</h3>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={`nav-item w-full ${isActive(item.path) ? "active" : ""}`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Secondary Navigation */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider px-4">More</h3>
          {secondaryItems.map((item) => (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={`nav-item w-full ${isActive(item.path) ? "active" : ""} ${
                item.highlight ? "text-amber-400 hover:text-amber-300" : ""
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
              {item.highlight && <Badge className="bg-amber-500 text-black text-xs">PRO</Badge>}
            </button>
          ))}
        </div>
      </nav>
    )
  }

  // Mobile Navigation
  return (
    <div className="mobile-nav-grid">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => router.push(item.path)}
          className={`nav-item ${isActive(item.path) ? "active" : ""}`}
        >
          <item.icon size={20} />
          <span className="text-xs font-semibold">{item.label}</span>
        </button>
      ))}
    </div>
  )
}
