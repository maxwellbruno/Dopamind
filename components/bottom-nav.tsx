"use client"

import { useRouter } from "next/navigation"
import { Home, Timer, Smile, User } from "lucide-react"

interface BottomNavProps {
  currentPage: "home" | "focus" | "mood" | "profile"
}

export default function BottomNav({ currentPage }: BottomNavProps) {
  const router = useRouter()

  const navItems = [
    { id: "home", icon: Home, label: "Home", path: "/home" },
    { id: "focus", icon: Timer, label: "Focus", path: "/focus" },
    { id: "mood", icon: Smile, label: "Mood", path: "/mood" },
    { id: "profile", icon: User, label: "Profile", path: "/profile" },
  ]

  return (
    <div className="bottom-nav">
      <div className="nav-grid">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => router.push(item.path)}
            className={`nav-item ${currentPage === item.id ? "active" : ""}`}
          >
            <item.icon size={20} />
            <span className="text-xs font-semibold">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
