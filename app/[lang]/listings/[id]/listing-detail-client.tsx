"use client"

import { notFound } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { getProject } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { recordProjectView, recordProjectPhoneClick, recordProjectWebsiteClick } from "@/lib/api"
import { PropertyGallery } from "@/components/PropertyGallery"
import { FeaturesDisplay } from "@/components/FeaturesDisplay"
import { ensureGoogleMaps } from "@/lib/google-maps"
import { useIsMobile } from "@/hooks/use-mobile"
import { useTranslations } from "@/lib/locale-context"
import { translatePrice, PriceTranslations } from "@/lib/price-translator"

interface ListingDetailClientProps {
  projectId: string
}

// Enhanced ImageKit transformation function - PROPER FULLSCREEN HANDLING
const getImageKitUrl = (originalUrl: string, width: number, height: number, quality: number = 90, imageType: 'main' | 'thumbnail' | 'fullscreen' = 'main') => {
  if (!originalUrl || !originalUrl.includes('imagekit.io')) {
    return originalUrl
  }

  const baseUrl = originalUrl.split('?')[0]
  
  let transformations = []
  
  if (imageType === 'fullscreen') {
    transformations = [
      'q-95',
      'f-auto',
      'c-maintain_ar',
      `w-${Math.min(width, 1920)}`,
      `h-${Math.min(height, 1080)}`
    ]
  } else if (imageType === 'thumbnail') {
    transformations = [
      `q-${quality}`,
      'f-auto',
      'c-maintain_ar',
      `w-${width}`,
      `h-${height}`
    ]
  } else {
    transformations = [
      `q-${quality}`,
      'f-auto',
      'c-maintain_ar',
      `w-${width}`,
      `h-${height}`
    ]
  }
  
  return `${baseUrl}?tr=${transformations.join(',')}`
}

// Property Map Component
const PropertyMap = ({ latitude, longitude, title }: { latitude: number, longitude: number, title: string }) => {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initMap = async () => {
      try {
        await ensureGoogleMaps()
        if (mapRef.current && window.google) {
          const map = new window.google.maps.Map(mapRef.current, {
            center: { lat: latitude, lng: longitude },
            zoom: 15,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            draggableCursor: "grab",
            draggingCursor: "grabbing",
            scrollwheel: true,
            gestureHandling: "greedy",
            mapId: 'e1ea25ce333a0b0deb34ff54',
          })

          const pinElement = document.createElement('div')
          pinElement.innerHTML = '📍'
          pinElement.style.cursor = 'pointer'
          pinElement.style.fontSize = '24px'
          pinElement.style.textAlign = 'center'

          new window.google.maps.marker.AdvancedMarkerElement({
            position: { lat: latitude, lng: longitude },
            map,
            content: pinElement,
            title: title,
          })
        }
      } catch (error) {
        console.error('Failed to load Google Maps:', error)
      }
    }

    initMap()
  }, [latitude, longitude, title])

  return (
    <div className="mt-4 h-64 bg-gray-100 rounded-lg overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  )
}

