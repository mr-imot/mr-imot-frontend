"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PasswordStrength } from "@/components/ui/password-strength"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { FloatingInput } from "@/components/ui/floating-input"
import { InternationalPhoneInput } from "@/components/ui/international-phone-input"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { AuthError } from "@/components/ui/auth-error"
import { EmailVerificationSent } from "@/components/auth/email-verification-sent"
import { registerDeveloper } from "@/lib/api"
import { validateForm, getFieldError, type FormData, type ValidationError } from "@/lib/validation"
import { cn } from "@/lib/utils"
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/lib/auth-constants"
import { createAuthError, getErrorDisplayMessage } from "@/lib/auth-errors"
import { useUnifiedAuth } from "@/lib/unified-auth"
import Link from "next/link"
import { Suspense, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Eye, EyeOff, CheckCircle, AlertCircle, Shield, Sparkles, UserPlus, ArrowLeft, Building2, Check, Clock, BarChart3, LayoutDashboard, Mail, PhoneCall, UserCheck, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

function RegisterFormContent() {
  const searchParams = useSearchParams()
  const userType = searchParams.get("type")
  const router = useRouter()
  const { isAuthenticated, isLoading: unifiedLoading, getDashboardUrl } = useUnifiedAuth()

  // Redirect if already authenticated
  useEffect(() => {
    if (!unifiedLoading && isAuthenticated) {
      router.replace(getDashboardUrl())
    }
  }, [isAuthenticated, unifiedLoading, router, getDashboardUrl])

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

  const isDeveloper = userType === "developer"
  const title = isDeveloper ? "Register as Developer" : "Register as Buyer"
  const description = isDeveloper
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
      
      const errorMessage = error.message || "Registration failed. Please try again."
      
      // Handle terms acceptance as special field-specific error
      if (errorMessage.toLowerCase().includes("terms") || errorMessage.toLowerCase().includes("accept")) {
        setErrors([{ field: "acceptTerms", message: "You must accept the Terms of Service and Privacy Policy" }])
        setIsLoading(false)
        return
      }
      
      // Create structured error
      const statusCode = error?.statusCode
      const details = error?.details
      const authError = createAuthError(errorMessage, statusCode, details)
      
      // Get user-friendly error message
      const displayMessage = getErrorDisplayMessage(authError)
      
      setSubmitStatus({
        type: "error",
        message: displayMessage
      })
    } finally {
      setIsLoading(false)
    }
  }



  // Developer-specific layout with informative left column
  if (isDeveloper) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 items-start">
          {/* Info column */}
          <Card className="bg-card border shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="secondary" className="w-max">For Developers</Badge>
                <Badge className="w-max" variant="outline">100% Free</Badge>
              </div>
              <CardTitle className="text-2xl">Why register on Mr imot?</CardTitle>
              <CardDescription>Publish projects, reach verified buyers, and manage inbound leads in one place.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Verified presence</p>
                    <p className="text-sm text-muted-foreground">Show a trusted, verified profile for your company and projects.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">High‑intent leads</p>
                    <p className="text-sm text-muted-foreground">Buyers contact you directly — no brokers, no commission.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <LayoutDashboard className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Developer dashboard</p>
                    <p className="text-sm text-muted-foreground">Manage listings, inquiries, and view stats in your private dashboard.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BarChart3 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Project analytics</p>
                    <p className="text-sm text-muted-foreground">Track views and leads to understand interest over time.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Faster launch</p>
                    <p className="text-sm text-muted-foreground">Create a profile in minutes; publish when you are ready.</p>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <p className="font-medium">What you’ll need</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5" />Company name and contact person</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5" />Company email and phone</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5" />Office address and optional website</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5" />Ability to verify ownership when requested</li>
                </ul>
              </div>

              <Separator />
              <div className="space-y-3">
                <p className="font-medium">Verification process</p>
                <ol className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-0.5">Step 1</Badge>
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-muted-foreground">Email verification to secure your login.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-0.5">Step 2</Badge>
                    <div className="flex items-start gap-2">
                      <PhoneCall className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-muted-foreground">Manual verification by phone or email for trust.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-0.5">Step 3</Badge>
                    <div className="flex items-start gap-2">
                      <UserCheck className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-muted-foreground">Optional in‑person verification for premium trust badge.</span>
                    </div>
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Form column */}
          <Card className="bg-card border shadow-sm">
            <CardHeader>
              <CardTitle>Register as Developer</CardTitle>
              <CardDescription>Create your account to list projects and receive leads.</CardDescription>
            </CardHeader>
            <CardContent>
              {submitStatus.type === "success" ? (
                <EmailVerificationSent
                  email={formData.email}
                  onResend={async () => {
                    const { resendVerification } = await import('@/lib/api')
                    await resendVerification(formData.email.trim())
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

              {submitStatus.type !== "success" && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name <span className="text-destructive">*</span></Label>
                    <Input id="companyName" value={formData.companyName} onChange={(e) => handleInputChange("companyName", e.target.value)} autoComplete="organization" disabled={isLoading} required />
                    {getFieldError(errors, "companyName") && (<p className="text-sm text-destructive">{getFieldError(errors, "companyName")}</p>)}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person <span className="text-destructive">*</span></Label>
                    <Input id="contactPerson" value={formData.contactPerson} onChange={(e) => handleInputChange("contactPerson", e.target.value)} autoComplete="name" disabled={isLoading} required />
                    {getFieldError(errors, "contactPerson") && (<p className="text-sm text-destructive">{getFieldError(errors, "contactPerson")}</p>)}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} autoComplete="email" disabled={isLoading} required />
                    {getFieldError(errors, "email") && (<p className="text-sm text-destructive">{getFieldError(errors, "email")}</p>)}
                  </div>
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
                <div className="space-y-2">
                  <Label htmlFor="officeAddress">Office Address <span className="text-destructive">*</span></Label>
                  <Input id="officeAddress" value={formData.officeAddress} onChange={(e) => handleInputChange("officeAddress", e.target.value)} autoComplete="street-address" disabled={isLoading} required />
                  {getFieldError(errors, "officeAddress") && (<p className="text-sm text-destructive">{getFieldError(errors, "officeAddress")}</p>)}
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="website">Website URL (Optional)</Label>
                  <Input id="website" type="url" placeholder="https://" value={formData.website} onChange={(e) => handleInputChange("website", e.target.value)} autoComplete="url" disabled={isLoading} />
                  {getFieldError(errors, "website") && (<p className="text-sm text-destructive">{getFieldError(errors, "website")}</p>)}
                </div>

                {/* Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                  <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
                    <Input id="password" type="password" value={formData.password} onChange={(e) => handleInputChange("password", e.target.value)} autoComplete="new-password" disabled={isLoading} required />
                    <PasswordStrength password={formData.password} />
                    {getFieldError(errors, "password") && (<p className="text-sm text-destructive">{getFieldError(errors, "password")}</p>)}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password <span className="text-destructive">*</span></Label>
                    <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={(e) => handleInputChange("confirmPassword", e.target.value)} autoComplete="new-password" disabled={isLoading} required />
                    {getFieldError(errors, "confirmPassword") && (<p className="text-sm text-destructive">{getFieldError(errors, "confirmPassword")}</p>)}
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="bg-muted rounded-lg p-4 border">
                  <div className="flex items-start gap-3">
                    <Checkbox id="acceptTerms" checked={formData.acceptTerms} onCheckedChange={(v) => handleInputChange("acceptTerms", v === true)} disabled={isLoading} />
                    <Label htmlFor="acceptTerms" className="text-sm text-foreground leading-relaxed cursor-pointer flex-1">
                      I agree to the{' '}
                      <a href="/terms-of-service.html" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">Terms of Service</a>{' '}
                      and{' '}
                      <a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">Privacy Policy</a>
                      <span className="text-destructive ml-1 font-bold">*</span>
                    </Label>
                  </div>
                  {getFieldError(errors, "acceptTerms") && (
                    <div className="mt-3 ml-8 p-3 bg-destructive/10 border border-destructive/30 rounded-md">
                      <div className="flex items-start gap-2">
                        <AlertCircle size={16} className="text-destructive mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-destructive font-medium">{getFieldError(errors, "acceptTerms")}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Your Account...</>) : (<>Create Developer Account</>)}
                </Button>

                <p className="text-xs text-muted-foreground text-center">We never share your information. Used only for account and verification.</p>
              </form>
              )}

              {submitStatus.type !== "success" && (
              <div className="mt-8">
                <div className="relative flex justify-center">
                  <span className="px-4 text-sm text-muted-foreground">Already have an account?</span>
                </div>
                <div className="mt-4">
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
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Default (buyer or no type) layout — keep existing form styling
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
                // Resend verification email using the dedicated endpoint
                const { resendVerification } = await import('@/lib/api')
                await resendVerification(formData.email.trim())
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
    <div className="min-h-screen bg-background">
      <div className="relative z-10 flex items-start justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Suspense fallback={
          <div className="w-full max-w-md mx-auto">
            <div className="bg-card rounded-xl border p-8">
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
              <p className="text-center mt-4 text-muted-foreground">Loading registration form...</p>
            </div>
          </div>
        }>
          <RegisterFormContent />
        </Suspense>
      </div>
    </div>
  )
}


