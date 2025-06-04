"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, XCircle, Mail, RefreshCw } from "lucide-react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

export default function EmailConfirmation() {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "pending">("loading")
  const [message, setMessage] = useState("")
  const [email, setEmail] = useState("")
  const [resending, setResending] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get("token")
    const type = searchParams.get("type")
    const userEmail = searchParams.get("email")

    if (userEmail) {
      setEmail(userEmail)
    }

    if (token && type === "signup") {
      confirmEmail(token)
    } else if (type === "pending") {
      setStatus("pending")
      setMessage("Please check your email and click the confirmation link.")
    } else {
      setStatus("error")
      setMessage("Invalid confirmation link.")
    }
  }, [searchParams])

  const confirmEmail = async (token: string) => {
    if (!isSupabaseConfigured() || !supabase) {
      // Demo mode - auto confirm
      setStatus("success")
      setMessage("Email confirmed successfully! (Demo mode)")
      setTimeout(() => router.push("/onboarding"), 2000)
      return
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: "signup",
      })

      if (error) {
        throw error
      }

      setStatus("success")
      setMessage("Email confirmed successfully! Redirecting to onboarding...")
      setTimeout(() => router.push("/onboarding"), 2000)
    } catch (error: any) {
      setStatus("error")
      setMessage(error.message || "Failed to confirm email. Please try again.")
    }
  }

  const resendConfirmation = async () => {
    if (!email || !isSupabaseConfigured() || !supabase) {
      setMessage("Cannot resend confirmation in demo mode.")
      return
    }

    setResending(true)
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      })

      if (error) {
        throw error
      }

      setMessage("Confirmation email sent! Please check your inbox.")
    } catch (error: any) {
      setMessage(error.message || "Failed to resend confirmation email.")
    }
    setResending(false)
  }

  const getStatusIcon = () => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      case "error":
        return <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      case "pending":
        return <Mail className="w-16 h-16 text-blue-500 mx-auto mb-4" />
      default:
        return (
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        )
    }
  }

  return (
    <div className="app-container">
      <div className="app-header">
        <div className="w-full text-center text-xs text-slate-400">DOPAMIND</div>
      </div>

      <div className="p-6 flex items-center justify-center min-h-[80vh]">
        <Card className="bg-slate-800 border-slate-700 p-8 text-center max-w-md w-full">
          {getStatusIcon()}

          <h1 className="text-2xl font-bold mb-4">
            {status === "success" && "Email Confirmed!"}
            {status === "error" && "Confirmation Failed"}
            {status === "pending" && "Check Your Email"}
            {status === "loading" && "Confirming Email..."}
          </h1>

          <p className="text-slate-400 mb-6">{message}</p>

          {status === "pending" && email && (
            <Button
              onClick={resendConfirmation}
              disabled={resending}
              variant="outline"
              className="border-slate-600 text-slate-300 mb-4"
            >
              <RefreshCw className={`mr-2 w-4 h-4 ${resending ? "animate-spin" : ""}`} />
              {resending ? "Sending..." : "Resend Email"}
            </Button>
          )}

          {status === "error" && (
            <div className="space-y-3">
              <Button
                onClick={() => router.push("/auth/signup")}
                className="w-full bg-emerald-500 hover:bg-emerald-600"
              >
                Try Signing Up Again
              </Button>
              <Button
                onClick={() => router.push("/auth/signin")}
                variant="outline"
                className="w-full border-slate-600 text-slate-300"
              >
                Already have an account? Sign In
              </Button>
            </div>
          )}

          {status === "success" && (
            <Button onClick={() => router.push("/onboarding")} className="w-full bg-emerald-500 hover:bg-emerald-600">
              Continue to App
            </Button>
          )}
        </Card>
      </div>
    </div>
  )
}
