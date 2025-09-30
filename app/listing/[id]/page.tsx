"use client"

import { notFound } from "next/navigation"
import { useEffect, useState, use, useRef } from "react"
import { getProject } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  MapPin,
  Star,
  Building,
  Home,
  Calendar,
  Users,
  Phone,
  ArrowLeft,
  Heart,
  Share2,
  CheckCircle,
  Wifi,
  Car,
  Dumbbell,
  Trees,
  Shield,
  Zap,
  Globe,
  Euro,
  Ruler,
  ChevronLeft,
  ChevronRight,
  X,
  Navigation,
} from "lucide-react"
import { recordProjectView, recordProjectPhoneClick, recordProjectWebsiteClick } from "@/lib/api"
import Image from "next/image"
import { PropertyGallery } from "@/components/PropertyGallery"
import { FeaturesDisplay } from "@/components/FeaturesDisplay"
import { ensureGoogleMaps } from "@/lib/google-maps"
import { useIsMobile } from "@/hooks/use-mobile"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

// Enhanced ImageKit transformation function - PROPER FULLSCREEN HANDLING
const getImageKitUrl = (originalUrl: string, width: number, height: number, quality: number = 90, imageType: 'main' | 'thumbnail' | 'fullscreen' = 'main') => {
  if (!originalUrl || !originalUrl.includes('imagekit.io')) {
    return originalUrl
  }

  const baseUrl = originalUrl.split('?')[0]
  
  let transformations = []
  
  if (imageType === 'fullscreen') {
    // For fullscreen, use higher quality but reasonable size
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
    // For main images
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
          })

          new window.google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            map,
            title: title,
            cursor: "pointer"
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
          })

          new window.google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            map,
            title: title,
            cursor: "pointer"
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

