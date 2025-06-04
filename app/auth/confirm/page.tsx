"use client"

import { Suspense } from "react"
import EmailConfirmation from "@/components/auth/email-confirmation"

function EmailConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="app-container">
          <div className="app-header">
            <div className="w-full text-center text-xs text-slate-400">DOPAMIND</div>
          </div>
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="text-slate-400">Loading...</div>
          </div>
        </div>
      }
    >
      <EmailConfirmation />
    </Suspense>
  )
}

export default EmailConfirmationPage
