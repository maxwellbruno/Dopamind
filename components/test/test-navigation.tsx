"use client"

import { Button } from "@/components/ui/button"
import { TestTube } from "lucide-react"
import { useRouter } from "next/navigation"

export default function TestNavigation() {
  const router = useRouter()

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <Button
        onClick={() => router.push("/test")}
        className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-12 h-12 p-0 shadow-lg"
        title="Open Test Suite"
      >
        <TestTube size={20} />
      </Button>
    </div>
  )
}
