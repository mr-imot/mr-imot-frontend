"use client"

import React from 'react'
import { Clock, Mail, Phone, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { config } from '@/lib/config'

interface MaintenancePageProps {
  /** Custom maintenance message */
  message?: string
  /** Expected return time */
  expectedReturn?: string
  /** Show contact information */
  showContact?: boolean
  /** Show retry button */
  showRetry?: boolean
  /** Custom retry handler */
  onRetry?: () => void
}

export const MaintenancePage: React.FC<MaintenancePageProps> = ({
  message = config.maintenance.defaultMessage,
  expectedReturn,
  showContact = true,
  showRetry = true,
  onRetry
}) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else {
      window.location.reload()
    }
  }

  const getEstimatedReturn = () => {
    if (expectedReturn) return expectedReturn
    if (config.maintenance.maintenanceEnd) {
      const endTime = new Date(config.maintenance.maintenanceEnd)
      const now = new Date()
      if (endTime > now) {
        return endTime.toLocaleString()
      }
    }
    return config.maintenance.estimatedDuration
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Logo/Brand */}
        <div className="mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Mr imot</h1>
          <p className="text-sm text-gray-500">Real Estate Directory</p>
        </div>

        {/* Maintenance Message */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Scheduled Maintenance
          </h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            {message}
          </p>

          {/* Expected Return Time */}
          {getEstimatedReturn() && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-800">
                  Expected Duration
                </span>
              </div>
              <p className="text-blue-700 font-semibold">
                {getEstimatedReturn()}
              </p>
            </div>
          )}
        </div>

        {/* Contact Information */}
        {showContact && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Need Urgent Assistance?
            </h3>
            <div className="space-y-3">
              {config.maintenance.supportEmail && (
                <a
                  href={`mailto:${config.maintenance.supportEmail}`}
                  className="flex items-center justify-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Mail className="w-5 h-5 text-gray-600 mr-3" />
                  <span className="text-gray-700 font-medium">
                    {config.maintenance.supportEmail}
                  </span>
                </a>
              )}
              {config.maintenance.supportPhone && (
                <a
                  href={`tel:${config.maintenance.supportPhone}`}
                  className="flex items-center justify-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Phone className="w-5 h-5 text-gray-600 mr-3" />
                  <span className="text-gray-700 font-medium">
                    {config.maintenance.supportPhone}
                  </span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Retry Button */}
        {showRetry && (
          <div>
            <Button
              onClick={handleRetry}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Check Again
            </Button>
            <p className="text-xs text-gray-500 mt-3">
              We'll automatically check if our services are back online
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Thank you for your patience. We'll be back soon!
          </p>
        </div>
      </div>
    </div>
  )
}

export default MaintenancePage
