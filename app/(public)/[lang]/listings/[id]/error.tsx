"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Building } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.error('Listing page error:', error)
    }
  }, [error])

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Building className="w-10 h-10 text-gray-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-3">Something went wrong</h2>
      <p className="text-gray-600 mb-6">
        We couldn&apos;t load this listing. Please try again.
      </p>
      <div className="flex gap-4 justify-center">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" onClick={() => window.history.back()}>
          Go back
        </Button>
      </div>
    </div>
  )
}

