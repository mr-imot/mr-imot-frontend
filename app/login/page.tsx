"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { AuthError } from "@/components/ui/auth-error"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Suspense, useEffect } from "react"
import { LogIn, CheckCircle, Shield, ArrowRight, Sparkles, Mail, Eye, EyeOff, Loader2 } from "lucide-react"
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/lib/auth-constants"
import { useAuth } from "@/lib/auth-context"

import { createAuthError, getErrorDisplayMessage, AuthenticationError } from "@/lib/auth-errors"

function LoginFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const { login, isAuthenticated, isLoading: authLoading, getDashboardUrl } = useAuth()

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(getDashboardUrl())
    }
  }, [isAuthenticated, authLoading, router, getDashboardUrl])
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verificationRequired, setVerificationRequired] = useState<{
    email: string;
    status: string;
    message: string;
  } | null>(null)

  // Show success message if redirected from password reset
  const showSuccessMessage = message === 'password-reset-success'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setVerificationRequired(null)

      await login(formData.email, formData.password)

      // After successful login, redirect to appropriate dashboard
      router.push(getDashboardUrl())
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      
      // Handle verification status (only case where we expect JSON)
      if (errorMessage.startsWith('{') && errorMessage.includes('verification_status')) {
        try {
          const errorData = JSON.parse(errorMessage)
          if (errorData.detail?.verification_status) {
            setVerificationRequired({
              email: errorData.detail.email,
              status: errorData.detail.verification_status,
              message: errorData.detail.message
            })
            return
          }
        } catch {
          // If JSON parsing fails, fall through to regular error handling
        }
      }
      
      // Create structured error with status code if available
      const statusCode = (err as any)?.statusCode
      const details = (err as any)?.details
      const authError = createAuthError(errorMessage, statusCode, details)
      
      // Get user-friendly error message
      const displayMessage = getErrorDisplayMessage(authError)
      setError(displayMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null) // Clear error when user starts typing
    if (verificationRequired) setVerificationRequired(null) // Clear verification required when user starts typing
  }

  const handleResendVerification = async () => {
    if (!verificationRequired?.email) return
    
    try {
      setIsLoading(true)
      // Import the resend function
      const { resendVerification } = await import('@/lib/api')
      await resendVerification(verificationRequired.email)
      setError(null)
      setVerificationRequired(null)
      // Show success message
      setError('Verification email sent! Please check your inbox.')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend verification email'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow mb-6 backdrop-blur border" style={{
          backgroundColor: 'var(--brand-white-overlay-10)',
          borderColor: 'var(--brand-gray-200)'
        }}>
          <Shield className="w-8 h-8" style={{color: 'var(--brand-btn-primary-bg)'}} />
        </div>
        <h1 className="text-3xl font-bold mb-2" style={{color: 'var(--brand-text-primary)'}}>
          Welcome back
        </h1>
        <p className="text-lg" style={{color: 'var(--brand-text-secondary)'}}>
          Sign in to your Mr imot developer account
        </p>
      </div>

      {/* Main Card */}
      <div className="rounded-xl border overflow-hidden" style={{backgroundColor: '#ffffff', borderColor: 'var(--brand-gray-200)'}}>
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-green-800 font-medium">
                {SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS}
              </p>
            </div>
          </div>
        )}

        {/* Form Content */}
        <div className="p-8">
          {verificationRequired ? (
            <div className="mb-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-amber-800 mb-1">
                      Email Verification Required
                    </h3>
                    <p className="text-sm text-amber-700 mb-3">
                      {verificationRequired.message}
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={isLoading}
                        className="text-sm bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1 rounded-md transition-colors"
                      >
                        {isLoading ? 'Sending...' : 'Resend Email'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setVerificationRequired(null)}
                        className="text-sm text-amber-600 hover:text-amber-700 px-3 py-1 rounded-md transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="mb-6">
              <AuthError 
                error={error}
                onRetry={() => setError(null)}
                retryLabel="Try Again"
              />
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
              <Input id="email" type="email" autoComplete="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} disabled={isLoading} required />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} disabled={isLoading} required />
                <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">We never store your password in plain text.</p>
              
              {/* Forgot Password - Centered */}
              <div className="flex items-center justify-center pt-1">
                <Link 
                  href="/forgot-password"
                  className="text-sm font-medium hover:underline"
                  style={{color: 'var(--brand-btn-primary-bg)'}}
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Sign In Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing you in...</>) : 'Sign In'}</Button>
          </form>

          {/* Social Login (Future Enhancement) */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-muted-foreground">
                  New to Mr imot?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/register?type=developer">
                <Button variant="outline" className="w-full group">
                  <span>Create your account</span>
                  <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm" style={{color: 'var(--brand-text-muted)'}}>
          By signing in, you agree to our{' '}
          <Link href="/terms-of-service.html" className="font-medium hover:underline" style={{color: 'var(--brand-btn-primary-bg)'}}>
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy-policy.html" className="font-medium hover:underline" style={{color: 'var(--brand-btn-primary-bg)'}}>
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--brand-glass-primary)'}}>
      <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <Suspense fallback={
          <div className="w-full max-w-md mx-auto">
            <div className="bg-card rounded-xl border p-8">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
                <div className="w-8 h-8 bg-muted rounded-full animate-pulse delay-75"></div>
                <div className="w-8 h-8 bg-muted rounded-full animate-pulse delay-150"></div>
              </div>
              <p className="text-center mt-4 text-muted-foreground">
                Loading sign in form...
              </p>
            </div>
          </div>
        }>
          <LoginFormContent />
        </Suspense>
      </div>
    </div>
  )
}
