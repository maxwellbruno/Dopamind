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
import { Mail, Eye, EyeOff } from "lucide-react"

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const { signUp, signInWithProvider } = useAuth()

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Name is required")
      return false
    }
    if (!formData.email.trim()) {
      setError("Email is required")
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const { error: signUpError } = await signUp(formData.email, formData.password, {
        fullName: formData.name,
      })

      if (signUpError) {
        if (signUpError.message?.includes("already registered")) {
          setError("An account with this email already exists. Please sign in instead.")
        } else if (signUpError.message?.includes("email confirmation")) {
          setSuccess("Please check your email and click the confirmation link to complete your registration.")
          // Redirect to confirmation page
          setTimeout(() => {
            router.push(`/auth/confirm?type=pending&email=${encodeURIComponent(formData.email)}`)
          }, 2000)
        } else {
          throw signUpError
        }
      } else {
        if (isSupabaseConfigured()) {
          setSuccess("Account created! Please check your email for a confirmation link.")
          setTimeout(() => {
            router.push(`/auth/confirm?type=pending&email=${encodeURIComponent(formData.email)}`)
          }, 2000)
        } else {
          // Demo mode - go directly to onboarding
          router.push("/onboarding")
        }
      }
    } catch (error: any) {
      setError(error.message || "Failed to create account. Please try again.")
    }

    setLoading(false)
  }

  const handleGoogleSignUp = async () => {
    try {
      const { error } = await signInWithProvider("google")
      if (error) {
        setError("Google sign up failed. Please try again.")
      }
    } catch (error: any) {
      setError("Google sign up is not available in demo mode.")
    }
  }

  const handleDemoSignup = () => {
    setFormData({
      name: "Demo User",
      email: "demo@dopamind.app",
      password: "demo123",
      confirmPassword: "demo123",
    })
  }

  return (
    <div className="app-container">
      <div className="app-header">
        <div className="w-full text-center text-xs text-slate-400">DOPAMIND</div>
      </div>

      <div className="p-6 pt-8 max-w-md mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3">Create Account</h1>
          <p className="text-slate-400">Start your digital wellness journey</p>
          {!isSupabaseConfigured() && (
            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-amber-400 text-sm">Demo Mode - No email confirmation required</p>
            </div>
          )}
        </div>

        {error && (
          <Alert className="mb-6 border-red-500 bg-red-500/10">
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-500 bg-green-500/10">
            <Mail className="h-4 w-4" />
            <AlertDescription className="text-green-400">{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name" className="text-slate-300 font-semibold">
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-2 bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-emerald-500"
              required
            />
          </div>

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
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create password (min. 6 characters)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-2 bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 pr-10"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="text-slate-300 font-semibold">
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="mt-2 bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 pr-10"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-4 text-lg disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>

          {!isSupabaseConfigured() && (
            <Button
              type="button"
              onClick={handleDemoSignup}
              variant="outline"
              className="w-full border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white font-semibold py-4 text-lg"
            >
              Try Demo Account
            </Button>
          )}

          {isSupabaseConfigured() && (
            <Button
              type="button"
              onClick={handleGoogleSignUp}
              variant="outline"
              className="w-full border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white font-semibold py-4 text-lg"
            >
              Continue with Google
            </Button>
          )}
        </form>

        <div className="text-center mt-6 text-slate-400">
          Already have an account?{" "}
          <button
            onClick={() => router.push("/auth/signin")}
            className="text-emerald-500 font-semibold hover:text-emerald-400"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  )
}
