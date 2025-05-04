"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface FormStepsProps {
  steps: string[]
  currentStep: number
  onStepClick?: (step: number) => void
}

export default function FormSteps({ steps, currentStep, onStepClick }: FormStepsProps) {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center relative">
            {/* Ligne de connexion */}
            {index > 0 && (
              <div
                className={cn(
                  "absolute top-4 h-0.5 w-full -left-1/2 -z-10",
                  index <= currentStep ? "bg-rose-500" : "bg-gray-200",
                )}
              />
            )}

            {/* Cercle d'étape */}
            <button
              type="button"
              onClick={() => onStepClick && index <= currentStep && onStepClick(index)}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                index < currentStep
                  ? "border-rose-500 bg-rose-500 text-white cursor-pointer"
                  : index === currentStep
                    ? "border-rose-500 text-rose-500"
                    : "border-gray-300 text-gray-400 cursor-not-allowed",
              )}
              disabled={index > currentStep}
            >
              {index < currentStep ? <Check className="h-4 w-4" /> : <span>{index + 1}</span>}
            </button>

            {/* Nom de l'étape */}
            <span className={cn("mt-2 text-xs font-medium", index <= currentStep ? "text-rose-500" : "text-gray-500")}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
