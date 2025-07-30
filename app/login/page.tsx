"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { FloatingInput } from "@/components/ui/floating-input"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { RememberMeCheckbox } from "@/components/ui/remember-me-checkbox"
import { AuthError } from "@/components/ui/auth-error"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Suspense } from "react"
import { LogIn, CheckCircle, Shield, ArrowRight, Sparkles } from "lucide-react"
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/lib/auth-constants"

function LoginFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

      // TODO: Replace with actual API call
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Login failed')
      }

      // Redirect to dashboard on success
      router.push('/developer/dashboard')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      const predefinedMessage = ERROR_MESSAGES[errorMessage as keyof typeof ERROR_MESSAGES]
      setError(predefinedMessage || errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null) // Clear error when user starts typing
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl shadow-blue-500/25 mb-6">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back
        </h1>
        <p className="text-gray-600 text-lg">
          Sign in to your MrImot developer account
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-500/10 border border-white/20 overflow-hidden">
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
          {error && (
            <div className="mb-6">
              <AuthError 
                error={error}
                onRetry={() => setError(null)}
                retryLabel="Try Again"
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <FloatingInput
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={isLoading}
              required
            />

            {/* Password Field */}
            <FloatingInput
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              showPasswordToggle={true}
              disabled={isLoading}
              required
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <RememberMeCheckbox
                checked={rememberMe}
                onChange={setRememberMe}
                disabled={isLoading}
              />
              
              <Link 
                href="/forgot-password"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <EnhancedButton
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              loadingText="Signing you in..."
              disabled={isLoading}
              icon={!isLoading ? <LogIn size={20} /> : undefined}
            >
              Sign In
            </EnhancedButton>
          </form>

          {/* Social Login (Future Enhancement) */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  New to MrImot?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/register?type=developer">
                <EnhancedButton
                  variant="outline"
                  size="lg"
                  fullWidth
                  icon={<Sparkles size={20} />}
                  className="group"
                >
                  <span>Create your account</span>
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </EnhancedButton>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          By signing in, you agree to our{' '}
          <Link href="/terms-of-service.html" className="text-blue-600 hover:text-blue-700 font-medium">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy-policy.html" className="text-blue-600 hover:text-blue-700 font-medium">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent"></div>
      </div>
      
      {/* Gradient Orbs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <Suspense fallback={
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-500/10 border border-white/20 p-8">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
                <div className="w-8 h-8 bg-blue-500 rounded-full animate-pulse delay-75"></div>
                <div className="w-8 h-8 bg-blue-400 rounded-full animate-pulse delay-150"></div>
              </div>
              <p className="text-center mt-4 text-gray-600 font-medium">
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
