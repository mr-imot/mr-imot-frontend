"use client"

import { useState, useEffect } from "react"

interface BillingToggleProps {
  lang: string
  defaultCycle?: 'monthly' | 'yearly'
  onChange?: (cycle: 'monthly' | 'yearly') => void
  savingsText?: string
}

export function BillingToggle({ lang, defaultCycle = 'monthly', onChange }: BillingToggleProps) {
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>(defaultCycle)

  useEffect(() => { onChange?.(cycle) }, [cycle, onChange])

  return (
    <div className="flex items-center justify-center mb-8 gap-4 px-4">
      <span className="text-sm text-gray-700 min-w-0 flex-shrink-0">
        {lang === 'bg' ? 'Месечно' : 'Monthly'}
      </span>
      {/* iOS style switch - responsive sizing with symmetric padding top/bottom */}
      <button
        type="button"
        role="switch"
        aria-checked={cycle === 'yearly'}
        onClick={() => setCycle(cycle === 'monthly' ? 'yearly' : 'monthly')}
        className={`relative rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
          cycle === 'yearly' 
            ? 'bg-green-600' 
            : 'bg-gray-300'
        } h-10 w-20 md:h-8 md:w-16`} // Mobile: 40x80px track; Desktop: 32x64px
      >
        <span
          className={`absolute rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
            cycle === 'yearly' 
              ? 'translate-x-10 md:translate-x-8' 
              : 'translate-x-0'
          } h-6 w-6 top-2 left-2 md:h-5 md:w-5 md:top-1.5 md:left-1.5`} // Symmetric: Mobile 8px padding both sides; Desktop 6px both sides
        />
      </button>
      <span className="text-sm text-gray-700 min-w-0 flex-shrink-0">
        {lang === 'bg' ? 'Годишно' : 'Yearly'}
      </span>
    </div>
  )
}


