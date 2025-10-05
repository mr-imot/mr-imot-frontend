"use client"

import { useState, useRef, useMemo, useEffect as useEffectHook } from "react"
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
import { useAuth } from "@/lib/auth-context"
import { ensureGoogleMaps } from "@/lib/google-maps"
import { preventEnterSubmit } from "@/lib/form-utils"
import Link from "next/link"
import { Suspense, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Eye, EyeOff, CheckCircle, AlertCircle, Shield, Sparkles, UserPlus, ArrowLeft, Building2, Check, Clock, BarChart3, LayoutDashboard, Mail, PhoneCall, UserCheck, Loader2, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useLocale } from "@/lib/locale-context"

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

function RegisterFormContent({ dict, lang }: RegisterClientProps) {
  const searchParams = useSearchParams()
  const userType = searchParams.get("type")
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, getDashboardUrl } = useAuth()

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(getDashboardUrl())
    }
  }, [isAuthenticated, authLoading, router, getDashboardUrl])

  // Google Maps refs and state
  const mapRef = useRef<HTMLDivElement | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const addressInputRef = useRef<HTMLInputElement | null>(null)
  
  const [addressSelected, setAddressSelected] = useState(false)
  const [geocodingBlocked, setGeocodingBlocked] = useState(false)
  const [placesBlocked, setPlacesBlocked] = useState(false)
  
  // Default center for Sofia
  const defaultCenter = useMemo(() => ({ lat: 42.6977, lng: 23.3219 }), [])

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

  const isDeveloper = userType === "developer"
  const title = isDeveloper ? (dict.register?.registerAsDeveloper || "Register as Developer") : (dict.register?.registerAsBuyer || "Register as Buyer")
  const description = isDeveloper
      ? (dict.register?.createDeveloperAccount || "Create your developer account to list projects.")
      : (dict.register?.createBuyerAccount || "Create your buyer account to find projects.")

  // Google Maps initialization
  useEffectHook(() => {
    if (!isDeveloper || !mapRef.current) return

    const initMap = async () => {
      try {
        await ensureGoogleMaps()
        const map = new google.maps.Map(mapRef.current!, {
          center: defaultCenter,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          scrollwheel: true,
          draggableCursor: "grab",
          draggingCursor: "grabbing",
        })

        const marker = new google.maps.Marker({
          position: defaultCenter,
          map,
          draggable: true,
          title: "Office Location",
        })

        mapInstanceRef.current = map
        markerRef.current = marker

        // Handle marker drag
        marker.addListener('dragend', () => {
          const position = marker.getPosition()
          if (position) {
            const lat = position.lat()
            const lng = position.lng()
            
            setFormData(prev => ({
              ...prev,
              officeLatitude: lat,
              officeLongitude: lng
            }))
            
            // Reverse geocode to get address
            reverseGeocode(lat, lng)
          }
        })

        // Map click - move marker and update coordinates
        map.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (!e.latLng || !markerRef.current) return
          markerRef.current.setPosition(e.latLng)
          setFormData(prev => ({
            ...prev,
            officeLatitude: e.latLng!.lat(),
            officeLongitude: e.latLng!.lng()
          }))
          reverseGeocode(e.latLng.lat(), e.latLng.lng())
        })

      } catch (error) {
        console.error('Failed to initialize Google Maps:', error)
        setGeocodingBlocked(true)
      }
    }

    initMap()
  }, [isDeveloper, defaultCenter])

  // Places Autocomplete setup
  useEffectHook(() => {
    if (!isDeveloper || !mapInstanceRef.current || !addressInputRef.current) return
    
    const initAutocomplete = async () => {
      try {
        const google = await ensureGoogleMaps()
        
        if (placesBlocked) {
          return
        }
        
        const autocomplete = new google.maps.places.Autocomplete(addressInputRef.current!, {
          componentRestrictions: { country: "bg" },
          fields: ["address_components", "formatted_address", "geometry", "place_id"],
          types: ["address"]
        })

        // Handle place selection
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace()
          
          if (place.geometry && place.geometry.location && mapInstanceRef.current && markerRef.current) {
            const location = place.geometry.location
            const newCenter = { lat: location.lat(), lng: location.lng() }
            
            // Update map and marker
            mapInstanceRef.current.setCenter(newCenter)
            mapInstanceRef.current.setZoom(16)
            markerRef.current.setPosition(newCenter)
            
            // Update form values
            setFormData(prev => ({
              ...prev,
              officeLatitude: newCenter.lat,
              officeLongitude: newCenter.lng,
              officeAddress: place.formatted_address || (addressInputRef.current?.value || '')
            }))
            setAddressSelected(true)
          }
        })
      } catch (error) {
        console.error('Failed to initialize Places Autocomplete:', error)
        setPlacesBlocked(true)
      }
    }

    initAutocomplete()
  }, [isDeveloper, mapInstanceRef.current, addressInputRef.current, placesBlocked])

  // Reverse geocode function
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const google = await ensureGoogleMaps()
      const geocoder = new google.maps.Geocoder()
      
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const address = results[0].formatted_address
          setFormData(prev => ({
            ...prev,
            officeAddress: address
          }))
          setAddressSelected(true)
        }
      })
    } catch (error) {
      console.error('Error reverse geocoding:', error)
    }
  }

  // Forward geocode function for manual address input
  const forwardGeocode = async (address: string) => {
    try {
      const google = await ensureGoogleMaps()
      const geocoder = new google.maps.Geocoder()
      
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0] && mapInstanceRef.current && markerRef.current) {
          const location = results[0].geometry.location
          const newPosition = { lat: location.lat(), lng: location.lng() }
          
          // Update map and marker
          mapInstanceRef.current.setCenter(newPosition)
          mapInstanceRef.current.setZoom(16)
          markerRef.current.setPosition(newPosition)
          
          // Update form values
          setFormData(prev => ({
            ...prev,
            officeLatitude: newPosition.lat,
            officeLongitude: newPosition.lng
          }))
          setAddressSelected(true)
        }
      })
    } catch (error) {
      console.error('Error forward geocoding:', error)
    }
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
    
    // Validate form
    const validationErrors = validateForm(formData, dict)
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
        website: formData.website?.trim() || undefined,
        office_latitude: formData.officeLatitude,
        office_longitude: formData.officeLongitude
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



  // Developer-specific layout with informative left column
  if (isDeveloper) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 items-start">
          {/* Info column */}
          <Card className="bg-card border shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="secondary" className="w-max">{dict.register?.forDevelopers || "For Developers"}</Badge>
                <Badge className="w-max" variant="outline">{dict.register?.free || "100% Free"}</Badge>
              </div>
              <CardTitle className="text-2xl">{dict.register?.whyRegisterOnMrImot || "Why register on Mr imot?"}</CardTitle>
              <CardDescription>{dict.register?.publishProjectsReachBuyers || "Publish projects, reach verified buyers, and manage inbound leads in one place."}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">{dict.register?.verifiedPresence || "Verified presence"}</p>
                    <p className="text-sm text-muted-foreground">{dict.register?.showTrustedProfile || "Show a trusted, verified profile for your company and projects."}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">{dict.register?.highIntentLeads || "High‑intent leads"}</p>
                    <p className="text-sm text-muted-foreground">{dict.register?.buyersContactDirectly || "Buyers contact you directly — no brokers, no commission."}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <LayoutDashboard className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">{dict.register?.developerDashboard || "Developer dashboard"}</p>
                    <p className="text-sm text-muted-foreground">{dict.register?.manageListingsInquiries || "Manage listings, inquiries, and view stats in your private dashboard."}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BarChart3 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">{dict.register?.projectAnalytics || "Project analytics"}</p>
                    <p className="text-sm text-muted-foreground">{dict.register?.trackViewsAndLeads || "Track views and leads to understand interest over time."}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">{dict.register?.fasterLaunch || "Faster launch"}</p>
                    <p className="text-sm text-muted-foreground">{dict.register?.createProfileInMinutes || "Create a profile in minutes; publish when you are ready."}</p>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <p className="font-medium">{dict.register?.whatYoullNeed || "What you'll need"}</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5" />{dict.register?.companyNameAndContact || "Company name and contact person"}</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5" />{dict.register?.companyEmailAndPhone || "Company email and phone"}</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5" />{dict.register?.officeAddressAndWebsite || "Office address and optional website"}</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5" />{dict.register?.abilityToVerifyOwnership || "Ability to verify ownership when requested"}</li>
                </ul>
              </div>

              <Separator />
              <div className="space-y-3">
                <p className="font-medium">{dict.register?.verificationProcess || "Verification process"}</p>
                <ol className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-0.5">{dict.register?.step1 || "Step 1"}</Badge>
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-muted-foreground">{dict.register?.emailVerification || "Email verification to secure your login."}</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-0.5">{dict.register?.step2 || "Step 2"}</Badge>
                    <div className="flex items-start gap-2">
                      <PhoneCall className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-muted-foreground">{dict.register?.manualVerification || "Manual verification by phone or email for trust."}</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-0.5">{dict.register?.step3 || "Step 3"}</Badge>
                    <div className="flex items-start gap-2">
                      <UserCheck className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-muted-foreground">{dict.register?.inPersonVerification || "Optional in‑person verification for premium trust badge."}</span>
                    </div>
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Form column */}
          <Card className="bg-card border shadow-sm">
            <CardHeader>
              <CardTitle>{dict.register?.registerAsDeveloper || "Register as Developer"}</CardTitle>
              <CardDescription>{dict.register?.createAccountToListProjects || "Create your account to list projects and receive leads."}</CardDescription>
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
                    retryLabel={dict.register?.tryAgain || "Try Again"}
                  />
                </div>
              ) : null}

              {submitStatus.type !== "success" && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">{dict.register?.companyName || "Company Name"} <span className="text-destructive">*</span></Label>
                    <Input 
                      id="companyName" 
                      value={formData.companyName} 
                      onChange={(e) => handleInputChange("companyName", e.target.value)} 
                      onKeyDown={preventEnterSubmit}
                      autoComplete="organization" 
                      disabled={isLoading} 
                      required 
                    />
                    {getFieldError(errors, "companyName") && (<p className="text-sm text-destructive">{getFieldError(errors, "companyName")}</p>)}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">{dict.register?.contactPerson || "Contact Person"} <span className="text-destructive">*</span></Label>
                    <Input 
                      id="contactPerson" 
                      value={formData.contactPerson} 
                      onChange={(e) => handleInputChange("contactPerson", e.target.value)} 
                      onKeyDown={preventEnterSubmit}
                      autoComplete="name" 
                      disabled={isLoading} 
                      required 
                    />
                    {getFieldError(errors, "contactPerson") && (<p className="text-sm text-destructive">{getFieldError(errors, "contactPerson")}</p>)}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{dict.register?.emailAddress || "Email Address"} <span className="text-destructive">*</span></Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={formData.email} 
                      onChange={(e) => handleInputChange("email", e.target.value)} 
                      onKeyDown={preventEnterSubmit}
                      autoComplete="email" 
                      disabled={isLoading} 
                      required 
                    />
                    {getFieldError(errors, "email") && (<p className="text-sm text-destructive">{getFieldError(errors, "email")}</p>)}
                  </div>
                  <InternationalPhoneInput
                    label={dict.register?.phoneNumber || "Phone Number"}
                    value={formData.phone}
                    onChange={(phone) => handleInputChange("phone", phone)}
                    error={getFieldError(errors, "phone")}
                    disabled={isLoading}
                    required
                    defaultCountry="bg"
                    placeholder={dict.register?.enterPhoneNumber || "Enter your phone number"}
                  />
                </div>

                {/* Address with Google Maps */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="officeAddress">{dict.register?.officeAddress || "Office Address"} <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        id="officeAddress" 
                        ref={addressInputRef}
                        value={formData.officeAddress} 
                        onChange={(e) => {
                          handleInputChange("officeAddress", e.target.value)
                          setAddressSelected(false) // Reset when user types
                        }}
                        onKeyDown={preventEnterSubmit}
                        onBlur={(e) => {
                          if (e.target.value && !addressSelected) {
                            forwardGeocode(e.target.value)
                          }
                        }}
                        className="pl-10"
                        placeholder={dict.register?.searchForOfficeAddress || "Search for office address"} 
                        autoComplete="street-address" 
                        disabled={isLoading} 
                        required 
                      />
                    </div>
                    {getFieldError(errors, "officeAddress") && (<p className="text-sm text-destructive">{getFieldError(errors, "officeAddress")}</p>)}
                    {placesBlocked && (
                      <p className="text-sm text-amber-600">
                        {dict.register?.addressSearchNotAvailable || "Address search is not available. You can still enter the address manually."}
                      </p>
                    )}
                  </div>
                  
                  {/* Map Display */}
                  <div className="space-y-2">
                    <Label>{dict.register?.officeLocation || "Office Location"}</Label>
                    <div className="relative">
                      <div 
                        ref={mapRef}
                        className="w-full h-64 rounded-lg border border-gray-200"
                        style={{ minHeight: '256px' }}
                      />
                      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-md px-2 py-1 text-xs text-gray-600">
                        {addressSelected 
                          ? (dict.register?.dragMarkerOrSearch || "Drag the marker or search for a new address to update your office location.")
                          : (dict.register?.searchForOfficeAddressToSet || "Search for your office address to set the location on the map.")
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="website">{dict.register?.websiteUrlOptional || "Website URL (Optional)"}</Label>
                  <Input id="website" type="url" placeholder="https://" value={formData.website} onChange={(e) => handleInputChange("website", e.target.value)} autoComplete="url" disabled={isLoading} />
                  {getFieldError(errors, "website") && (<p className="text-sm text-destructive">{getFieldError(errors, "website")}</p>)}
                </div>

                {/* Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                  <Label htmlFor="password">{dict.register?.password || "Password"} <span className="text-destructive">*</span></Label>
                    <Input 
                      id="password" 
                      type="password" 
                      value={formData.password} 
                      onChange={(e) => handleInputChange("password", e.target.value)} 
                      onKeyDown={preventEnterSubmit}
                      autoComplete="new-password" 
                      disabled={isLoading} 
                      required 
                      maxLength={72}
                    />
                    <PasswordStrength password={formData.password} />
                    {getFieldError(errors, "password") && (<p className="text-sm text-destructive">{getFieldError(errors, "password")}</p>)}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{dict.register?.confirmPassword || "Confirm Password"} <span className="text-destructive">*</span></Label>
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      value={formData.confirmPassword} 
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)} 
                      onKeyDown={preventEnterSubmit}
                      autoComplete="new-password" 
                      disabled={isLoading} 
                      required 
                      maxLength={72}
                    />
                    {getFieldError(errors, "confirmPassword") && (<p className="text-sm text-destructive">{getFieldError(errors, "confirmPassword")}</p>)}
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="bg-muted rounded-lg p-4 border">
                  <div className="flex items-start gap-3">
                    <Checkbox id="acceptTerms" checked={formData.acceptTerms} onCheckedChange={(v) => handleInputChange("acceptTerms", v === true)} disabled={isLoading} />
                    <Label htmlFor="acceptTerms" className="text-sm text-foreground leading-relaxed cursor-pointer flex-1">
                      {dict.register?.iAgreeToThe || "I agree to the"}{' '}
                      <a href={href('terms-of-service.html', 'terms-of-service.html')} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">{dict.register?.termsOfService || "Terms of Service"}</a>{' '}
                      {dict.register?.and || "and"}{' '}
                      <a href={href('privacy-policy.html', 'privacy-policy.html')} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">{dict.register?.privacyPolicy || "Privacy Policy"}</a>
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
                  {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {dict.register?.creatingYourAccount || "Creating Your Account..."}</>) : (<>{dict.register?.createDeveloperAccount || "Create Developer Account"}</>)}
                </Button>

                <p className="text-xs text-muted-foreground text-center">{dict.register?.weNeverShareInformation || "We never share your information. Used only for account and verification."}</p>
              </form>
              )}

              {submitStatus.type !== "success" && (
              <div className="mt-8">
                <div className="relative flex justify-center">
                  <span className="px-4 text-sm text-muted-foreground">{dict.register?.alreadyHaveAccount || "Already have an account?"}</span>
                </div>
                <div className="mt-4">
                  <Link href={href('login', 'login')}>
                    <EnhancedButton
                      variant="outline"
                      size="lg"
                      fullWidth
                      className="group"
                    >
                      <span>{dict.register?.signIn || "Sign In"}</span>
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
                label={dict.register?.companyName || "Company Name"}
                type="text"
                value={formData.companyName}
                onChange={(e) => handleInputChange("companyName", e.target.value)}
                error={getFieldError(errors, "companyName")}
                disabled={isLoading}
                required
              />
              <FloatingInput
                label={dict.register?.contactPerson || "Contact Person"}
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
                label={dict.register?.emailAddress || "Email Address"}
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                error={getFieldError(errors, "email")}
                disabled={isLoading}
                required
              />
              <InternationalPhoneInput
                label={dict.register?.phoneNumber || "Phone Number"}
                value={formData.phone}
                onChange={(phone) => handleInputChange("phone", phone)}
                error={getFieldError(errors, "phone")}
                disabled={isLoading}
                required
                defaultCountry="bg"
                placeholder={dict.register?.enterPhoneNumber || "Enter your phone number"}
              />
            </div>

            {/* Address */}
            <FloatingInput
              label={dict.register?.officeAddress || "Office Address"}
              type="text"
              value={formData.officeAddress}
              onChange={(e) => handleInputChange("officeAddress", e.target.value)}
              error={getFieldError(errors, "officeAddress")}
              disabled={isLoading}
              required
            />

            {/* Website */}
            <FloatingInput
              label={dict.register?.websiteUrlOptional || "Website URL (Optional)"}
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange("website", e.target.value)}
              error={getFieldError(errors, "website")}
              disabled={isLoading}
            />

            {/* Password */}
            <div className="space-y-4">
            <FloatingInput
              label={dict.register?.password || "Password"}
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              showPasswordToggle={true}
              error={getFieldError(errors, "password")}
              disabled={isLoading}
              required
              maxLength={72}
            />
              <PasswordStrength password={formData.password} />
            </div>

            {/* Confirm Password */}
            <FloatingInput
              label={dict.register?.confirmPassword || "Confirm Password"}
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              showPasswordToggle={true}
              error={getFieldError(errors, "confirmPassword")}
              disabled={isLoading}
              required
              maxLength={72}
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
                  {dict.register?.iAgreeToThe || "I agree to the"}{' '}
                  <a 
                    href={href('terms-of-service.html', 'terms-of-service.html')} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-medium underline decoration-2 underline-offset-2 transition-colors"
                  >
                    {dict.register?.termsOfService || "Terms of Service"}
                  </a>{' '}
                  {dict.register?.and || "and"}{' '}
                  <a 
                    href={href('privacy-policy.html', 'privacy-policy.html')} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-medium underline decoration-2 underline-offset-2 transition-colors"
                  >
                    {dict.register?.privacyPolicy || "Privacy Policy"}
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
              loadingText={dict.register?.creatingYourAccount || "Creating Your Account..."}
              disabled={isLoading}
              icon={!isLoading ? <Sparkles size={20} /> : undefined}
            >
              {dict.register?.createDeveloperAccount || "Create Developer Account"}
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
                  {dict.register?.alreadyHaveAccount || "Already have an account?"}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link href={href('login', 'login')}>
                <EnhancedButton
                  variant="outline"
                  size="lg"
                  fullWidth
                  className="group"
                >
                  <span>{dict.register?.signIn || "Sign In"}</span>
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
          {dict.register?.byCreatingAccount || "By creating an account, you agree to our"}{' '}
          <Link href={href('terms-of-service.html', 'terms-of-service.html')} className="text-blue-600 hover:text-blue-700 font-medium">
            {dict.register?.termsOfService || "Terms of Service"}
          </Link>{' '}
          {dict.register?.and || "and"}{' '}
          <Link href={href('privacy-policy.html', 'privacy-policy.html')} className="text-blue-600 hover:text-blue-700 font-medium">
            {dict.register?.privacyPolicy || "Privacy Policy"}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterClient({ dict, lang }: RegisterClientProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative z-10 flex items-start justify-center py-12 px-4 sm:px-6 lg:px-8">
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

