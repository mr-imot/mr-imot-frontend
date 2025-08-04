"use client"

import React from 'react'
import MaintenancePage from '@/components/maintenance/maintenance-page'

export default function MaintenancePageRoute() {
  return (
    <MaintenancePage
      message="We're currently performing scheduled maintenance on our systems."
      expectedReturn="Service should resume within the next 2 hours"
      showContact={true}
      showRetry={false} // Don't show retry on explicit maintenance page
    />
  )
}