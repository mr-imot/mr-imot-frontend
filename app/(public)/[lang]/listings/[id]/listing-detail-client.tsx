"use client"

import { useEffect, useState, useRef } from "react"
import { getProject } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  MapPin,
  Building,
  Calendar,
  Phone,
  Share2,
  CheckCircle,
  Globe,
  Euro,
  Navigation,
} from "lucide-react"
import { Project } from "@/lib/api"
import { trackDetailView, trackClickPhone, trackClickWebsite } from "@/lib/analytics"
import { PropertyGallery } from "@/components/PropertyGallery"
import { FeaturesDisplay } from "@/components/FeaturesDisplay"
import dynamic from "next/dynamic"
import { translatePrice, PriceTranslations } from "@/lib/price-translator"

// Dynamically import map component with no SSR to reduce initial bundle size
const OptimizedPropertyMap = dynamic(
  () => import("@/components/OptimizedPropertyMap").then(mod => ({ 
    default: mod.OptimizedPropertyMap 
  })),
  { 
    ssr: false,
    loading: () => (
      <div className="mt-4 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading map...</div>
      </div>
    )
  }
)

interface ListingDetailClientProps {
  projectId: string
  initialProject?: Project
  isModal?: boolean // Indicates if rendered in modal context
  translations?: {
    listingDetail?: any
    price?: PriceTranslations
    features?: {
      buildingInfrastructure?: string
      securityAccess?: string
      amenities?: string
      modernFeatures?: string
      features?: Record<string, string>
    }
  }
}

const LoadingSkeletonPropertyDetail = () => (
  <div className="max-w-7xl mx-auto px-4 py-6">
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="h-96 bg-gray-200 rounded-lg mb-6"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="h-48 bg-gray-200 rounded-lg"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  </div>
)

// Default translations for fallback
const defaultTranslations = {
  listingDetail: {
    loading: 'Loading...',
    error: 'Error loading property',
    notFound: 'Property not found',
    viewDeveloper: 'View Developer',
    share: 'Share',
    save: 'Save',
    saved: 'Saved',
    contactDeveloper: 'Contact Developer',
    website: 'Website',
    phone: 'Phone',
    price: 'Price',
    priceFrom: 'From',
    priceTo: 'To',
    sqm: 'sq.m.',
    features: 'Features',
    description: 'Description',
    location: 'Location',
    gallery: 'Gallery',
    map: 'Map',
    similarProperties: 'Similar Properties',
  }
}

