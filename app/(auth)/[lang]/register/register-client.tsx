"use client"

import React, { useState, useEffect } from "react"
import clsx from "clsx"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PasswordStrength } from "@/components/ui/password-strength"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { FloatingInput } from "@/components/ui/floating-input"
import { InternationalPhoneInput } from "@/components/ui/international-phone-input"
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
import { useAuth } from "@/lib/auth-context"
import { ensureGoogleMaps } from "@/lib/google-maps"
import { AddressSearchField } from "@/components/address-search-field"
import { preventEnterSubmit } from "@/lib/form-utils"
import Link from "next/link"
import { Image } from "@imagekit/next"
import { toIkPath } from "@/lib/imagekit"
import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Eye, EyeOff, CheckCircle, AlertCircle, Shield, Sparkles, UserPlus, Building2, Clock, BarChart3, LayoutDashboard, Mail, PhoneCall, UserCheck, Loader2, Headphones } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { HybridTooltip } from "@/components/ui/hybrid-tooltip"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useLocale } from "@/lib/locale-context"
import heroStyles from "@/app/(public)/[lang]/homepage-hero.module.css"
import typographyStyles from "@/components/typography.module.css"

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: typeof google
  }
}

interface RegisterClientProps {
  dict: any
  lang: 'en' | 'bg'
}

// Alias for backward compatibility - using HybridTooltip directly
const WebsiteTooltip = HybridTooltip

