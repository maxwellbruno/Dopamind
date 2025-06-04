"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

const onboardingSteps = [
  {
    title: "Welcome to Dopamind",
    subtitle: "Your digital wellness companion",
    content: "Break free from screen addiction and reclaim your focus with guided sessions and mindful habits.",
    icon: "🧠",
  },
  {
    title: "Understanding Dopamine",
    subtitle: "The science behind digital addiction",
    content:
      "Constant notifications and endless scrolling create dopamine imbalances. We'll help you reset and find balance.",
    icon: "⚡",
  },
  {
    title: "Focus Sessions",
    subtitle: "Structured time for deep work",
    content: "Use our timer for focused work sessions. Track your progress and build sustainable habits.",
    icon: "⏱️",
  },
  {
    title: "Track Your Journey",
    subtitle: "Monitor mood and progress",
    content: "Log your mood after sessions and watch your digital wellness improve over time.",
    icon: "📊",
  },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      router.push("/home")
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const step = onboardingSteps[currentStep]

  return (
    <div className="mobile-container">
      <div className="app-header">
        <div className="w-full text-center text-xs text-slate-400">DOPAMIND</div>
      </div>

      <div className="flex flex-col h-full p-6">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={prevStep}
            className={`p-2 rounded-full ${currentStep === 0 ? "invisible" : "text-slate-400 hover:text-slate-300"}`}
          >
            <ChevronLeft size={24} />
          </button>

          <div className="flex gap-2">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? "bg-emerald-500" : "bg-slate-600"
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => router.push("/home")}
            className="text-slate-400 hover:text-slate-300 text-sm font-medium"
          >
            Skip
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <div className="text-8xl mb-8">{step.icon}</div>
          <h1 className="text-3xl font-bold mb-4">{step.title}</h1>
          <p className="text-emerald-400 text-lg mb-6">{step.subtitle}</p>
          <p className="text-slate-300 text-lg leading-relaxed">{step.content}</p>
        </div>

        <div className="mt-8">
          <Button
            onClick={nextStep}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-4 text-lg"
          >
            {currentStep === onboardingSteps.length - 1 ? "Get Started" : "Continue"}
            <ChevronRight className="ml-2" size={20} />
          </Button>
        </div>
      </div>
    </div>
  )
}
