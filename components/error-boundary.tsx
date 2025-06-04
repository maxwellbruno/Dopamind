"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error; reset: () => void }> },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return (
          <FallbackComponent
            error={this.state.error!}
            reset={() => this.setState({ hasError: false, error: undefined })}
          />
        )
      }

      return (
        <div className="app-container">
          <div className="p-6 flex items-center justify-center min-h-screen">
            <Card className="bg-slate-800 border-slate-700 p-8 text-center max-w-md w-full">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
              <p className="text-slate-400 mb-6">
                {this.state.error?.message || "An unexpected error occurred. Please try again."}
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => this.setState({ hasError: false, error: undefined })}
                  className="w-full bg-emerald-500 hover:bg-emerald-600"
                >
                  <RefreshCw className="mr-2 w-4 h-4" />
                  Try Again
                </Button>
                <Button
                  onClick={() => (window.location.href = "/")}
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300"
                >
                  <Home className="mr-2 w-4 h-4" />
                  Go Home
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
