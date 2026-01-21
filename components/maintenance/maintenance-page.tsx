"use client"

import React from 'react'
import { Clock, Mail, Phone, RefreshCw } from 'lucide-react'
import Image from 'next/image'
import { BrandButton } from '@/components/ui/brand-button'
import { config } from '@/lib/config'
import { EtchedGlassBackground } from '@/components/etched-glass-background'

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
    <div className="min-h-screen relative">
      {/* Etched Glass Background - Same as homepage */}
      <EtchedGlassBackground />
      
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center border border-white/20">
          {/* Logo/Brand - Same as header */}
          <div className="mb-8">
            <div className="relative w-20 h-20 flex items-center justify-center rounded-full bg-white mx-auto mb-6 shadow-lg">
              <Image
                src="/images/mr-imot-logo-no-background.png"
                alt="Mister Imot Logo"
                width={80}
                height={80}
                className="w-20 h-20 object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2 font-instrument-serif">Mister Imot</h1>
            <p className="text-sm text-gray-600 font-figtree">Real Estate Directory</p>
          </div>

          {/* Maintenance Message */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 font-figtree">
              Scheduled Maintenance
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6 font-figtree">
              {message}
            </p>

            {/* Expected Return Time */}
            {getEstimatedReturn() && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5 text-gray-700 mr-2" />
                  <span className="text-sm font-medium text-gray-800 font-figtree">
                    Expected Duration
                  </span>
                </div>
                <p className="text-gray-900 font-semibold font-figtree">
                  {getEstimatedReturn()}
                </p>
              </div>
            )}
          </div>

          {/* Contact Information */}
          {showContact && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 font-figtree">
                Need Urgent Assistance?
              </h3>
              <div className="space-y-3">
                {config.maintenance.supportEmail && (
                  <a
                    href={`mailto:${config.maintenance.supportEmail}`}
                    className="flex items-center justify-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    <Mail className="w-5 h-5 text-gray-600 mr-3" />
                    <span className="text-gray-700 font-medium font-figtree">
                      {config.maintenance.supportEmail}
                    </span>
                  </a>
                )}
                {config.maintenance.supportPhone && (
                  <a
                    href={`tel:${config.maintenance.supportPhone}`}
                    className="flex items-center justify-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    <Phone className="w-5 h-5 text-gray-600 mr-3" />
                    <span className="text-gray-700 font-medium font-figtree">
                      {config.maintenance.supportPhone}
                    </span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Retry Button - Enhanced visibility */}
          {showRetry && (
            <div>
              <button
                onClick={handleRetry}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 text-lg"
              >
                <RefreshCw className="w-5 h-5 mr-2 inline" />
                Check Again
              </button>
              <p className="text-xs text-gray-500 mt-3 font-figtree">
                We'll automatically check if our services are back online
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 font-figtree">
              Thank you for your patience. We'll be back soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MaintenancePage