export default function ListingDetailClient({ projectId, initialProject, isModal = false, translations }: ListingDetailClientProps) {
  const [property, setProperty] = useState<any>(initialProject || null)
  const [loading, setLoading] = useState(!initialProject) // Don't show loading if we have data
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const t = translations?.listingDetail || defaultTranslations.listingDetail
  
  // Provide fallback translations for price to prevent runtime errors
  const tPrice: PriceTranslations = translations?.price || {
    requestPrice: 'Request price',
    fromPrice: 'From {{amount}}',
    contactForPrice: 'Contact for price',
    priceOnRequest: 'Price on request',
    na: 'N/A'
  }
  
  // Use refs to track initialization and prevent infinite loops
  // This prevents the effect from re-running when initialProject object reference changes
  const hasInitializedRef = useRef(false)
  const initialProjectIdRef = useRef<string | null>(null)
  const lastProjectIdRef = useRef<string | null>(null)
  
  // Analytics v2: Track detail_view once per page load (guarded against StrictMode)
  const hasTrackedDetailView = useRef(false)
  
  // Extract stable ID from initialProject for comparison
  // This allows us to detect when initialProject actually changes (different project)
  // vs when it's just a new object reference with the same data
  const initialProjectId = initialProject && 'id' in initialProject 
    ? String(initialProject.id) 
    : null

  useEffect(() => {
    // Reset initialization state if projectId changed (different project)
    if (lastProjectIdRef.current !== projectId) {
      hasInitializedRef.current = false
      initialProjectIdRef.current = null
      lastProjectIdRef.current = projectId
    }

    // If we have initialProject and haven't initialized yet, set it once
    if (initialProject && !hasInitializedRef.current) {
      const currentId = initialProjectId
      
      // Only initialize if this is a new initialProject (different ID) or first time
      if (initialProjectIdRef.current !== currentId) {
        setProperty(initialProject)
        setLoading(false)
        hasInitializedRef.current = true
        initialProjectIdRef.current = currentId
      }
      return
    }

    // Only fetch if we don't have initial data (direct URL access) and haven't fetched yet
    if (!initialProject && !hasInitializedRef.current && projectId) {
      const loadProperty = async () => {
        try {
          const data = await getProject(projectId)
          if (!data) {
            throw new Error("Project not found")
          }
          
          setProperty(data)
          hasInitializedRef.current = true
          
        } catch (err) {
          console.error("Error loading property:", err)
          setError(err instanceof Error ? err.message : "Failed to load property")
        } finally {
          setLoading(false)
        }
      }

      loadProperty()
    }
  }, [projectId, initialProjectId]) // Only depend on stable IDs, not object references

  // Track detail_view once when property is loaded (guarded against StrictMode double-mount)
  useEffect(() => {
    if (property && projectId && !hasTrackedDetailView.current) {
      trackDetailView(projectId)
      hasTrackedDetailView.current = true
    }
  }, [property, projectId])

  if (loading) {
    return <LoadingSkeletonPropertyDetail />
  }

  if (error || !property) {
    // Return error UI instead of notFound() - notFound() in client components
    // causes 500 errors during RSC prefetch which breaks intercepting routes/modals
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Building className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Property Not Found</h2>
        <p className="text-gray-600 mb-6">The property you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    )
  }

  const handleSave = () => {
    setIsSaved(!isSaved)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: property.description?.substring(0, 100) + "...",
          url: window.location.href,
        })
      } catch (err) {
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href)
      } catch (err) {
        console.error("Failed to copy to clipboard:", err)
      }
    }
  }

  const handlePhoneClick = async (phone: string) => {
    try {
      trackClickPhone(projectId)
      
      if (phone && phone.trim()) {
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
        window.location.href = `tel:${cleanPhone}`
      }
    } catch (err) {
      console.warn("Failed to record phone click:", err)
    }
  }

  const handlePhoneNumberClick = async (phone: string) => {
    try {
      trackClickPhone(projectId)
      
      if (phone && phone.trim()) {
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
        
        try {
          await navigator.clipboard.writeText(cleanPhone)
        } catch (clipboardErr) {
          console.warn("Failed to copy to clipboard:", clipboardErr)
        }
      }
    } catch (err) {
      console.warn("Failed to record phone click:", err)
    }
  }

  const handleWebsiteClick = (website: any) => {
    trackClickWebsite(projectId)
    
    if (website && website.trim()) {
      let url = website.trim()
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`
      }
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleOfficeAddressClick = () => {
    const officeSection = document.getElementById('office-location-section')
    if (officeSection) {
      officeSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  const handleGetDirections = (latitude: number, longitude: number, title: string) => {
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    window.open(directionsUrl, '_blank', 'noopener,noreferrer')
  }

  const parseCompletionNote = (completionNote: any) => {
    if (!completionNote) return { month: "TBD", year: "TBD" }
    
    const parts = completionNote.split(' ')
    const englishMonth = parts[0] || "TBD"
    const year = parts[1] || "TBD"
    
    // Translate month name using translation files
    const translatedMonth = t.months?.[englishMonth as keyof typeof t.months] || englishMonth
    
    return {
      month: translatedMonth,
      year: year
    }
  }

  const completionData = parseCompletionNote(property.completion_note)
  const developerProfilePath = property.developer?.slug || property.developer?.id
  const developerProfileUrl = developerProfilePath ? `/developers/${developerProfilePath}` : null

  return (
    <main role="main" className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex justify-end mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleShare}
          className="hidden md:flex"
        >
          <Share2 className="h-4 w-4" />
          {t.share || "Share"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        <div className="lg:col-span-3 order-1 lg:order-1">
          {(() => {
            const allImages = [];
            
            if (property.images && property.images.length > 0) {
              allImages.push(...property.images.map((img: any) => img.image_url));
            }
            
            return allImages.length > 0 ? (
              <PropertyGallery 
                images={allImages} 
                title={property.title}
                isModal={isModal}
              />
            ) : (
              <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">

                <p className="text-gray-500">{t.noImagesAvailable || "No images available for this property"}</p>
              </div>
            );
          })()}
        </div>

        <div className="space-y-4 lg:space-y-6 order-2 lg:order-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5" />
                {t.priceInformation || "Price Information"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t.priceRange || "Price Range"}</span>
                  <span className="font-semibold text-lg">
                    {translatePrice(property.price_label || property.price_per_m2, tPrice)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {t.priceDisclaimer || "Prices may vary based on unit size, floor, and view. Contact for detailed pricing and available units."}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t.projectTimeline || "Project Timeline"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t.expectedCompletion || "Expected Completion"}</span>
                  <span className="font-medium">
                    {completionData.month} {completionData.year}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t.buildingType || "Building Type"}</span>
                  <span className="font-medium">
                  {property.project_type === 'apartment_building' 
                    ? (t.apartmentComplex || 'Apartment complex') 
                    : (t.houseComplex || 'Housing complex')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">{t.contactDeveloper || "Contact Developer"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{t.company || "Company"}</p>
                <div className="flex items-center gap-3">
                  {developerProfileUrl ? (
                    <Link 
                      href={developerProfileUrl}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={property.developer?.profile_image_url} 
                          alt={`${property.developer?.company_name} profile`}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-sm font-semibold bg-primary text-primary-foreground">
                          {property.developer?.company_name?.charAt(0) || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <h4 className="font-semibold text-base text-gray-900 hover:text-primary transition-colors">
                        {property.developer?.company_name || 'Unknown Developer'}
                      </h4>
                    </Link>
                  ) : (
                    <>
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={property.developer?.profile_image_url} 
                          alt={`${property.developer?.company_name} profile`}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-sm font-semibold bg-primary text-primary-foreground">
                          {property.developer?.company_name?.charAt(0) || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <h4 className="font-semibold text-base text-gray-900">
                        {property.developer?.company_name || 'Unknown Developer'}
                      </h4>
                    </>
                  )}
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{t.contactPerson || "Contact Person"}</p>
                <p className="text-sm text-gray-700">{property.developer?.contact_person || 'Contact Person'}</p>
              </div>
              
              {/* Desktop phone display */}
              <div className="space-y-1 hidden md:block">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{t.phone || "Phone"}</p>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span
                    onClick={() => handlePhoneNumberClick(property.developer?.phone)}
                    className="text-sm text-gray-700 font-mono cursor-pointer hover:text-gray-900 transition-colors"
                  >
                    {property.developer?.phone || t.contactForDetails || 'Contact for details'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 pt-2">
                {/* Mobile call button */}
                <div className="md:hidden">
                  <Button 
                    size="sm"
                    className="w-full text-xs cursor-pointer"
                    onClick={() => handlePhoneClick(property.developer?.phone)}
                    disabled={!property.developer?.phone}
                  >
                    <Phone className="h-3 w-3 mr-1 cursor-pointer" />
                    {t.callNow || "Call Now"}
                  </Button>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full text-xs cursor-pointer"
                  onClick={handleOfficeAddressClick}
                >
                  <MapPin className="h-3 w-3 mr-1 cursor-pointer" />
                  {t.officeAddress || "Office Address"}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full text-xs cursor-pointer"
                  onClick={() => handleWebsiteClick(property.developer?.website || property.website)}
                  disabled={!property.developer?.website && !property.website}
                >
                  <Globe className="h-3 w-3 mr-1 cursor-pointer" />
                  {t.visitWebsite || "Visit Website"}
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6 lg:mt-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 lg:mb-4">
          {property.title || property.name || t.untitledProject || 'Untitled Project'}
        </h1>
        
        {/* Verified Developer Badge */}
        {property.developer?.verification_status === 'verified' && (
          <div className="mb-4">
            <Badge className="bg-green-600 text-white hover:bg-green-700 border-green-700">
              <CheckCircle className="w-3 h-3 mr-1" />
              {t.publishedByVerifiedDeveloper || 'Published directly by a verified developer'}
            </Badge>
            
            {/* Micro Trust Signals */}
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700">
              <p className="mb-1">
                <span className="font-medium">{t.source || 'Source'}: </span>
                {developerProfileUrl ? (
                  <Link 
                    href={developerProfileUrl}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {property.developer?.company_name || 'Unknown Developer'}
                  </Link>
                ) : (
                  <span>{property.developer?.company_name || 'Unknown Developer'}</span>
                )}
              </p>
              <p className="mt-1 text-gray-600">
                {t.noBrokersNoIntermediaries || 'No brokers · No intermediaries · No fake listings'}
              </p>
              <p className="mt-1 text-gray-600">
                {t.accountVerifiedByMrImot || 'The developer account is verified by Mister Imot'}
              </p>
            </div>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-4 text-gray-600 mb-6 lg:mb-8">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span className="text-sm sm:text-base">{property.location || property.city}</span>
          </div>
          <div className="flex items-center gap-1">
            <Building className="h-4 w-4" />
            <span className="text-sm sm:text-base">
              {property.project_type === 'apartment_building' 
                ? (t.projectTypes?.apartmentBuilding || 'Apartment complex') 
                : (t.projectTypes?.houseComplex || 'Housing complex')}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6 lg:space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              {t.aboutThisProperty || "About This Property"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {property.description}
            </p>
          </CardContent>
        </Card>

        {property.features && property.features.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                {t.propertyFeatures || "Property Features & Amenities"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FeaturesDisplay
                features={property.features}
                title=""
                compact={false}
                showCategories={true}
                translations={translations?.features}
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                {t.propertyFeatures || "Property Features & Amenities"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-8">{t.noFeaturesAvailable || "No features available for this property"}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t.propertyLocation || "Property Location"}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {t.locationDescription || "Explore the neighborhood and visit the property location without a broker - take your time, no obligations!"}
            </p>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h4 className="font-medium mb-2">{t.address || "Address"}</h4>
              <p className="text-gray-600">{property.formatted_address || property.location || property.city}</p>
            </div>
            
            {property.latitude && property.longitude ? (
              <>
                <OptimizedPropertyMap 
                  latitude={property.latitude} 
                  longitude={property.longitude} 
                  title={property.title}
                />
                <div className="mt-4">
                  <Button 
                    size="sm"
                    className="w-full text-xs cursor-pointer"
                    onClick={() => handleGetDirections(property.latitude, property.longitude, property.title)}
                  >
                    <Navigation className="h-3 w-3 mr-1 cursor-pointer" />
                    {t.getDirections || "Get Directions"}
                  </Button>
                </div>
              </>
            ) : (
              <div className="mt-4 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">{t.locationNotAvailable || "Location coordinates not available"}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {property.developer && (
          <Card id="office-location-section">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                {t.officeLocation || "Office Location"}
              </CardTitle>
              <p className="text-gray-600 mt-2">
                {t.officeDescription || "Visit our office to discuss your investment and get personalized assistance."}
              </p>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h4 className="font-medium mb-2">{t.officeAddressLabel || "Office Address"}</h4>
                <p className="text-gray-600">{property.developer.office_address || t.developersDetail?.addressNotAvailable || 'Address not available'}</p>
              </div>
              
              {property.developer.office_latitude && property.developer.office_longitude ? (
                <>
                  <OptimizedPropertyMap 
                    latitude={property.developer.office_latitude} 
                    longitude={property.developer.office_longitude} 
                    title={property.developer.company_name}
                  />
                  <div className="mt-4">
                    <Button 
                      size="sm"
                      className="w-full text-xs cursor-pointer"
                      onClick={() => handleGetDirections(property.developer.office_latitude, property.developer.office_longitude, property.developer.company_name)}
                    >
                      <Navigation className="h-3 w-3 mr-1 cursor-pointer" />
                      {t.getDirectionsToOffice || "Get Directions to Office"}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="mt-4 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">{t.officeLocationNotAvailable || "Office location not available"}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

    </main>
  )
}
