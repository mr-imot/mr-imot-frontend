"use client"

import { useEffect, useState } from "react"

interface BillingToggleProps {
  monthlyLabel: string
  yearlyLabel: string
  yearlyHint?: string
  defaultCycle?: 'monthly' | 'yearly'
  onChange?: (cycle: 'monthly' | 'yearly') => void
}

export function BillingToggle({ monthlyLabel, yearlyLabel, yearlyHint, defaultCycle = 'monthly', onChange }: BillingToggleProps) {
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>(defaultCycle)

  useEffect(() => { onChange?.(cycle) }, [cycle, onChange])

  return (
    <div className="flex items-center justify-center flex-wrap gap-3 sm:gap-4 mb-8 px-4">
      <span className="text-sm text-gray-700 min-w-0 flex-shrink-0">
        {monthlyLabel}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={cycle === 'yearly'}
        onClick={() => setCycle(cycle === 'monthly' ? 'yearly' : 'monthly')}
        className={`relative rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
          cycle === 'yearly' 
            ? 'bg-green-600' 
            : 'bg-gray-300'
        } h-10 w-20 md:h-8 md:w-16`}
      >
        <span
          className={`absolute rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
            cycle === 'yearly' 
              ? 'translate-x-10 md:translate-x-8' 
              : 'translate-x-0'
          } h-6 w-6 top-2 left-2 md:h-5 md:w-5 md:top-1.5 md:left-1.5`}
        />
      </button>
      <div className="flex flex-col items-start">
        <span className="text-sm text-gray-700 min-w-0 flex-shrink-0">
          {yearlyLabel}
        </span>
        {yearlyHint && (
          <span className="text-xs text-emerald-700">{yearlyHint}</span>
        )}
      </div>
    </div>
  )
}


