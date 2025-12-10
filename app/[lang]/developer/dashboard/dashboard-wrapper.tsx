"use client"

import dynamic from 'next/dynamic'

// Dynamic import to prevent recharts from being in shared bundle
const DeveloperDashboardClient = dynamic(
  () => import('./dashboard-client'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-charcoal-500"></div>
      </div>
    )
  }
)

interface DashboardWrapperProps {
  dict: any
  lang: 'en' | 'bg'
}

export function DashboardWrapper({ dict, lang }: DashboardWrapperProps) {
  return <DeveloperDashboardClient dict={dict} lang={lang} />
}

