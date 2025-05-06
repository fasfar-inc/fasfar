"use client"

import { cn } from "@/lib/utils"
import { Check, Info, Camera, MapPin, FileText } from "lucide-react"

interface FormStepsProps {
  steps: string[]
  currentStep: number
  onStepClick?: (step: number) => void
}

const stepIcons = [Info, Camera, MapPin, FileText]
const stepDescriptions = [
  "Basic info about your product",
  "Add product photos",
  "Set the location",
  "Review and publish"
]

export default function FormSteps({ steps, currentStep, onStepClick }: FormStepsProps) {
  return (
    <div className="w-full py-6 max-w-4xl mx-auto">
      <div className="flex items-center">
        {steps.map((step, index) => {
          const Icon = stepIcons[index] || Info
          return (
            <div key={index} className="flex-1 flex items-center relative">
              {/* Step circle with icon */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => onStepClick && index <= currentStep && onStepClick(index)}
                  className={cn(
                    "relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-md",
                    index < currentStep
                      ? "border-rose-500 bg-rose-500 text-white scale-105"
                      : index === currentStep
                      ? "border-rose-500 bg-white text-rose-500 scale-105"
                      : "border-gray-300 bg-gray-50 text-gray-400"
                  )}
                  disabled={index > currentStep}
                  style={{ boxShadow: index === currentStep ? "0 4px 20px rgba(244,63,94,0.15)" : undefined }}
                >
                  {index < currentStep ? (
                    <Check className="h-6 w-6 animate-bounce" />
                  ) : (
                    <Icon className="h-6 w-6" />
                  )}
                </button>
                <span className={cn("mt-2 text-sm font-semibold", index <= currentStep ? "text-rose-500" : "text-gray-500")}>
                  {step}
                </span>
                <span className="text-xs text-gray-400">{stepDescriptions[index]}</span>
              </div>
              {/* Animated connecting line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-1 mx-2 rounded transition-all duration-500",
                    index < currentStep ? "bg-gradient-to-r from-rose-400 to-rose-600" : "bg-gray-200"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
