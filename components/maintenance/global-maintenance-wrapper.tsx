"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { config } from '@/lib/config'
import MaintenancePage from './maintenance-page'

interface GlobalMaintenanceWrapperProps {
  children: React.ReactNode
}

export const GlobalMaintenanceWrapper: React.FC<GlobalMaintenanceWrapperProps> = ({ children }) => {
  const [isBackendDown, setIsBackendDown] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()

  // Check if we should show maintenance mode
  const shouldShowMaintenance = () => {
    // Explicit maintenance mode
    if (config.features.maintenanceMode) {
      return true
    }

    // Auto-detect backend failure
    return isBackendDown
  }

  // Quick health check to detect if entire backend is down
  const checkBackendHealth = async () => {
    try {
      setIsChecking(true)
      
      // Try multiple endpoints to confirm backend is completely down
      let healthFailed = false
      let projectsFailed = false

      try {
        const healthStatus = await fetch(`/api/v1/health`, { signal: AbortSignal.timeout(3000) })
        healthFailed = !healthStatus.ok || healthStatus.status >= 500
      } catch {
        healthFailed = true
      }

      try {
        const projectsStatus = await fetch(`/api/v1/projects`, { signal: AbortSignal.timeout(3000) })
        projectsFailed = !projectsStatus.ok || projectsStatus.status >= 500
      } catch {
        projectsFailed = true
      }

      const allFailed = healthFailed && projectsFailed

      if (allFailed) {
        setIsBackendDown(true)
        if (config.features.debugLogging) {
          console.warn('🚨 Complete backend failure detected - showing global maintenance page')
        }
      } else {
        setIsBackendDown(false)
        if (config.features.debugLogging) {
          console.info('✅ Backend is responsive - normal operation')
        }
      }
    } catch (error) {
      // Complete network failure
      setIsBackendDown(true)
      if (config.features.debugLogging) {
        console.warn('🚨 Network failure detected - showing global maintenance page', error)
      }
    } finally {
      setIsChecking(false)
    }
  }

  // Check on mount only - no automatic reloading
  useEffect(() => {
    checkBackendHealth()

    // Only check again when user manually retries
    // No automatic polling to prevent UX interruptions
  }, [])

  // If we're still checking on initial load, show a simple loading with brand colors
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto mb-4"></div>
          <p className="text-gray-700 font-figtree">Loading...</p>
        </div>
      </div>
    )
  }

  // Show maintenance page if backend is down
  if (shouldShowMaintenance()) {
    return (
      <MaintenancePage
        message="We're currently experiencing technical difficulties. All services are temporarily unavailable while we work to restore functionality."
        expectedReturn="Service should resume within the next hour"
        onRetry={checkBackendHealth}
        showContact={true}
        showRetry={true}
      />
    )
  }

  // Backend is working, show normal app
  return <>{children}</>
}

export default GlobalMaintenanceWrapper