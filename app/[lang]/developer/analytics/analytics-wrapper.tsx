"use client"

import dynamic from 'next/dynamic'

// Dynamic import to prevent recharts from being in shared bundle
const AnalyticsClient = dynamic(
  () => import('./analytics-client'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-charcoal-500"></div>
      </div>
    )
  }
)

interface AnalyticsWrapperProps {
  dict: any
  lang: 'en' | 'bg'
}

export function AnalyticsWrapper({ dict, lang }: AnalyticsWrapperProps) {
  return <AnalyticsClient dict={dict} lang={lang} />
}

