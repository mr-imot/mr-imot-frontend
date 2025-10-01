// Privacy notice for property caching
// Simple component to inform users about local storage usage

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, Info } from 'lucide-react'

export function PropertyCachePrivacyNotice() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Show notice only once per session
    const hasSeenNotice = sessionStorage.getItem('property-cache-notice-seen')
    if (!hasSeenNotice) {
      setIsVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    sessionStorage.setItem('property-cache-notice-seen', 'true')
  }

  if (!isVisible) return null

  return (
    <Card className="fixed bottom-4 right-4 z-50 max-w-sm shadow-lg border border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 text-sm mb-1">
              Faster Loading
            </h4>
            <p className="text-blue-700 text-xs mb-3">
              We temporarily store property listings in your browser to provide faster loading. 
              This data is automatically cleared when you close your browser.
            </p>
            <Button 
              onClick={handleDismiss}
              size="sm"
              variant="outline"
              className="text-blue-700 border-blue-300 hover:bg-blue-100"
            >
              Got it
            </Button>
          </div>
          <Button
            onClick={handleDismiss}
            size="sm"
            variant="ghost"
            className="p-1 h-auto text-blue-600 hover:text-blue-800"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

