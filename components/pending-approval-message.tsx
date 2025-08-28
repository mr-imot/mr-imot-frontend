"use client"

import { useAuth } from "@/lib/auth-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Clock, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PendingApprovalMessage() {
  const { user } = useAuth()

  // Only show for developers with pending_manual_approval status
  if (!user || user.user_type !== 'developer' || user.verification_status !== 'pending_manual_approval') {
    return null
  }

  return (
    <Alert className="mb-6 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800">
      <Clock className="h-5 w-5 text-blue-600" />
      <AlertTitle className="text-blue-800 dark:text-blue-200">Account Under Review</AlertTitle>
      <AlertDescription className="text-blue-700 dark:text-blue-300">
        <div className="space-y-2">
          <p>
            Your email is verified! Our team is reviewing your developer application. 
            You'll receive an email notification within 24-48 hours once approved.
          </p>
          <p className="text-sm">
            You can browse your dashboard, but creating new properties requires full verification.
          </p>
        </div>
        <div className="mt-4">
          <Button variant="outline" size="sm" className="text-blue-700 border-blue-300 hover:bg-blue-100 dark:text-blue-300 dark:border-blue-700 dark:hover:bg-blue-900/50">
            <Mail className="h-4 w-4 mr-2" />
            Contact Support
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}




