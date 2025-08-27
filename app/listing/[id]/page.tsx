"use client"

import { notFound } from "next/navigation"
import { useEffect, useState, use } from "react"
import { useProjects } from "@/hooks/use-projects"
import { Button } from "@/components/ui/button"
import { Phone, Globe } from "lucide-react"
import { recordProjectView, recordProjectPhoneClick, recordProjectWebsiteClick } from "@/lib/api"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function ListingPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const propertyId = resolvedParams.id // Keep as string since IDs are UUIDs
  const [hasTrackedView, setHasTrackedView] = useState(false)
  
  // Use real API data instead of mock data
  const { projects, loading, error } = useProjects({ per_page: 100 })

  // Always call useEffect, even if loading/error (to maintain hook order)
  useEffect(() => {
    const property = projects?.find(p => p.id === propertyId)
    if (property && !hasTrackedView) {
      const trackView = async () => {
        try {
          await recordProjectView(property.id)
          setHasTrackedView(true)
        } catch (error) {
          // Fail silently to not break user experience
          console.warn('Analytics tracking failed:', error)
          setHasTrackedView(true) // Mark as tracked to avoid retry
        }
      }
      
      trackView()
    }
  }, [projects, propertyId, hasTrackedView])
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Property</h1>
          <p className="text-gray-600">Unable to load property details. Please try again later.</p>
        </div>
      </div>
    )
  }

  const property = projects?.find(p => p.id === propertyId)

  // Debug: Log what we're getting
  console.log('🔍 Debug - All projects:', projects)
  console.log('🔍 Debug - Looking for ID:', propertyId)
  console.log('🔍 Debug - Found property:', property)

  if (!property) {
    notFound()
  }

  const handlePhoneClick = async () => {
    if (property?.developer?.phone) {
      try {
        await recordProjectPhoneClick(property.id)
      } catch (error) {
        console.warn('Analytics tracking failed:', error)
      }
    }
  }

  const handleWebsiteClick = async () => {
    if (property?.developer?.website) {
      try {
        await recordProjectWebsiteClick(property.id)
      } catch (error) {
        console.warn('Analytics tracking failed:', error)
      }
    }
  }

    return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">{property.title}</h1>
            <p className="text-xl text-gray-600 mb-4">{property.description}</p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                {property.status}
              </span>
              <span>•</span>
              <span>{property.type}</span>
              <span>•</span>
              <span>{property.location}</span>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Images */}
            <div className="lg:col-span-2">
              {/* Hero Image Carousel */}
              <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg mb-6">
                <div className="relative aspect-[4/3] w-full">
                  {property.images && property.images.length > 0 ? (
                    <Image
                      src={property.images[0]}
                      alt={property.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No images available</span>
                    </div>
                  )}
                </div>
                
                {/* Image Navigation Dots */}
                {property.images && property.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {property.images.map((_, idx) => (
                      <div key={idx} className="w-2 h-2 rounded-full bg-white/80"></div>
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnail Grid */}
              {property.images && property.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {property.images.slice(1, 5).map((image, idx) => (
                    <div key={idx} className="aspect-square bg-white rounded-lg overflow-hidden shadow-md">
                      <Image
                        src={image}
                        alt={`${property.title} - Image ${idx + 2}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-200"
                        sizes="(max-width: 1024px) 25vw, 16vw"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Details & Contact */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-8">
                {/* Price Section */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {property.priceRange}
                  </div>
                  <div className="text-sm text-gray-500">
                    {property.status} • {property.type}
                  </div>
                </div>

                {/* Property Details */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Property Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="text-gray-900">{property.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="text-gray-900">{property.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="text-gray-900">{property.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completion:</span>
                      <span className="text-gray-900">{property.completionDate}</span>
                    </div>
                  </div>
                </div>

                {/* Developer Info */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Developer</h3>
                  <div className="text-sm text-gray-600 mb-4">
                    {property.developer}
                  </div>
                </div>

                {/* Contact Buttons */}
                <div className="space-y-3">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Developer
                  </Button>
                  <Button variant="outline" className="w-full py-3">
                    <Globe className="h-4 w-4 mr-2" />
                    Visit Website
                  </Button>
                </div>

                {/* Rating */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4" fill={i < Math.floor(property.rating) ? "currentColor" : "none"} viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{property.rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">({property.reviews} reviews)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          {property.features && property.features.length > 0 && (
            <div className="mt-12 bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Features & Amenities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {property.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
