"use client"

import React from 'react'
import { AlertTriangle, RefreshCw, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GracefulDegradationProps {
  /** Type of service that's affected */
  serviceType: 'listings' | 'search' | 'filters' | 'maps' | 'general'
  /** Whether the issue is temporary */
  isTemporary?: boolean
  /** Custom error message */
  message?: string
  /** Show retry button */
  showRetry?: boolean
  /** Custom retry handler */
  onRetry?: () => void
  /** Show fallback content */
  children?: React.ReactNode
}

const serviceMessages = {
  listings: "Property listings are temporarily unavailable. We're working to restore this service.",
  search: "Search functionality is currently limited. Please try browsing by category instead.",
  filters: "Advanced filters are temporarily disabled. Basic filtering is still available.",
  maps: "Map view is currently unavailable. List view is still functional.",
  general: "This feature is temporarily unavailable. Please try again later."
}

const serviceIcons = {
  listings: '🏠',
  search: '🔍',
  filters: '🔧',
  maps: '🗺️',
  general: '⚠️'
}

export const GracefulDegradation: React.FC<GracefulDegradationProps> = ({
  serviceType,
  isTemporary = true,
  message,
  showRetry = true,
  onRetry,
  children
}) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else {
      window.location.reload()
    }
  }

  const displayMessage = message || serviceMessages[serviceType]

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 m-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
            <span className="text-lg">{serviceIcons[serviceType]}</span>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-medium text-amber-800">
              Service Temporarily Limited
            </h3>
          </div>
          
          <p className="text-sm text-amber-700 mb-4">
            {displayMessage}
          </p>

          {isTemporary && (
            <div className="flex items-center space-x-2 text-xs text-amber-600 mb-4">
              <Info className="w-4 h-4" />
              <span>This is a temporary issue. Normal service will resume shortly.</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {showRetry && (
              <Button
                onClick={handleRetry}
                variant="outline"
                size="sm"
                className="border-amber-300 text-amber-700 hover:bg-amber-100"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            
            {children && (
              <div className="text-sm text-amber-700">
                {children}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GracefulDegradation