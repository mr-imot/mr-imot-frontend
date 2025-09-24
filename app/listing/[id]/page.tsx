"use client"

import { notFound } from "next/navigation"
import { useEffect, useState, use, useRef } from "react"
import { getProject } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  MapPin,
  Star,
  Building,
  Home,
  Calendar,
  Users,
  Phone,
  Mail,
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
} from "lucide-react"
import { recordProjectView, recordProjectPhoneClick, recordProjectWebsiteClick } from "@/lib/api"
import Image from "next/image"
import { PropertyGallery } from "@/components/PropertyGallery"
import { FeaturesDisplay } from "@/components/FeaturesDisplay"
import { ensureGoogleMaps } from "@/lib/google-maps"

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
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactMessage, setContactMessage] = useState("")

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

  const handlePhoneClick = async (phone: any) => {
    try {
      await recordProjectPhoneClick(projectId)
    } catch (err) {
      console.warn("Failed to record phone click:", err)
    }
  }

  const handleWebsiteClick = async (website: any) => {
    try {
      await recordProjectWebsiteClick(projectId)
    } catch (err) {
      console.warn("Failed to record website click:", err)
    }
  }

  const handleContact = () => {
    setShowContactForm(!showContactForm)
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

          {/* Contact Developer - Made smaller */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Contact Developer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium text-sm">Unknown Developer</h4>
                <p className="text-xs text-gray-600">Property Developer</p>
                <p className="text-xs text-gray-500 mt-1">Office: Contact for location</p>
                <p className="text-xs text-gray-500">Phone: Contact for details</p>
              </div>
              
              <div className="space-y-2">
                <Button 
                  size="sm"
                  className="w-full text-xs cursor-pointer"
                  onClick={handleContact}
                >
                  <Mail className="h-3 w-3 mr-1 cursor-pointer" />
                  Send Message
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full text-xs cursor-pointer"
                  onClick={() => handleWebsiteClick(property.website)}
                >
                  <Globe className="h-3 w-3 mr-1 cursor-pointer" />
                  Visit Website
                </Button>
              </div>

              {/* Contact Form - Compact */}
              {showContactForm && (
                <div className="space-y-3 pt-3 border-t">
                  <div>
                    <label className="text-xs font-medium">Your Message</label>
                    <Textarea
                      placeholder="I'm interested in this property..."
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="mt-1 text-xs"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" className="flex-1 text-xs">
                      Send
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setShowContactForm(false)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
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
              <p className="text-gray-600">{property.location || property.city}</p>
            </div>
            
            {/* Google Maps */}
            {property.latitude && property.longitude ? (
              <PropertyMap 
                latitude={property.latitude} 
                longitude={property.longitude} 
                title={property.title}
              />
            ) : (
              <div className="mt-4 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Location coordinates not available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  )
}