// Office Map Component
const OfficeMap = ({ latitude, longitude, title }: { latitude: number, longitude: number, title: string }) => {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initMap = async () => {
      try {
        await ensureGoogleMaps()
        if (mapRef.current && window.google) {
          const map = new window.google.maps.Map(mapRef.current, {
            center: { lat: latitude, lng: longitude },
            zoom: 15,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            draggableCursor: "grab",
            draggingCursor: "grabbing",
            scrollwheel: true,
            gestureHandling: "greedy",
            mapId: 'e1ea25ce333a0b0deb34ff54',
          })

          const pinElement = document.createElement('div')
          pinElement.innerHTML = '📍'
          pinElement.style.cursor = 'pointer'
          pinElement.style.fontSize = '24px'
          pinElement.style.textAlign = 'center'

          new window.google.maps.marker.AdvancedMarkerElement({
            position: { lat: latitude, lng: longitude },
            map,
            content: pinElement,
            title: title,
          })
        }
      } catch (error) {
        console.error('Failed to load Google Maps:', error)
      }
    }

    initMap()
  }, [latitude, longitude, title])

  return (
    <div className="mt-4 h-64 bg-gray-100 rounded-lg overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  )
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

export default function ListingDetailClient({ projectId }: ListingDetailClientProps) {
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const isMobile = useIsMobile()
  const t = useTranslations()
  const tPrice = useTranslations('price')

  useEffect(() => {
    const loadProperty = async () => {
      try {
        if (!projectId) {
          setError("Invalid project ID")
          setLoading(false)
          return
        }

        const data = await getProject(projectId)
        if (!data) {
          throw new Error("Project not found")
        }
        
        setProperty(data)
        
        try {
          await recordProjectView(projectId)
        } catch (viewError) {
          console.warn("Failed to record project view:", viewError)
        }
        
      } catch (err) {
        console.error("Error loading property:", err)
        setError(err instanceof Error ? err.message : "Failed to load property")
      } finally {
        setLoading(false)
      }
    }

    loadProperty()
  }, [projectId])

  if (loading) {
    return <LoadingSkeletonPropertyDetail />
  }

  if (error || !property) {
    return notFound()
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
      await recordProjectPhoneClick(projectId)
      
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
      await recordProjectPhoneClick(projectId)
      
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
    if (website && website.trim()) {
      let url = website.trim()
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`
      }
      window.open(url, '_blank', 'noopener,noreferrer')
    }
    
    recordProjectWebsiteClick(projectId).catch(err => 
      console.warn("Failed to record website click:", err)
    )
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
    return {
      month: parts[0] || "TBD",
      year: parts[1] || "TBD"
    }
  }

  const completionData = parseCompletionNote(property.completion_note)

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex justify-end mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleShare}
          className="hidden md:flex"
        >
          <Share2 className="h-4 w-4" />
          {t.listingDetail?.share || "Share"}
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
              />
            ) : (
              <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">{t.listingDetail?.noImagesAvailable || "No images available for this property"}</p>
              </div>
            );
          })()}
        </div>

        <div className="space-y-4 lg:space-y-6 order-2 lg:order-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5" />
                {t.listingDetail?.priceInformation || "Price Information"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t.listingDetail?.priceRange || "Price Range"}</span>
                  <span className="font-semibold text-lg">
                    {translatePrice(property.price_label || property.price_per_m2, tPrice)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {t.listingDetail?.priceDisclaimer || "Prices may vary based on unit size, floor, and view. Contact for detailed pricing and available units."}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t.listingDetail?.projectTimeline || "Project Timeline"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t.listingDetail?.expectedCompletion || "Expected Completion"}</span>
                  <span className="font-medium">
                    {completionData.month} {completionData.year}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t.listingDetail?.buildingType || "Building Type"}</span>
                  <span className="font-medium">
                    {property.project_type === 'apartment_building' 
                      ? (t.listingDetail?.apartmentComplex || 'Apartment Complex') 
                      : (t.listingDetail?.houseComplex || 'House Complex')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">{t.listingDetail?.contactDeveloper || "Contact Developer"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{t.listingDetail?.company || "Company"}</p>
                <div className="flex items-center gap-3">
                  <Avatar 
                    className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => window.open(`/developers/${property.developer?.id}`, '_blank')}
                  >
                    <AvatarImage 
                      src={property.developer?.profile_image_url} 
                      alt={`${property.developer?.company_name} profile`}
                      className="object-cover cursor-pointer"
                      style={{ cursor: 'pointer' }}
                    />
                    <AvatarFallback 
                      className="text-sm font-semibold bg-primary text-primary-foreground cursor-pointer"
                      style={{ cursor: 'pointer' }}
                    >
                      {property.developer?.company_name?.charAt(0) || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <h4 
                    className="font-semibold text-base text-gray-900 cursor-pointer hover:text-primary transition-colors"
                    onClick={() => window.open(`/developers/${property.developer?.id}`, '_blank')}
                  >
                    {property.developer?.company_name || 'Unknown Developer'}
                  </h4>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{t.listingDetail?.contactPerson || "Contact Person"}</p>
                <p className="text-sm text-gray-700">{property.developer?.contact_person || 'Contact Person'}</p>
              </div>
              
              {!isMobile && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{t.listingDetail?.phone || "Phone"}</p>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span
                      onClick={() => handlePhoneNumberClick(property.developer?.phone)}
                      className="text-sm text-gray-700 font-mono cursor-pointer hover:text-gray-900 transition-colors"
                    >
                      {property.developer?.phone || t.listingDetail?.contactForDetails || 'Contact for details'}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="space-y-2 pt-2">
                {isMobile && (
                  <Button 
                    size="sm"
                    className="w-full text-xs cursor-pointer"
                    onClick={() => handlePhoneClick(property.developer?.phone)}
                    disabled={!property.developer?.phone}
                  >
                    <Phone className="h-3 w-3 mr-1 cursor-pointer" />
                    {t.listingDetail?.callNow || "Call Now"}
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full text-xs cursor-pointer"
                  onClick={handleOfficeAddressClick}
                >
                  <MapPin className="h-3 w-3 mr-1 cursor-pointer" />
                  {t.listingDetail?.officeAddress || "Office Address"}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full text-xs cursor-pointer"
                  onClick={() => handleWebsiteClick(property.developer?.website || property.website)}
                  disabled={!property.developer?.website && !property.website}
                >
                  <Globe className="h-3 w-3 mr-1 cursor-pointer" />
                  {t.listingDetail?.visitWebsite || "Visit Website"}
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6 lg:mt-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 lg:mb-4">
          {property.title || property.name || t.listingDetail?.untitledProject || 'Untitled Project'}
        </h1>
        
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-4 text-gray-600 mb-6 lg:mb-8">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span className="text-sm sm:text-base">{property.location || property.city}</span>
          </div>
          <div className="flex items-center gap-1">
            <Building className="h-4 w-4" />
            <span className="text-sm sm:text-base">
              {property.project_type === 'apartment_building' 
                ? (t.listingDetail?.apartmentComplex || 'Apartment Complex') 
                : (t.listingDetail?.houseComplex || 'House Complex')}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6 lg:space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              {t.listingDetail?.aboutThisProperty || "About This Property"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              {property.description}
            </p>
          </CardContent>
        </Card>

        {property.features && property.features.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                {t.listingDetail?.propertyFeatures || "Property Features & Amenities"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FeaturesDisplay
                features={property.features}
                title=""
                compact={false}
                showCategories={true}
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                {t.listingDetail?.propertyFeatures || "Property Features & Amenities"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-8">{t.listingDetail?.noFeaturesAvailable || "No features available for this property"}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t.listingDetail?.propertyLocation || "Property Location"}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {t.listingDetail?.locationDescription || "Explore the neighborhood and visit the property location without a broker - take your time, no obligations!"}
            </p>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h4 className="font-medium mb-2">{t.listingDetail?.address || "Address"}</h4>
              <p className="text-gray-600">{property.formatted_address || property.location || property.city}</p>
            </div>
            
            {property.latitude && property.longitude ? (
              <>
                <PropertyMap 
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
                    {t.listingDetail?.getDirections || "Get Directions"}
                  </Button>
                </div>
              </>
            ) : (
              <div className="mt-4 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">{t.listingDetail?.locationNotAvailable || "Location coordinates not available"}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {property.developer && (
        <div className="mt-8" id="office-location-section">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                {t.listingDetail?.officeLocation || "Office Location"}
              </CardTitle>
              <p className="text-gray-600 mt-2">
                {t.listingDetail?.officeDescription || "Visit our office to discuss your investment and get personalized assistance."}
              </p>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h4 className="font-medium mb-2">{t.listingDetail?.officeAddressLabel || "Office Address"}</h4>
                <p className="text-gray-600">{property.developer.office_address || t.developersDetail?.addressNotAvailable || 'Address not available'}</p>
              </div>
              
              {property.developer.office_latitude && property.developer.office_longitude ? (
                <>
                  <OfficeMap 
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
                      {t.listingDetail?.getDirectionsToOffice || "Get Directions to Office"}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="mt-4 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">{t.listingDetail?.officeLocationNotAvailable || "Office location not available"}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  )
}

