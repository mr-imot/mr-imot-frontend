"use client"

import * as React from "react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface PasswordStrengthProps {
  password: string
  className?: string
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const calculateStrength = (password: string) => {
    if (!password) return { score: 0, label: "", color: "" }
    
    let score = 0
    let feedback = []

    // Length check
    if (password.length >= 8) {
      score += 25
    } else {
      feedback.push("At least 8 characters")
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 25
    } else {
      feedback.push("One uppercase letter")
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 25
    } else {
      feedback.push("One lowercase letter")
    }

    // Number check
    if (/\d/.test(password)) {
      score += 25
    } else {
      feedback.push("One number")
    }

    // Special character check (bonus)
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 10
    }

    // Determine strength level
    let label = ""
    let color = ""
    
    if (score < 50) {
      label = "Weak"
      color = "bg-red-500"
    } else if (score < 75) {
      label = "Average"
      color = "bg-yellow-500"
    } else if (score < 100) {
      label = "Good"
      color = "bg-blue-500"
    } else {
      label = "Strong"
      color = "bg-green-500"
    }

    return { score: Math.min(score, 100), label, color, feedback }
  }

  const { score, label, color, feedback } = calculateStrength(password)

  if (!password) return null

  return (
    <div className={cn("space-y-ds-2 p-ds-3 bg-ds-neutral-50 border border-ds-neutral-200 rounded-ds", className)}>
      <div className="flex items-center justify-between">
        <span className="text-ds-sm font-medium text-ds-neutral-700">Password strength:</span>
        <span className={cn(
          "text-ds-sm font-semibold px-2 py-1 rounded text-white",
          score < 50 ? "bg-red-500" : 
          score < 75 ? "bg-yellow-500" : 
          score < 100 ? "bg-blue-500" : "bg-green-500"
        )}>
          {label}
        </span>
      </div>
      <div className="relative">
        <Progress 
          value={score} 
          className={cn(
            "h-3 rounded-full overflow-hidden",
            score < 50 ? "[&>div]:bg-red-500" : 
            score < 75 ? "[&>div]:bg-yellow-500" : 
            score < 100 ? "[&>div]:bg-blue-500" : "[&>div]:bg-green-500"
          )}
        />
      </div>
      {feedback && feedback.length > 0 && (
        <div className="bg-ds-neutral-100 rounded-ds p-ds-2">
          <p className="text-ds-xs font-medium text-ds-neutral-700 mb-1">Missing requirements:</p>
          <ul className="space-y-1">
            {feedback.map((item, index) => (
              <li key={index} className="flex items-center gap-2 text-ds-xs text-ds-neutral-600">
                <div className="w-1.5 h-1.5 bg-ds-neutral-400 rounded-full"></div>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
} 