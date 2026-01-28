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
  const [isChecking, setIsChecking] = useState(config.features.globalMaintenanceMode) // Only check if enabled
  const router = useRouter()

  // Check if we should show maintenance mode
  const shouldShowMaintenance = () => {
    // If global maintenance mode is disabled, never show it
    if (!config.features.globalMaintenanceMode) {
      return false
    }

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
      
      // Check backend health using dedicated health endpoint
      let healthFailed = false
      let retryCount = 0
      const maxRetries = 2
      const timeout = 5000 // Increased to 5 seconds for production cold starts

      while (retryCount < maxRetries && !healthFailed) {
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), timeout)
          
          const healthStatus = await fetch(`/health`, { 
            signal: controller.signal,
            cache: 'no-cache' // Use no-cache instead of no-store to allow bfcache
          })
          
          clearTimeout(timeoutId)
          
          // Only consider 500+ errors as failures, not 404 or other client errors
          healthFailed = healthStatus.status >= 500
          
          if (process.env.NODE_ENV === 'development' && config.features?.debugLogging) {
            console.log(`Health check attempt ${retryCount + 1}:`, healthStatus.status)
          }
          
          // If check succeeded (any 2xx, 3xx, 4xx response), break the loop
          if (healthStatus.status < 500) {
            break
          }
        } catch (err: any) {
          // Only retry on timeout/network errors, not on HTTP errors
          if (err.name === 'AbortError' || err.message?.includes('fetch')) {
            retryCount++
            if (retryCount < maxRetries) {
              // Wait before retrying
              await new Promise(resolve => setTimeout(resolve, 1000))
            } else {
              healthFailed = true
            }
          } else {
            // Other errors (like CORS) might mean backend is responding
            healthFailed = false
            break
          }
        }
      }

      if (healthFailed) {
        setIsBackendDown(true)
        if (process.env.NODE_ENV === 'development' && config.features?.debugLogging) {
          console.warn('🚨 Backend appears to be down after retries - showing maintenance page')
        }
      } else {
        setIsBackendDown(false)
        if (process.env.NODE_ENV === 'development' && config.features?.debugLogging) {
          console.info('✅ Backend is responsive or health check passed - normal operation')
        }
      }
    } catch (error) {
      setIsBackendDown(false)
      if (process.env.NODE_ENV === 'development' && config.features?.debugLogging) {
        console.warn('⚠️ Health check error, defaulting to allow app load:', error)
      }
    } finally {
      setIsChecking(false)
    }
  }

  // Check on mount only - no automatic reloading
  useEffect(() => {
    // Only check if global maintenance mode is enabled
    if (config.features.globalMaintenanceMode) {
      checkBackendHealth()
    }

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