export default function ListingPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const projectId = resolvedParams.id
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const isMobile = useIsMobile()

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
        
        // Record view
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
  }, [projectId, getProject])

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
        console.log("Share canceled or failed:", err)
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        // Could add a toast notification here
      } catch (err) {
        console.error("Failed to copy to clipboard:", err)
      }
    }
  }

  const handlePhoneClick = async (phone: string) => {
    try {
      await recordProjectPhoneClick(projectId)
      
      // Initiate phone call if phone number is available
      if (phone && phone.trim()) {
        // Clean phone number (remove spaces, dashes, etc.)
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
      
      // For desktop, only copy to clipboard (no tel: protocol)
      if (phone && phone.trim()) {
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
        
        // Copy to clipboard
        try {
          await navigator.clipboard.writeText(cleanPhone)
          // You could add a toast notification here if you have one
          console.log('Phone number copied to clipboard:', cleanPhone)
        } catch (clipboardErr) {
          console.warn("Failed to copy to clipboard:", clipboardErr)
        }
      }
    } catch (err) {
      console.warn("Failed to record phone click:", err)
    }
  }

  const handleWebsiteClick = (website: any) => {
    // Open website immediately (synchronous) to prevent mobile popup blocking
    if (website && website.trim()) {
      // Ensure URL has protocol
      let url = website.trim()
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`
      }
      window.open(url, '_blank', 'noopener,noreferrer')
    }
    
    // Record click after opening (async, won't block popup)
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
    // Create Google Maps directions URL
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    
    // Open in new tab
    window.open(directionsUrl, '_blank', 'noopener,noreferrer')
  }


  // Parse completion date for timeline
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
      {/* Header */}
      <div className="flex justify-end mb-6">
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </div>

      {/* New Layout: Image at top, aligned with sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        {/* Left Column - Property Gallery (spans 3 columns) */}
        <div className="lg:col-span-3 order-1 lg:order-1">
          {/* Property Gallery */}
          {(() => {
            const allImages = [];
            
            // Handle the correct image structure from backend
            if (property.images && property.images.length > 0) {
              // Extract image URLs from the images array
              allImages.push(...property.images.map((img: any) => img.image_url));
            }
            
            // Debug logging
            console.log('Gallery Debug:', {
              property_images: property.images,
              allImages: allImages
            });
            
            return allImages.length > 0 ? (
              <PropertyGallery 
                images={allImages} 
                title={property.title}
              />
            ) : (
              <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">No images available for this property</p>
              </div>
            );
          })()}
        </div>

        {/* Right Column - Price & Timeline */}
        <div className="space-y-4 lg:space-y-6 order-2 lg:order-2">
          {/* Price Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5" />
                Price Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Price Range</span>
                  <span className="font-semibold text-lg">
                    {property.price_label || property.price_per_m2 || "Request price"}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Prices may vary based on unit size, floor, and view. Contact for detailed pricing and available units.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Project Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Project Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Expected Completion</span>
                  <span className="font-medium">
                    {completionData.month} {completionData.year}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Building Type</span>
                  <span className="font-medium">
                    {property.project_type === 'apartment_building' ? 'Apartment Complex' : 'House Complex'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Developer - Enhanced Structure */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Contact Developer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Company Information */}
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Company</p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.open(`/developers/${property.developer?.id}`, '_blank')}>
                    <AvatarImage 
                      src={property.developer?.profile_image_url} 
                      alt={`${property.developer?.company_name} profile`}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-sm font-semibold bg-primary text-primary-foreground">
                      {property.developer?.company_name?.charAt(0) || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <h4 className="font-semibold text-base text-gray-900">{property.developer?.company_name || 'Unknown Developer'}</h4>
                </div>
              </div>
              
              {/* Contact Person Information */}
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Contact Person</p>
                <p className="text-sm text-gray-700">{property.developer?.contact_person || 'Contact Person'}</p>
              </div>
              
              {/* Phone Information - Desktop Only */}
              {!isMobile && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Phone</p>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span
                      onClick={() => handlePhoneNumberClick(property.developer?.phone)}
                      className="text-sm text-gray-700 font-mono cursor-pointer hover:text-gray-900 transition-colors"
                    >
                      {property.developer?.phone || 'Contact for details'}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {isMobile && (
                  // Mobile: Show Call Now button
                  <Button 
                    size="sm"
                    className="w-full text-xs cursor-pointer"
                    onClick={() => handlePhoneClick(property.developer?.phone)}
                    disabled={!property.developer?.phone}
                  >
                    <Phone className="h-3 w-3 mr-1 cursor-pointer" />
                    Call Now
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full text-xs cursor-pointer"
                  onClick={handleOfficeAddressClick}
                >
                  <MapPin className="h-3 w-3 mr-1 cursor-pointer" />
                  Office Address
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full text-xs cursor-pointer"
                  onClick={() => handleWebsiteClick(property.developer?.website || property.website)}
                  disabled={!property.developer?.website && !property.website}
                >
                  <Globe className="h-3 w-3 mr-1 cursor-pointer" />
                  Visit Website
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>

      {/* Project Title & Info - Under the image */}
      <div className="mt-6 lg:mt-8">
        {(() => {
          console.log('Property Debug:', {
            title: property.title,
            name: property.name,
            all_property_keys: Object.keys(property)
          });
          return null;
        })()}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 lg:mb-4">
          {property.title || property.name || 'Untitled Project'}
        </h1>
        
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-4 text-gray-600 mb-6 lg:mb-8">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span className="text-sm sm:text-base">{property.location || property.city}</span>
          </div>
          <div className="flex items-center gap-1">
            <Building className="h-4 w-4" />
            <span className="text-sm sm:text-base">{property.project_type === 'apartment_building' ? 'Apartment Complex' : 'House Complex'}</span>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-6 lg:space-y-8">
        {/* About This Property */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              About This Property
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              {property.description}
            </p>
          </CardContent>
        </Card>

        {/* Property Features - Main Features Section */}
        {(() => {
          console.log('Features Debug:', {
            features: property.features,
            hasFeatures: property.features && property.features.length > 0,
            featuresLength: property.features?.length || 0
          });
          
          return property.features && property.features.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Property Features & Amenities
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
                  Property Features & Amenities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-8">No features available for this property</p>
              </CardContent>
            </Card>
          );
        })()}
      </div>

      {/* Bottom Section - Location Only (wider) */}
      <div className="mt-12">
        {/* Property Location - Full Width */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Property Location
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Explore the neighborhood and visit the property location without a broker - take your time, no obligations!
            </p>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h4 className="font-medium mb-2">Address</h4>
              <p className="text-gray-600">{property.formatted_address || property.location || property.city}</p>
            </div>
            
            {/* Google Maps */}
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
                    Get Directions
                  </Button>
                </div>
              </>
            ) : (
              <div className="mt-4 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Location coordinates not available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Office Location Section */}
      {property.developer && (
        <div className="mt-8" id="office-location-section">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Office Location
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Visit our office to discuss your investment and get personalized assistance.
              </p>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h4 className="font-medium mb-2">Office Address</h4>
                <p className="text-gray-600">{property.developer.office_address || 'Address not available'}</p>
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
                      Get Directions to Office
                    </Button>
                  </div>
                </>
              ) : (
                <div className="mt-4 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Office location not available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  )
}