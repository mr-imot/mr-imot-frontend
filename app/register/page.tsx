"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PasswordStrength } from "@/components/ui/password-strength"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { DSButton } from "@/components/ds/ds-button"
import { DSTypography } from "@/components/ds/ds-typography"
import { registerDeveloper } from "@/lib/api"
import { validateForm, getFieldError, type FormData, type ValidationError } from "@/lib/validation"
import { cn } from "@/lib/utils"
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/lib/auth-constants"
import Link from "next/link"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react"

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
      
      // Reset form on success
      setFormData({
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

  const renderField = (
    field: keyof FormData,
    label: string,
    type: string = "text",
    placeholder: string = "",
    required: boolean = true
  ) => {
    const error = getFieldError(errors, field)
    const isPasswordField = type === "password"
    const showPasswordToggle = field === "password" || field === "confirmPassword"
    const isPasswordVisible = field === "password" ? showPassword : showConfirmPassword

    return (
      <div className="space-y-ds-2">
        <DSTypography
          as="label"
          htmlFor={field}
          variant="sm"
          weight="medium"
          color="neutral-800"
          className="block cursor-pointer"
        >
          {label}
          {required && <span className="text-red-500 ml-1 font-bold">*</span>}
        </DSTypography>
        <div className="relative group">
          <Input
            id={field}
            type={isPasswordField && isPasswordVisible ? "text" : type}
            placeholder={placeholder}
            value={formData[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            required={required}
            className={cn(
              "w-full h-12 px-ds-3 border-2 rounded-ds bg-white shadow-ds-sm transition-all duration-200",
              "border-ds-neutral-200 focus:border-ds-primary-500 focus:ring-2 focus:ring-ds-primary-100",
              "placeholder:text-ds-neutral-400 text-ds-neutral-800",
              "hover:border-ds-neutral-300 hover:shadow-ds",
              error && "border-red-400 focus:border-red-500 focus:ring-red-100 bg-red-50/30"
            )}
            aria-describedby={error ? `${field}-error` : undefined}
            aria-invalid={!!error}
          />
          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => {
                if (field === "password") {
                  setShowPassword(!showPassword)
                } else {
                  setShowConfirmPassword(!showConfirmPassword)
                }
              }}
              className={cn(
                "absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-sm",
                "text-ds-neutral-500 hover:text-ds-primary-600 hover:bg-ds-primary-50",
                "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ds-primary-200"
              )}
              aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            >
              {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        {error && (
          <div 
            id={`${field}-error`}
            className="flex items-start gap-ds-2 p-ds-2 bg-red-50 border border-red-200 rounded-ds"
            role="alert"
          >
            <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
            <DSTypography
              variant="sm"
              weight="medium"
              className="text-red-700"
            >
              {error}
            </DSTypography>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white/95 backdrop-blur-sm shadow-ds-lg border border-ds-neutral-200 rounded-ds overflow-hidden">
      <CardHeader className="text-center bg-gradient-to-br from-ds-primary-50 to-ds-accent-50 py-ds-6 px-ds-4">
        <DSTypography 
          as="h1" 
          variant="2xl" 
          weight="bold" 
          color="primary"
          className="mb-ds-2"
        >
          {title}
        </DSTypography>
        <DSTypography 
          as="p" 
          variant="base" 
          weight="normal" 
          color="neutral-700"
          className="max-w-md mx-auto"
        >
          {description}
        </DSTypography>
      </CardHeader>
      <CardContent className="p-ds-6 bg-ds-neutral-50/30">
        {submitStatus.type && (
          <Alert 
            variant={submitStatus.type === "error" ? "destructive" : "default"}
            className={cn(
              "mb-ds-4 border-l-4 rounded-ds shadow-ds-sm",
              submitStatus.type === "success" 
                ? "border-l-ds-accent-500 bg-ds-accent-50/50" 
                : "border-l-red-500"
            )}
          >
            <div className="flex items-center gap-ds-2">
              {submitStatus.type === "success" ? (
                <CheckCircle className="h-5 w-5 text-ds-accent-600" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <AlertDescription className="font-medium">
                {submitStatus.message}
              </AlertDescription>
            </div>
          </Alert>
        )}

                <form onSubmit={handleSubmit} className="space-y-ds-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-ds-4">
            {renderField("companyName", "Company Name", "text", "Your Company Ltd.", true)}
            {renderField("contactPerson", "Contact Person", "text", "John Doe", true)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-ds-4">
            {renderField("email", "Email Address", "email", "your@example.com", true)}
            {renderField("phone", "Phone Number", "tel", "+1 (555) 123-4567", true)}
          </div>

          {renderField("officeAddress", "Office Address", "text", "123 Business St, City, Country", true)}

          {renderField("website", "Website URL (Optional)", "url", "https://yourcompany.com", false)}

          <div className="space-y-ds-3">
            {renderField("password", "Password", "password", "", true)}
            <PasswordStrength password={formData.password} />
          </div>

          {renderField("confirmPassword", "Confirm Password", "password", "", true)}

                      {/* Terms of Service Checkbox */}
          <div className="space-y-ds-2 p-ds-3 bg-ds-neutral-50 border border-ds-neutral-200 rounded-ds">
            <div className="flex items-start gap-ds-3">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={formData.acceptTerms}
                onChange={(e) => handleInputChange("acceptTerms", e.target.checked)}
                required
                className={cn(
                  "mt-1 h-5 w-5 rounded border-2 transition-all duration-200",
                  "border-ds-neutral-300 text-ds-primary-600 focus:ring-2 focus:ring-ds-primary-200",
                  "hover:border-ds-primary-400 cursor-pointer",
                  getFieldError(errors, "acceptTerms") && "border-red-400 focus:ring-red-200"
                )}
                aria-describedby={getFieldError(errors, "acceptTerms") ? "acceptTerms-error" : undefined}
                aria-invalid={!!getFieldError(errors, "acceptTerms")}
              />
              <DSTypography
                as="label"
                htmlFor="acceptTerms"
                variant="sm"
                weight="normal"
                color="neutral-700"
                className="leading-relaxed cursor-pointer flex-1"
              >
                I agree to the{' '}
                <a 
                  href="/terms-of-service.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-ds-primary-600 hover:text-ds-primary-700 font-medium underline decoration-2 underline-offset-2 hover:decoration-ds-primary-300 transition-all duration-200"
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a 
                  href="/privacy-policy.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-ds-primary-600 hover:text-ds-primary-700 font-medium underline decoration-2 underline-offset-2 hover:decoration-ds-primary-300 transition-all duration-200"
                >
                  Privacy Policy
                </a>
                <span className="text-red-500 ml-1 font-bold">*</span>
              </DSTypography>
            </div>
            {getFieldError(errors, "acceptTerms") && (
              <div 
                id="acceptTerms-error"
                className="flex items-start gap-ds-2 p-ds-2 bg-red-50 border border-red-200 rounded-ds ml-8"
                role="alert"
              >
                <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                <DSTypography
                  variant="sm"
                  weight="medium"
                  className="text-red-700"
                >
                  {getFieldError(errors, "acceptTerms")}
                </DSTypography>
              </div>
            )}
          </div>

            <DSButton
            type="submit"
            disabled={isLoading}
            variant="primary"
            size="lg"
            className="w-full mt-ds-6 font-semibold text-base shadow-ds-md hover:shadow-ds-lg transform hover:-translate-y-0.5 transition-all duration-200"
          >
            {isLoading ? (
              <div className="flex items-center gap-ds-2">
                <LoadingSpinner size="sm" className="text-white" />
                <span>Creating Your Account...</span>
              </div>
            ) : (
              <div className="flex items-center gap-ds-2">
                <span>Create Developer Account</span>
                <CheckCircle size={18} className="opacity-80" />
              </div>
            )}
          </DSButton>
        </form>

        <div className="mt-ds-6 pt-ds-4 border-t border-ds-neutral-200 text-center">
          <DSTypography
            variant="sm"
            weight="normal"
            color="neutral-600"
            className="inline"
          >
            Already have an account?{" "}
          </DSTypography>
          <Link 
            href="/login" 
            className="inline-flex items-center gap-1 text-ds-primary-600 hover:text-ds-primary-700 font-medium underline decoration-2 underline-offset-2 hover:decoration-ds-primary-300 transition-all duration-200"
          >
            Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-72px)] bg-gradient-to-br from-ds-primary-50 via-white to-ds-accent-50 py-ds-8 px-ds-2">
      <div className="flex items-center justify-center">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-ds-2">
              <LoadingSpinner size="md" className="text-ds-primary-600" />
              <DSTypography variant="base" weight="medium" color="neutral-700">
                Loading registration form...
              </DSTypography>
            </div>
          </div>
        }>
          <RegisterFormContent />
        </Suspense>
      </div>
    </div>
  )
}