function RegisterFormContent({ dict, lang }: RegisterClientProps) {
  const searchParams = useSearchParams()
  const userType = searchParams.get("type")
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, getDashboardUrl } = useAuth()

  // Block access if type is not developer - redirect to trigger not-found
  useEffect(() => {
    if (userType !== "developer") {
      // Redirect to non-existent route to trigger Next.js not-found handler
      router.replace(`/${lang}/__404__`)
    }
  }, [userType, router, lang])

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(getDashboardUrl())
    }
  }, [isAuthenticated, authLoading, router, getDashboardUrl])

  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    officeAddress: "",
    password: "",
    confirmPassword: "",
    website: "",
    acceptTerms: false,
    officeLatitude: undefined,
    officeLongitude: undefined
  })

  const [errors, setErrors] = useState<ValidationError[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })

  const locale = useLocale()

  // Helper function to generate localized URLs
  const href = (en: string, bg: string) => {
    return locale === 'bg' ? `/bg/${bg}` : `/${en}`
  }

  // Only developer registration is allowed
  const isDeveloper = userType === "developer"

  // Forward geocode: address string → coordinates (used on blur and on submit when coords missing)
  const forwardGeocode = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    if (!address || !address.trim()) return null
    try {
      const google = await ensureGoogleMaps()
      const geocoder = new google.maps.Geocoder()
      return new Promise((resolve) => {
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location
            const newPosition = { lat: location.lat(), lng: location.lng() }
            const formattedAddress = results[0].formatted_address || address
            setFormData(prev => ({
              ...prev,
              officeLatitude: newPosition.lat,
              officeLongitude: newPosition.lng,
              officeAddress: formattedAddress,
            }))
            resolve(newPosition)
          } else if (status === 'REQUEST_DENIED' || status === 'OVER_QUERY_LIMIT') {
            console.warn('Geocoding request denied or quota exceeded. Enable "Geocoding API" for this key in Google Cloud Console.')
            resolve(null)
          } else if (status !== 'ZERO_RESULTS') {
            console.warn('Geocoding failed with status:', status)
            resolve(null)
          } else {
            resolve(null)
          }
        })
      })
    } catch (error) {
      console.error('Error forward geocoding:', error)
      return null
    }
  }

  const handleAddressSelect = ({ lat, lng, address }: { lat: number; lng: number; address: string }) => {
    setFormData((prev) => ({
      ...prev,
      officeLatitude: lat,
      officeLongitude: lng,
      officeAddress: address,
    }))
  }

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
    
    setIsLoading(true)
    setSubmitStatus({ type: null, message: "" })

    // If address is provided but coordinates are missing, try to geocode first
    let finalLatitude = formData.officeLatitude
    let finalLongitude = formData.officeLongitude
    
    if (formData.officeAddress && (!finalLatitude || !finalLongitude)) {
      const geocodeResult = await forwardGeocode(formData.officeAddress.trim())
      if (geocodeResult) {
        finalLatitude = geocodeResult.lat
        finalLongitude = geocodeResult.lng
        // Update form data with geocoded coordinates
        setFormData(prev => ({
          ...prev,
          officeLatitude: finalLatitude,
          officeLongitude: finalLongitude
        }))
      }
    }
    
    // Create updated form data with final coordinates for validation
    const updatedFormData = {
      ...formData,
      officeLatitude: finalLatitude,
      officeLongitude: finalLongitude
    }
    
    // Validate form
    const validationErrors = validateForm(updatedFormData, dict)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      setIsLoading(false)
      return
    }

    try {
      const response = await registerDeveloper({
        company_name: updatedFormData.companyName.trim(),
        contact_person: updatedFormData.contactPerson.trim(),
        email: updatedFormData.email.trim(),
        phone: updatedFormData.phone.trim(),
        office_address: updatedFormData.officeAddress.trim(),
        password: updatedFormData.password,
        accept_terms: updatedFormData.acceptTerms,
        website: updatedFormData.website?.trim() || undefined,
        office_latitude: finalLatitude,
        office_longitude: finalLongitude
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
        setErrors([{ field: "acceptTerms", message: dict.validation?.acceptTermsRequired || "You must accept the Terms of Service and Privacy Policy" }])
        setIsLoading(false)
        return
      }
      
      // Create structured error
      const statusCode = error?.statusCode
      const details = error?.details
      const authError = createAuthError(errorMessage, statusCode, details, dict)
      
      // Get user-friendly error message
      const displayMessage = getErrorDisplayMessage(authError, dict)
      
      setSubmitStatus({
        type: "error",
        message: displayMessage
      })
    } finally {
      setIsLoading(false)
    }
  }



  // Only developer registration is allowed - return null if not developer
  if (!isDeveloper) {
    return null
  }

  const hero = dict.register?.hero as Record<string, string> | undefined
  const formTitle = dict.register?.formTitle ?? "Кандидатствай за достъп"
  // Hero split: left copy top-aligned, right form card. items-start so headline stays above-the-fold; no sticky.
  return (
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-8 lg:gap-12 items-start">
          {/* Hero left column – top-aligned, max-w-prose, controlled spacing */}
          <div className="flex flex-col max-w-prose min-w-0 pt-2 lg:pt-4 space-y-5 lg:space-y-6">
            <h1 className={clsx("tracking-tight font-serif font-extrabold", heroStyles.heroTitle)} style={{ lineHeight: "1.1" }}>
              <span className={typographyStyles.headlineGradient}>
                {hero?.h1 ?? "Купувачите искат да се свържат с теб. Не с брокер."}
              </span>
            </h1>
            <p className="text-lg text-foreground/90 font-normal leading-relaxed font-sans">
              {hero?.subheadline ?? "Крайният купувач търси директен контакт със строителя. Мистър Имот премахва брокерите от процеса и свързва клиента директно с теб или твоя сейлс екип."}
            </p>
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5" aria-hidden>
                  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm sm:text-base text-foreground/80">{hero?.bullet1 ?? "Един проект на едно място, не десетки брокерски обяви"}</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5" aria-hidden>
                  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm sm:text-base text-foreground/80">{hero?.bullet2 ?? "Директен контакт с реални купувачи"}</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5" aria-hidden>
                  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm sm:text-base text-foreground/80">{hero?.bullet3 ?? "Гаранция: снимките ти няма да се появят в чужди обяви"}</span>
              </div>
            </div>
            {(dict.register?.finalCta as Record<string, string> | undefined)?.imageUrl && (
              <div className="flex justify-center lg:justify-start pt-2">
                <Image
                  src={toIkPath((dict.register?.finalCta as Record<string, string>).imageUrl)}
                  alt={((dict.register?.finalCta as Record<string, string> | undefined)?.imageAlt) ?? ""}
                  width={270}
                  height={202}
                  loading="eager"
                  className="w-auto h-auto"
                  style={{
                    filter: "drop-shadow(0 12px 28px rgba(0, 0, 0, 0.12))",
                    width: "clamp(170px, 17vw, 270px)",
                    height: "auto",
                  }}
                  sizes="(max-width: 1024px) 45vw, 270px"
                />
              </div>
            )}
          </div>

          {/* Form column – full width, no artificial cap */}
          <div className="w-full min-w-0 mx-auto lg:mx-0">
            <Card id="application-form" className="w-full max-w-full bg-card border rounded-xl shadow-sm scroll-mt-24">
            <CardHeader className="space-y-1 pb-2">
              <CardTitle className="text-xl font-semibold tracking-tight font-serif">{formTitle}</CardTitle>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 pt-0">
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
                    retryLabel={dict.register?.tryAgain || "Try Again"}
                  />
                </div>
              ) : null}

              {submitStatus.type !== "success" && (
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 min-h-[44px]">
                      <Label htmlFor="companyName">{dict.register?.companyName || "Company Name"} <span className="text-destructive">*</span></Label>
                      <Input id="companyName" value={formData.companyName} onChange={(e) => handleInputChange("companyName", e.target.value)} onKeyDown={preventEnterSubmit} autoComplete="organization" disabled={isLoading} required />
                      {getFieldError(errors, "companyName") && (<p className="text-sm text-destructive">{getFieldError(errors, "companyName")}</p>)}
                    </div>
                    <div className="space-y-2 min-h-[44px]">
                      <Label htmlFor="contactPerson">{dict.register?.contactPerson || "Contact Person"} <span className="text-destructive">*</span></Label>
                      <Input id="contactPerson" value={formData.contactPerson} onChange={(e) => handleInputChange("contactPerson", e.target.value)} onKeyDown={preventEnterSubmit} autoComplete="name" disabled={isLoading} required />
                      {getFieldError(errors, "contactPerson") && (<p className="text-sm text-destructive">{getFieldError(errors, "contactPerson")}</p>)}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 min-h-[44px]">
                      <Label htmlFor="email">{dict.register?.emailAddress || "Email Address"} <span className="text-destructive">*</span></Label>
                      <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} onKeyDown={preventEnterSubmit} autoComplete="email" disabled={isLoading} required />
                      {getFieldError(errors, "email") && (<p className="text-sm text-destructive">{getFieldError(errors, "email")}</p>)}
                    </div>
                    <InternationalPhoneInput label={dict.register?.phoneNumber || "Phone Number"} value={formData.phone} onChange={(phone) => handleInputChange("phone", phone)} error={getFieldError(errors, "phone")} disabled={isLoading} required defaultCountry="bg" placeholder={dict.register?.enterPhoneNumber || "Enter your phone number"} />
                  </div>

                  <div className="space-y-2 min-h-[44px]">
                    <Label htmlFor="officeAddress">{dict.register?.officeAddress || "Office Address"} <span className="text-destructive">*</span></Label>
                    <AddressSearchField
                      value={formData.officeAddress}
                      onChange={(v) => handleInputChange("officeAddress", v)}
                      onSelect={({ lat, lng, address }) => handleAddressSelect({ lat, lng, address })}
                      onBlur={(address) => { if (address && (!formData.officeLatitude || !formData.officeLongitude)) forwardGeocode(address) }}
                      placeholder={dict.register?.searchForOfficeAddress || "Search for office address"}
                      className="w-full"
                    />
                    {getFieldError(errors, "officeAddress") && (<p className="text-sm text-destructive">{getFieldError(errors, "officeAddress")}</p>)}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">
                      <WebsiteTooltip triggerText={dict.register?.websiteUrlOptional || "Website URL (Optional)"} content={<>{dict.register?.websiteOffer || "As our client, take advantage of the most competitive prices for website development from"}{" "}<a href="https://www.prodigycorp.io/bg" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium" onClick={(e) => e.stopPropagation()}>Prodigy Corp</a></>} />
                    </Label>
                    <Input id="website" type="url" placeholder="https://" value={formData.website} onChange={(e) => handleInputChange("website", e.target.value)} autoComplete="url" disabled={isLoading} />
                    {getFieldError(errors, "website") && (<p className="text-sm text-destructive">{getFieldError(errors, "website")}</p>)}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 min-h-[44px]">
                      <Label htmlFor="password">{dict.register?.password || "Password"} <span className="text-destructive">*</span></Label>
                      <Input id="password" type="password" value={formData.password} onChange={(e) => handleInputChange("password", e.target.value)} onKeyDown={preventEnterSubmit} autoComplete="new-password" disabled={isLoading} required maxLength={72} />
                      <PasswordStrength password={formData.password} />
                      {getFieldError(errors, "password") && (<p className="text-sm text-destructive">{getFieldError(errors, "password")}</p>)}
                    </div>
                    <div className="space-y-2 min-h-[44px]">
                      <Label htmlFor="confirmPassword">{dict.register?.confirmPassword || "Confirm Password"} <span className="text-destructive">*</span></Label>
                      <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={(e) => handleInputChange("confirmPassword", e.target.value)} onKeyDown={preventEnterSubmit} autoComplete="new-password" disabled={isLoading} required maxLength={72} />
                      {getFieldError(errors, "confirmPassword") && (<p className="text-sm text-destructive">{getFieldError(errors, "confirmPassword")}</p>)}
                    </div>
                  </div>

                  <div className="bg-muted rounded-md p-3 border">
                    <div className="flex items-start gap-2">
                      <Checkbox id="acceptTerms" checked={formData.acceptTerms} onCheckedChange={(v) => handleInputChange("acceptTerms", v === true)} disabled={isLoading} className="mt-0.5" />
                      <Label htmlFor="acceptTerms" className="text-xs text-foreground leading-relaxed cursor-pointer flex-1">
                        {dict.register?.iAgreeToThe || "I agree to the"}{" "}
                        <Link href={href("terms-of-service", "terms-of-service")} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">{dict.register?.termsOfService || "Terms of Service"}</Link>{" "}
                        {dict.register?.and || "and"}{" "}
                        <Link href={href("privacy-policy", "privacy-policy")} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">{dict.register?.privacyPolicy || "Privacy Policy"}</Link>
                        <span className="text-destructive ml-1 font-bold">*</span>
                      </Label>
                    </div>
                    {getFieldError(errors, "acceptTerms") && (
                      <div className="mt-2 ml-6 p-2 bg-destructive/10 border border-destructive/30 rounded-md">
                        <div className="flex items-start gap-2">
                          <AlertCircle size={14} className="text-destructive mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-destructive font-medium">{getFieldError(errors, "acceptTerms")}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Button type="submit" className="w-full h-11 sm:h-10 font-semibold" disabled={isLoading}>
                  {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {dict.register?.creatingAccount || "Creating Account..."}</>) : (<>{dict.register?.applyForAccess ?? "Apply for access"}</>)}
                </Button>
              </form>
              )}
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    )
}

export default function RegisterClient({ dict, lang }: RegisterClientProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative z-10 flex items-start justify-center pt-6 pb-12 sm:pt-8 lg:pt-10 px-4 sm:px-6 lg:px-8">
        <Suspense fallback={
          <div className="w-full max-w-md mx-auto">
            <div className="bg-card rounded-xl border p-8">
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
              <p className="text-center mt-4 text-muted-foreground">{dict.register?.loadingRegistrationForm || "Loading registration form..."}</p>
            </div>
          </div>
        }>
          <RegisterFormContent dict={dict} lang={lang} />
        </Suspense>
      </div>
    </div>
  )
}

