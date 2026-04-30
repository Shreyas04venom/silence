"use client"

import { useState, useEffect } from "react"
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface TourStep {
  target: string // CSS selector for the element to highlight
  title: string
  description: string
  position?: "top" | "bottom" | "left" | "right" | "center"
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
  const [cardPosition, setCardPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      updateHighlightPosition()
    }, 100)
    
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
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollLeft = window.scrollX || document.documentElement.scrollLeft
      
      setHighlightPosition({
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft,
        width: rect.width,
        height: rect.height,
      })
      
      // Calculate card position based on step position preference
      calculateCardPosition(rect, step.position || "bottom", scrollTop, scrollLeft)
      
      // Scroll element into view smoothly
      element.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" })
    } else {
      // If element not found, show card in center
      setCardPosition({
        top: window.innerHeight / 2 - 200,
        left: window.innerWidth / 2 - 200,
      })
    }
  }

  const calculateCardPosition = (
    rect: DOMRect, 
    position: string, 
    scrollTop: number, 
    scrollLeft: number
  ) => {
    const cardWidth = 400
    const cardHeight = 350
    const padding = 20
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let top = 0
    let left = 0

    switch (position) {
      case "bottom":
        top = rect.bottom + scrollTop + padding
        left = rect.left + scrollLeft + (rect.width / 2) - (cardWidth / 2)
        break
      case "top":
        top = rect.top + scrollTop - cardHeight - padding
        left = rect.left + scrollLeft + (rect.width / 2) - (cardWidth / 2)
        break
      case "right":
        top = rect.top + scrollTop + (rect.height / 2) - (cardHeight / 2)
        left = rect.right + scrollLeft + padding
        break
      case "left":
        top = rect.top + scrollTop + (rect.height / 2) - (cardHeight / 2)
        left = rect.left + scrollLeft - cardWidth - padding
        break
      case "center":
      default:
        top = scrollTop + (viewportHeight / 2) - (cardHeight / 2)
        left = scrollLeft + (viewportWidth / 2) - (cardWidth / 2)
        break
    }

    // Ensure card stays within viewport bounds
    const minLeft = scrollLeft + padding
    const maxLeft = scrollLeft + viewportWidth - cardWidth - padding
    const minTop = scrollTop + padding
    const maxTop = scrollTop + viewportHeight - cardHeight - padding

    left = Math.max(minLeft, Math.min(maxLeft, left))
    top = Math.max(minTop, Math.min(maxTop, top))

    setCardPosition({ top, left })
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
      {/* Dark overlay with higher z-index */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        style={{ 
          zIndex: 9998,
          opacity: isVisible ? 1 : 0 
        }}
      />

      {/* Spotlight highlight - positioned absolutely */}
      <div
        className="fixed pointer-events-none transition-all duration-500 ease-out"
        style={{
          zIndex: 9999,
          top: `${highlightPosition.top - 8}px`,
          left: `${highlightPosition.left - 8}px`,
          width: `${highlightPosition.width + 16}px`,
          height: `${highlightPosition.height + 16}px`,
          boxShadow: "0 0 0 4px rgba(99, 102, 241, 0.6), 0 0 0 9999px rgba(0, 0, 0, 0.75)",
          borderRadius: "12px",
        }}
      />

      {/* Animated pulse ring */}
      <div
        className="fixed pointer-events-none"
        style={{
          zIndex: 9999,
          top: `${highlightPosition.top - 12}px`,
          left: `${highlightPosition.left - 12}px`,
          width: `${highlightPosition.width + 24}px`,
          height: `${highlightPosition.height + 24}px`,
          border: "3px solid rgba(99, 102, 241, 0.8)",
          borderRadius: "14px",
          animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
        }}
      />

      {/* Tour card - positioned absolutely with calculated position */}
      <div
        className="fixed animate-in fade-in slide-in-from-bottom-4 duration-500"
        style={{
          zIndex: 10000,
          top: `${cardPosition.top}px`,
          left: `${cardPosition.left}px`,
          width: "400px",
          maxWidth: "calc(100vw - 40px)",
        }}
      >
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-6 text-white relative overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
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
