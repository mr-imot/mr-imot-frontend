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
    <div className="flex items-center justify-center mb-8">
      <span className="mr-3 text-sm text-gray-700">{lang === 'bg' ? 'Месечно' : 'Monthly'}</span>
      {/* iOS style switch */}
      <button
        type="button"
        role="switch"
        aria-checked={cycle === 'yearly'}
        onClick={() => setCycle(cycle === 'monthly' ? 'yearly' : 'monthly')}
        className={`relative w-16 h-8 rounded-full transition-colors focus-ring ${cycle === 'yearly' ? 'bg-indigo-600' : 'bg-gray-300'}`}
      >
        <span
          className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${cycle === 'yearly' ? 'translate-x-8' : 'translate-x-0'}`}
        />
      </button>
      <span className="ml-3 text-sm text-gray-700">{lang === 'bg' ? 'Годишно' : 'Yearly'}</span>
    </div>
  )
}


