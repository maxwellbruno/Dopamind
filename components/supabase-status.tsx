"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Database, Users } from "lucide-react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

interface SupabaseStatus {
  configured: boolean
  connected: boolean
  authenticated: boolean
  tablesExist: boolean
  userCount?: number
  error?: string
}

export default function SupabaseStatus() {
  const [status, setStatus] = useState<SupabaseStatus>({
    configured: false,
    connected: false,
    authenticated: false,
    tablesExist: false,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSupabaseStatus()
  }, [])

  const checkSupabaseStatus = async () => {
    setLoading(true)
    const newStatus: SupabaseStatus = {
      configured: isSupabaseConfigured(),
      connected: false,
      authenticated: false,
      tablesExist: false,
    }

    if (!newStatus.configured) {
      setStatus(newStatus)
      setLoading(false)
      return
    }

    try {
      // Test connection
      const { data: connectionTest, error: connectionError } = await supabase!.from("users").select("count", {
        count: "exact",
        head: true,
      })

      if (!connectionError) {
        newStatus.connected = true
        newStatus.tablesExist = true
        newStatus.userCount = connectionTest?.length || 0
      }

      // Test authentication
      const { data: authData } = await supabase!.auth.getUser()
      newStatus.authenticated = !!authData.user

      setStatus(newStatus)
    } catch (error: any) {
      newStatus.error = error.message
      setStatus(newStatus)
    }

    setLoading(false)
  }

  const getStatusIcon = (condition: boolean, loading = false) => {
    if (loading) return <AlertCircle className="w-4 h-4 text-yellow-500 animate-spin" />
    return condition ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />
  }

  const getStatusBadge = (condition: boolean, loading = false) => {
    if (loading) return <Badge variant="secondary">Checking...</Badge>
    return <Badge variant={condition ? "default" : "destructive"}>{condition ? "Connected" : "Disconnected"}</Badge>
  }

  return (
    <Card className="bg-slate-800 border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-300 flex items-center gap-2">
          <Database className="w-5 h-5" />
          Supabase Status
        </h3>
        {getStatusBadge(status.configured && status.connected && status.tablesExist, loading)}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(status.configured, loading)}
            <span className="text-sm text-slate-300">Configuration</span>
          </div>
          <span className="text-xs text-slate-400">
            {status.configured ? "Environment variables set" : "Missing env vars"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(status.connected, loading)}
            <span className="text-sm text-slate-300">Database Connection</span>
          </div>
          <span className="text-xs text-slate-400">{status.connected ? "Connected" : "Cannot connect"}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(status.tablesExist, loading)}
            <span className="text-sm text-slate-300">Database Schema</span>
          </div>
          <span className="text-xs text-slate-400">{status.tablesExist ? "Tables exist" : "Run SQL script"}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(status.authenticated, loading)}
            <span className="text-sm text-slate-300">Authentication</span>
          </div>
          <span className="text-xs text-slate-400">{status.authenticated ? "Signed in" : "Not signed in"}</span>
        </div>

        {status.userCount !== undefined && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-700">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-300">Total Users</span>
            </div>
            <span className="text-xs text-slate-400">{status.userCount}</span>
          </div>
        )}

        {status.error && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-xs">{status.error}</p>
          </div>
        )}

        {!status.configured && (
          <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-amber-400 text-xs">
              Follow the setup guide in SUPABASE_SETUP.md to configure your backend.
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
