"use client"

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { CheckCircle, XCircle, Mail, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface VerificationResponse {
  message: string
  success?: boolean
}

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (token) {
      verifyEmail(token)
    } else {
      setStatus('error')
      setMessage('No verification token provided')
    }
  }, [token])

  const verifyEmail = async (verificationToken: string) => {
    try {
      setIsLoading(true)
      const { verifyEmail: verifyEmailApi } = await import('@/lib/api')
      const data = await verifyEmailApi(verificationToken)
      
      setStatus('success')
      setMessage(data.message || 'Email verified successfully! Your account is now pending manual approval.')
    } catch (error: any) {
      setStatus('error')
      let errorMessage = 'Verification failed. The link may be expired or invalid.'
      
      try {
        const errorData = JSON.parse(error.message)
        errorMessage = errorData.detail || errorData.message || errorMessage
      } catch {
        // If not JSON, use the error message as is
        errorMessage = error.message || errorMessage
      }
      
      setMessage(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = () => {
    if (token) {
      setStatus('verifying')
      verifyEmail(token)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className={cn(
          "border-0 shadow-2xl",
          status === 'success' && "border-green-200 bg-green-50/50",
          status === 'error' && "border-red-200 bg-red-50/50"
        )}>
          <CardHeader className="text-center pb-4">
            <div className={cn(
              "mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4",
              status === 'verifying' && "bg-blue-100",
              status === 'success' && "bg-green-100", 
              status === 'error' && "bg-red-100"
            )}>
              {status === 'verifying' && <Mail className="h-8 w-8 text-blue-600" />}
              {status === 'success' && <CheckCircle className="h-8 w-8 text-green-600" />}
              {status === 'error' && <XCircle className="h-8 w-8 text-red-600" />}
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900">
              {status === 'verifying' && 'Verifying Email'}
              {status === 'success' && 'Email Verified!'}
              {status === 'error' && 'Verification Failed'}
            </h1>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {status === 'verifying' && (
              <div className="text-center">
                <LoadingSpinner className="mx-auto mb-4" />
                <p className="text-gray-600">
                  Please wait while we verify your email address...
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center space-y-4">
                <p className="text-green-800 font-medium">{message}</p>
                <p className="text-gray-600 text-sm">
                  Your account is now active and ready to use.
                </p>
                <div className="pt-2">
                  <Link href="/login">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <span>Continue to Sign In</span>
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center space-y-4">
                <p className="text-red-800 font-medium">{message}</p>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-800 font-medium mb-2">Common solutions:</p>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Check if the link has expired (10 minutes)</li>
                    <li>• Make sure you clicked the complete link</li>
                    <li>• Request a new verification email</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  {token && (
                    <Button 
                      onClick={handleRetry}
                      disabled={isLoading}
                      variant="outline" 
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <LoadingSpinner className="h-4 w-4 mr-2" />
                          Retrying...
                        </>
                      ) : (
                        'Try Again'
                      )}
                    </Button>
                  )}
                  
                  <Link href="/register">
                    <Button variant="ghost" className="w-full">
                      Back to Registration
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact{' '}
            <a href="mailto:support@mrimot.com" className="text-blue-600 hover:text-blue-700">
              support@mrimot.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}