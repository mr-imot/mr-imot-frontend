"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PasswordStrength } from "@/components/ui/password-strength"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { FloatingInput } from "@/components/ui/floating-input"
import { InternationalPhoneInput } from "@/components/ui/international-phone-input"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { AuthError } from "@/components/ui/auth-error"
import { EmailVerificationSent } from "@/components/auth/email-verification-sent"
import { registerDeveloper } from "@/lib/api"
import { validateForm, getFieldError, type FormData, type ValidationError } from "@/lib/validation"
import { cn } from "@/lib/utils"
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/lib/auth-constants"
import Link from "next/link"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Eye, EyeOff, CheckCircle, AlertCircle, Shield, Sparkles, UserPlus, ArrowLeft } from "lucide-react"

function RegisterFormContent() {
  const searchParams = useSearchParams()
  const userType = searchParams.get("type")

  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    officeAddress: "",
    password: "",
    confirmPassword: "",
    website: "",
    acceptTerms: false
  })

  const [errors, setErrors] = useState<ValidationError[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })

  const title = userType === "developer" ? "Register as Developer" : "Register as Buyer"
  const description =
    userType === "developer"
      ? "Create your developer account to list projects."
      : "Create your buyer account to find projects."

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear field-specific error when user starts typing
    if (errors.some(error => error.field === field)) {
      setErrors(prev => prev.filter(error => error.field !== field))
    }
    
    // Clear submit status when user makes changes
    if (submitStatus.type) {
      setSubmitStatus({ type: null, message: "" })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const validationErrors = validateForm(formData)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)
    setSubmitStatus({ type: null, message: "" })

    try {
      const response = await registerDeveloper({
        company_name: formData.companyName.trim(),
        contact_person: formData.contactPerson.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        office_address: formData.officeAddress.trim(),
        password: formData.password,
        accept_terms: formData.acceptTerms,
        website: formData.website?.trim() || undefined
      })

      setSubmitStatus({
        type: "success",
        message: SUCCESS_MESSAGES.REGISTRATION_SUCCESS
      })
      
      // Don't reset form data immediately - we need the email for the verification component
      // Form will be reset when user navigates away or manually resets
      
    } catch (error: any) {
      console.error("Registration error:", error)
      
      let errorMessage = "Registration failed. Please try again."
      
      if (error.message?.includes("400")) {
        errorMessage = "Please check your information and try again."
      } else if (error.message?.includes("409")) {
        errorMessage = "An account with this email already exists."
      } else if (error.message?.includes("500")) {
        errorMessage = "Server error. Please try again later."
      } else if (error.message?.includes("accept the Terms")) {
        setErrors([{ field: "acceptTerms", message: "You must accept the Terms of Service and Privacy Policy" }])
        setIsLoading(false)
        return
      } else {
        // Use predefined error messages or fallback
        const predefinedMessage = ERROR_MESSAGES[error.message as keyof typeof ERROR_MESSAGES]
        errorMessage = predefinedMessage || errorMessage
      }
      
      setSubmitStatus({
        type: "error",
        message: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl shadow-blue-500/25 mb-6">
          <UserPlus className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {title}
        </h1>
        <p className="text-gray-600 text-lg">
          {description}
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-500/10 border border-white/20 overflow-hidden">
        <div className="p-8">
          {submitStatus.type === "success" ? (
            <EmailVerificationSent
              email={formData.email}
              onResend={async () => {
                // Resend verification email
                await registerDeveloper({
                  company_name: formData.companyName.trim(),
                  contact_person: formData.contactPerson.trim(),
                  email: formData.email.trim(),
                  phone: formData.phone.trim(),
                  office_address: formData.officeAddress.trim(),
                  password: formData.password,
                  accept_terms: formData.acceptTerms,
                  website: formData.website?.trim() || undefined
                })
              }}
              className="mb-6"
            />
          ) : submitStatus.type === "error" ? (
            <div className="mb-6">
              <AuthError 
                error={submitStatus.message}
                onRetry={() => setSubmitStatus({ type: null, message: "" })}
                retryLabel="Try Again"
              />
            </div>
          ) : null}

          {/* Hide form when showing email verification */}
          {submitStatus.type !== "success" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingInput
                label="Company Name"
                type="text"
                value={formData.companyName}
                onChange={(e) => handleInputChange("companyName", e.target.value)}
                error={getFieldError(errors, "companyName")}
                disabled={isLoading}
                required
              />
              <FloatingInput
                label="Contact Person"
                type="text"
                value={formData.contactPerson}
                onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                error={getFieldError(errors, "contactPerson")}
                disabled={isLoading}
                required
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingInput
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                error={getFieldError(errors, "email")}
                disabled={isLoading}
                required
              />
              <InternationalPhoneInput
                label="Phone Number"
                value={formData.phone}
                onChange={(phone) => handleInputChange("phone", phone)}
                error={getFieldError(errors, "phone")}
                disabled={isLoading}
                required
                defaultCountry="bg"
                placeholder="Enter your phone number"
              />
            </div>

            {/* Address */}
            <FloatingInput
              label="Office Address"
              type="text"
              value={formData.officeAddress}
              onChange={(e) => handleInputChange("officeAddress", e.target.value)}
              error={getFieldError(errors, "officeAddress")}
              disabled={isLoading}
              required
            />

            {/* Website */}
            <FloatingInput
              label="Website URL (Optional)"
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange("website", e.target.value)}
              error={getFieldError(errors, "website")}
              disabled={isLoading}
            />

            {/* Password */}
            <div className="space-y-4">
              <FloatingInput
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                showPasswordToggle={true}
                error={getFieldError(errors, "password")}
                disabled={isLoading}
                required
              />
              <PasswordStrength password={formData.password} />
            </div>

            {/* Confirm Password */}
            <FloatingInput
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              showPasswordToggle={true}
              error={getFieldError(errors, "confirmPassword")}
              disabled={isLoading}
              required
            />

            {/* Terms Checkbox */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={(e) => handleInputChange("acceptTerms", e.target.checked)}
                  required
                  className="mt-1 h-5 w-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  disabled={isLoading}
                />
                <label htmlFor="acceptTerms" className="text-sm text-gray-700 leading-relaxed cursor-pointer flex-1">
                  I agree to the{' '}
                  <a 
                    href="/terms-of-service.html" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-medium underline decoration-2 underline-offset-2 transition-colors"
                  >
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a 
                    href="/privacy-policy.html" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-medium underline decoration-2 underline-offset-2 transition-colors"
                  >
                    Privacy Policy
                  </a>
                  <span className="text-red-500 ml-1 font-bold">*</span>
                </label>
              </div>
              {getFieldError(errors, "acceptTerms") && (
                <div className="mt-3 ml-8 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-700 font-medium">
                      {getFieldError(errors, "acceptTerms")}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <EnhancedButton
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              loadingText="Creating Your Account..."
              disabled={isLoading}
              icon={!isLoading ? <Sparkles size={20} /> : undefined}
            >
              Create Developer Account
            </EnhancedButton>
          </form>
          )}

          {/* Sign In Link - hide when showing email verification */}
          {submitStatus.type !== "success" && (
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/login">
                <EnhancedButton
                  variant="outline"
                  size="lg"
                  fullWidth
                  className="group"
                >
                  <span>Sign In</span>
                  <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                </EnhancedButton>
              </Link>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          By creating an account, you agree to our{' '}
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

export default function RegisterPage() {
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
                Loading registration form...
              </p>
            </div>
          </div>
        }>
          <RegisterFormContent />
        </Suspense>
      </div>
    </div>
  )
}


