"use client"

import { useState, useEffect } from "react"
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface TourStep {
  target: string // CSS selector for the element to highlight
  title: string
  description: string
  position?: "top" | "bottom" | "left" | "right"
  icon?: string
}

interface OnboardingTourProps {
  steps: TourStep[]
  onComplete: () => void
  onSkip: () => void
  tourName: string
}

export function OnboardingTour({ steps, onComplete, onSkip, tourName }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [highlightPosition, setHighlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 })

  useEffect(() => {
    updateHighlightPosition()
    window.addEventListener("resize", updateHighlightPosition)
    window.addEventListener("scroll", updateHighlightPosition)
    
    return () => {
      window.removeEventListener("resize", updateHighlightPosition)
      window.removeEventListener("scroll", updateHighlightPosition)
    }
  }, [currentStep])

  const updateHighlightPosition = () => {
    const step = steps[currentStep]
    if (!step) return

    const element = document.querySelector(step.target)
    if (element) {
      const rect = element.getBoundingClientRect()
      setHighlightPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      })
      
      // Scroll element into view smoothly
      element.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    setIsVisible(false)
    setTimeout(() => {
      onComplete()
    }, 300)
  }

  const handleSkip = () => {
    setIsVisible(false)
    setTimeout(() => {
      onSkip()
    }, 300)
  }

  if (!isVisible) return null

  const step = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <>
      {/* Dark overlay */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998] transition-opacity duration-300"
        style={{ opacity: isVisible ? 1 : 0 }}
      />

      {/* Spotlight highlight */}
      <div
        className="fixed z-[9999] pointer-events-none transition-all duration-500 ease-out"
        style={{
          top: `${highlightPosition.top - 8}px`,
          left: `${highlightPosition.left - 8}px`,
          width: `${highlightPosition.width + 16}px`,
          height: `${highlightPosition.height + 16}px`,
          boxShadow: "0 0 0 4px rgba(99, 102, 241, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.7)",
          borderRadius: "12px",
        }}
      />

      {/* Animated pulse ring */}
      <div
        className="fixed z-[9999] pointer-events-none animate-ping"
        style={{
          top: `${highlightPosition.top - 12}px`,
          left: `${highlightPosition.left - 12}px`,
          width: `${highlightPosition.width + 24}px`,
          height: `${highlightPosition.height + 24}px`,
          border: "3px solid rgba(99, 102, 241, 0.6)",
          borderRadius: "14px",
        }}
      />

      {/* Tour card */}
      <div
        className="fixed z-[10000] animate-in fade-in slide-in-from-bottom-4 duration-500"
        style={{
          top: step.position === "bottom" 
            ? `${highlightPosition.top + highlightPosition.height + 20}px`
            : step.position === "top"
            ? `${highlightPosition.top - 280}px`
            : `${highlightPosition.top}px`,
          left: step.position === "right"
            ? `${highlightPosition.left + highlightPosition.width + 20}px`
            : step.position === "left"
            ? `${highlightPosition.left - 420}px`
            : `${Math.max(20, highlightPosition.left + highlightPosition.width / 2 - 200)}px`,
          maxWidth: "400px",
        }}
      >
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-6 text-white relative overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            <span className="text-sm font-semibold text-white/90">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>

          {/* Icon */}
          {step.icon && (
            <div className="text-6xl mb-4 animate-bounce">
              {step.icon}
            </div>
          )}

          {/* Content */}
          <h3 className="text-2xl font-bold mb-3 relative z-10">
            {step.title}
          </h3>
          <p className="text-white/90 mb-6 leading-relaxed relative z-10">
            {step.description}
          </p>

          {/* Progress bar */}
          <div className="w-full h-2 bg-white/20 rounded-full mb-6 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-300 to-pink-300 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-3 relative z-10">
            <Button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              variant="ghost"
              className="text-white hover:bg-white/20 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            <div className="flex gap-2">
              <Button
                onClick={handleSkip}
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                Skip Tour
              </Button>
              <Button
                onClick={handleNext}
                className="bg-white text-indigo-600 hover:bg-white/90 font-semibold shadow-lg"
              >
                {currentStep === steps.length - 1 ? (
                  "Finish"
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
