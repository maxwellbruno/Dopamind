"use client"

import { useState } from "react"
import { Bell, Menu, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth/auth-provider"

interface AppHeaderProps {
  title?: string
  showSearch?: boolean
  showNotifications?: boolean
  showMenu?: boolean
}

export default function AppHeader({
  title = "Dopamind",
  showSearch = false,
  showNotifications = true,
  showMenu = false,
}: AppHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const { user } = useAuth()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  return (
    <header className="w-full">
      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{title}</h1>
            {user && (
              <p className="text-sm text-slate-400">
                {getGreeting()}, {user.name}!
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {showSearch && (
              <Button variant="ghost" size="sm" onClick={() => setSearchOpen(!searchOpen)} className="text-slate-400">
                <Search size={20} />
              </Button>
            )}
            {showNotifications && (
              <Button variant="ghost" size="sm" className="text-slate-400 relative">
                <Bell size={20} />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 bg-red-500 text-xs">3</Badge>
              </Button>
            )}
            {showMenu && (
              <Button variant="ghost" size="sm" className="text-slate-400">
                <Menu size={20} />
              </Button>
            )}
          </div>
        </div>
        {searchOpen && (
          <div className="mt-4">
            <Input placeholder="Search..." className="bg-slate-800 border-slate-600" />
          </div>
        )}
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            {user && (
              <p className="text-slate-400 mt-1">
                {getGreeting()}, {user.name}!
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                <Input placeholder="Search..." className="pl-10 w-64 bg-slate-800 border-slate-600" />
              </div>
            )}
            {showNotifications && (
              <Button variant="ghost" className="text-slate-400 relative">
                <Bell size={20} />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 bg-red-500 text-xs">3</Badge>
              </Button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <span className="text-sm font-medium">{user?.name || "User"}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
