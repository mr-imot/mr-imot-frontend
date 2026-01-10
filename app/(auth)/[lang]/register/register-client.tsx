"use client"

import React, { useState, useRef, useMemo, useEffect as useEffectHook, useEffect } from "react"
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
import { ensureGoogleMapsBasic } from "@/lib/google-maps"
import { AddressSearchField } from "@/components/address-search-field"
import { preventEnterSubmit } from "@/lib/form-utils"
import Link from "next/link"
import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Eye, EyeOff, CheckCircle, AlertCircle, Shield, Sparkles, UserPlus, ArrowLeft, Building2, Check, Clock, BarChart3, LayoutDashboard, Mail, PhoneCall, UserCheck, Loader2, Headphones, Maximize2, X } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { HybridTooltip } from "@/components/ui/hybrid-tooltip"
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

  // Google Maps refs and state
  const mapRef = useRef<HTMLDivElement | null>(null)
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const addressInputRef = useRef<HTMLInputElement | null>(null)
  
  const [addressSelected, setAddressSelected] = useState(false)
  const [geocodingBlocked, setGeocodingBlocked] = useState(false)
  const [isMapExpanded, setIsMapExpanded] = useState(false)
  
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

  // Only developer registration is allowed
  const isDeveloper = userType === "developer"
  const title = dict.register?.registerAsDeveloper || "Register as Developer"
  const description = dict.register?.createDeveloperAccount || "Create your developer account to list projects."

  // Google Maps initialization
  useEffectHook(() => {
    if (!isDeveloper || !mapRef.current) return

    const initMap = async () => {
      try {
        await ensureGoogleMapsBasic()
        const map = new google.maps.Map(mapRef.current!, {
          center: defaultCenter,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          scrollwheel: true,
          draggableCursor: "grab",
          draggingCursor: "grabbing",
          mapId: 'e1ea25ce333a0b0deb34ff54', // Required for AdvancedMarkerElement
        })

        // Create marker pin element
        const pinElement = document.createElement('div')
        pinElement.innerHTML = '📍'
        pinElement.style.cursor = 'grab'
        pinElement.style.fontSize = '24px'
        pinElement.style.textAlign = 'center'

        const marker = new google.maps.marker.AdvancedMarkerElement({
          position: defaultCenter,
          map,
          content: pinElement,
          title: "Office Location",
          gmpDraggable: true,
        })

        mapInstanceRef.current = map
        markerRef.current = marker

        // Handle marker drag
        marker.addEventListener('dragend', (event: any) => {
          const markerElement = event.target as google.maps.marker.AdvancedMarkerElement
          if (!markerElement) return
          
          const position = markerElement.position
          if (position) {
            const lat = typeof position.lat === 'function' ? position.lat() : position.lat
            const lng = typeof position.lng === 'function' ? position.lng() : position.lng
            
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
          const newPosition = { lat: e.latLng.lat(), lng: e.latLng.lng() }
          markerRef.current.position = newPosition
          setFormData(prev => ({
            ...prev,
            officeLatitude: newPosition.lat,
            officeLongitude: newPosition.lng
          }))
          reverseGeocode(newPosition.lat, newPosition.lng)
        })

      } catch (error) {
        console.error('Failed to initialize Google Maps:', error)
        setGeocodingBlocked(true)
      }
    }

    initMap()
  }, [isDeveloper, defaultCenter])


  // Handle Escape key to close fullscreen map
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMapExpanded) {
        setIsMapExpanded(false)
      }
    }

    if (isMapExpanded) {
      document.addEventListener('keydown', handleKeyDown)
    } else {
      document.removeEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMapExpanded])

  // Trigger map resize when fullscreen mode changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      // Small delay to ensure DOM has updated
      setTimeout(() => {
        google.maps.event.trigger(mapInstanceRef.current as unknown as object, 'resize')
      }, 100)
    }
  }, [isMapExpanded])

  // Reverse geocode function
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const google = await ensureGoogleMapsBasic()
      const geocoder = new google.maps.Geocoder()
      
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const address = results[0].formatted_address
          // Update form data
          setFormData(prev => ({
            ...prev,
            officeAddress: address
          }))
          // Also update the input field directly to ensure UI sync
          if (addressInputRef.current) {
            addressInputRef.current.value = address
          }
          setAddressSelected(true)
        } else if (status === 'REQUEST_DENIED' || status === 'OVER_QUERY_LIMIT') {
          console.warn('Geocoding request denied or quota exceeded. Enable "Geocoding API" for this key in Google Cloud Console.')
        } else if (status !== 'ZERO_RESULTS') {
          console.warn('Geocoding failed with status:', status)
        }
      })
    } catch (error) {
      console.error('Error reverse geocoding:', error)
    }
  }

  // Forward geocode function for manual address input
  const forwardGeocode = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    if (!address || !address.trim()) return null
    
    try {
      const google = await ensureGoogleMapsBasic()
      const geocoder = new google.maps.Geocoder()
      
      return new Promise((resolve) => {
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results && results[0] && mapInstanceRef.current && markerRef.current) {
            const location = results[0].geometry.location
            const newPosition = { lat: location.lat(), lng: location.lng() }
            const formattedAddress = results[0].formatted_address || address
            
            // Update map and marker
            mapInstanceRef.current.setCenter(newPosition)
            mapInstanceRef.current.setZoom(16)
            markerRef.current.position = newPosition
            
            // Update form data
            setFormData(prev => ({
              ...prev,
              officeLatitude: newPosition.lat,
              officeLongitude: newPosition.lng,
              officeAddress: formattedAddress,
            }))
            
            setAddressSelected(true)
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
    if (!mapInstanceRef.current || !markerRef.current) return
    const newCenter = { lat, lng }
    mapInstanceRef.current.setCenter(newCenter)
    mapInstanceRef.current.setZoom(16)
    markerRef.current.position = newCenter

    setFormData((prev) => ({
      ...prev,
      officeLatitude: lat,
      officeLongitude: lng,
      officeAddress: address,
    }))

    if (addressInputRef.current) {
      addressInputRef.current.value = address
    }
    setAddressSelected(true)
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

  // Developer-specific layout with informative left column
  return (
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6 lg:gap-8 items-start">
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
                <div className="flex items-start gap-3">
                  <Headphones className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">{dict.register?.dedicatedSupport || "100% Support"}</p>
                    <p className="text-sm text-muted-foreground">{dict.register?.alwaysAvailableSupport || "We're always here for you. Contact us anytime."}</p>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <p className="font-medium">{dict.register?.whatYoullNeed || "What you'll need"}</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5" />{dict.register?.companyNameAndContact || "Company name and contact person"}</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5" />{dict.register?.companyEmailAndPhone || "Company email and phone"}</li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5" />
                    <div className="flex items-center gap-1 flex-wrap">
                      <span>{dict.register?.officeAddress || "Office address"} {lang === 'bg' ? 'и' : 'and'}</span>
                      <WebsiteTooltip 
                        triggerText={dict.register?.optionalWebsite || "незадължително уебсайт"}
                        content={
                          <>
                            {dict.register?.websiteOffer || "As our client, take advantage of the most competitive prices for website development from"}{" "}
                            <a 
                              href="https://www.prodigycorp.io/bg" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline font-medium"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Prodigy Corp
                            </a>
                          </>
                        }
                      />
                    </div>
                  </li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5" />{dict.register?.abilityToVerifyOwnership || "Ability to verify ownership when requested"}</li>
                </ul>
              </div>

              <Separator />
              <div className="space-y-3">
                <p className="font-medium">{dict.register?.verificationProcess || "Verification process"}</p>
                <ol className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-0.5 w-16 flex-shrink-0">{dict.register?.step1 || "Step 1"}</Badge>
                    <div className="flex items-start gap-2 flex-1">
                      <Mail className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{dict.register?.emailVerification || "Email verification to secure your login."}</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-0.5 w-16 flex-shrink-0">{dict.register?.step2 || "Step 2"}</Badge>
                    <div className="flex items-start gap-2 flex-1">
                      <PhoneCall className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{dict.register?.manualVerification || "Manual verification by phone or email for trust."}</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-0.5 w-16 flex-shrink-0">{dict.register?.step3 || "Step 3"}</Badge>
                    <div className="flex items-start gap-2 flex-1">
                      <UserCheck className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
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
            <CardContent className="p-6 sm:p-8">
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
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Company Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 min-h-[44px]">
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
                  <div className="space-y-2 min-h-[44px]">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 min-h-[44px]">
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
                  <div className="space-y-2 min-h-[44px]">
                    <Label htmlFor="officeAddress">{dict.register?.officeAddress || "Office Address"} <span className="text-destructive">*</span></Label>
                    <AddressSearchField
                      value={formData.officeAddress}
                      onChange={(v) => {
                        handleInputChange("officeAddress", v)
                        setAddressSelected(false)
                      }}
                      onSelect={({ lat, lng, address }) => handleAddressSelect({ lat, lng, address })}
                      onBlur={(address) => {
                        // If coordinates are not set, try to geocode the address
                        if (address && (!formData.officeLatitude || !formData.officeLongitude)) {
                          forwardGeocode(address)
                        }
                      }}
                      placeholder={dict.register?.searchForOfficeAddress || "Search for office address"}
                      className="w-full"
                    />
                    {getFieldError(errors, "officeAddress") && (<p className="text-sm text-destructive">{getFieldError(errors, "officeAddress")}</p>)}
                  </div>
                  
                  {/* Map Display */}
                  <div className="space-y-2 min-h-[44px]">
                    <Label>{dict.register?.officeLocation || "Office Location"}</Label>
                    <div 
                      className={`relative overflow-hidden transition-all duration-200 ${
                        isMapExpanded 
                          ? 'fixed rounded-2xl border-2 border-gray-300 shadow-2xl' 
                          : ''
                      }`}
                      style={isMapExpanded ? {
                        position: 'fixed',
                        top: '80px',
                        left: '2.5%',
                        right: '2.5%',
                        bottom: '2.5%',
                        width: '95%',
                        height: 'calc(100vh - 80px - 2.5%)',
                        zIndex: 10000,
                        backgroundColor: 'white',
                        isolation: 'isolate',
                      } : {}}
                    >
                      <div 
                        ref={mapRef}
                        className={`w-full ${isMapExpanded ? 'h-full' : 'h-64 rounded-lg border border-gray-200'}`}
                        style={isMapExpanded ? {} : { minHeight: '256px' }}
                      />
                      {!isMapExpanded && (
                        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-md px-2 py-1 text-xs text-gray-600">
                          {addressSelected 
                            ? (dict.register?.dragMarkerOrSearch || "Drag the marker or search for a new address to update your office location.")
                            : (dict.register?.searchForOfficeAddressToSet || "Search for your office address to set the location on the map.")
                          }
                        </div>
                      )}
                      
                      {/* Expand/Collapse control */}
                      <button
                        type="button"
                        className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-white/95 border border-gray-200 shadow-lg flex items-center justify-center hover:bg-white hover:shadow-xl transition-all duration-200 cursor-pointer"
                        onClick={() => setIsMapExpanded(!isMapExpanded)}
                        aria-label={isMapExpanded ? (dict.listings?.collapseMap || "Collapse map") : (dict.listings?.expandMap || "Expand map")}
                      >
                        {isMapExpanded ? <X className="h-5 w-5 text-gray-700 cursor-pointer" /> : <Maximize2 className="h-5 w-5 text-gray-700 cursor-pointer" />}
                      </button>
                    </div>
                    
                    {/* Backdrop overlay when expanded */}
                    {isMapExpanded && (
                      <div 
                        className="fixed inset-0 bg-black/50"
                        onClick={() => setIsMapExpanded(false)}
                        style={{
                          position: 'fixed',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          zIndex: 9999,
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="website">
                    <WebsiteTooltip 
                      triggerText={dict.register?.websiteUrlOptional || "Website URL (Optional)"}
                      content={
                        <>
                          {dict.register?.websiteOffer || "As our client, take advantage of the most competitive prices for website development from"}{" "}
                          <a 
                            href="https://www.prodigycorp.io/bg" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Prodigy Corp
                          </a>
                        </>
                      }
                    />
                  </Label>
                  <Input id="website" type="url" placeholder="https://" value={formData.website} onChange={(e) => handleInputChange("website", e.target.value)} autoComplete="url" disabled={isLoading} />
                  {getFieldError(errors, "website") && (<p className="text-sm text-destructive">{getFieldError(errors, "website")}</p>)}
                </div>

                {/* Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 min-h-[44px]">
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
                  <div className="space-y-2 min-h-[44px]">
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
                      <Link href={href('terms-of-service', 'terms-of-service')} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">{dict.register?.termsOfService || "Terms of Service"}</Link>{' '}
                      {dict.register?.and || "and"}{' '}
                      <Link href={href('privacy-policy', 'privacy-policy')} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">{dict.register?.privacyPolicy || "Privacy Policy"}</Link>
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
                <Button type="submit" className="w-full h-12 sm:h-10" disabled={isLoading}>
                  {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {dict.register?.creatingAccount || "Creating Account..."}</>) : (<>{dict.register?.createAccount || "Create Account"}</>)}
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
