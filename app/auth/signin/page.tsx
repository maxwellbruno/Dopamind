"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/components/auth/auth-provider"
import { isSupabaseConfigured } from "@/lib/supabase"

export default function SignInPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { signIn, signInWithProvider } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { error: signInError } = await signIn(formData.email, formData.password)

      if (signInError) {
        throw signInError
      }

      router.push("/home")
    } catch (error: any) {
      setError(error.message || "Authentication failed")
    }

    setLoading(false)
  }

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await signInWithProvider("google")

      if (error) {
        setError("Google sign in failed")
      }
    } catch (error: any) {
      setError("Google sign in not available")
    }
  }

  const handleDemoLogin = () => {
    setFormData({
      email: "demo@dopamind.app",
      password: "demo123",
    })
  }

  return (
    <div className="mobile-container">
      <div className="app-header">
        <div className="w-full text-center text-xs text-slate-400">DOPAMIND</div>
      </div>

      <div className="p-6 pt-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3">Welcome Back</h1>
          <p className="text-slate-400">Continue your focus journey</p>
          {!isSupabaseConfigured() && (
            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-amber-400 text-sm">Demo Mode - No backend configured</p>
            </div>
          )}
        </div>

        {error && (
          <Alert className="mb-6 border-red-500 bg-red-500/10">
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email" className="text-slate-300 font-semibold">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-2 bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-slate-300 font-semibold">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="mt-2 bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-emerald-500"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-4 text-lg disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>

          {!isSupabaseConfigured() && (
            <Button
              type="button"
              onClick={handleDemoLogin}
              variant="outline"
              className="w-full border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white font-semibold py-4 text-lg"
            >
              Try Demo Login
            </Button>
          )}

          {isSupabaseConfigured() && (
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white font-semibold py-4 text-lg"
            >
              Continue with Google
            </Button>
          )}
        </form>

        <div className="text-center mt-6 text-slate-400">
          {"Don't have an account?"}{" "}
          <button
            onClick={() => router.push("/auth/signup")}
            className="text-emerald-500 font-semibold hover:text-emerald-400"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  )
}
