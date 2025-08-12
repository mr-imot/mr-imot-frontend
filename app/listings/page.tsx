"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Loader as GoogleLoader } from "@googlemaps/js-api-loader"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Star, Building, Home, Heart, ChevronLeft, ChevronRight, X, ExternalLink, Loader2 } from "lucide-react"
import Link from "next/link"
import { useProjects } from "@/hooks/use-projects"
import { 
  shouldShowMockData, 
  shouldShowDevIndicators, 
  shouldShowMaintenancePage,
  shouldUseGracefulDegradation,
  getErrorHandlingStrategy,
  logError 
} from "@/lib/config"
import MaintenancePage from "@/components/maintenance/maintenance-page"
import GracefulDegradation from "@/components/maintenance/graceful-degradation"
import useHealthCheck from "@/hooks/use-health-check"

interface PropertyData {
  id: number // Changed to number for cleaner URLs
  slug: string // Keep slug for internal reference
  title: string
  priceRange: string
  location: string
  image: string
  description: string
  lat: number
  lng: number
  color: string
  type: "Apartment Complex" | "Residential Houses" | "Mixed-Use Building"
  status: "Under Construction" | "Foundation Laid" | "Framing Complete" | "Pre-Sales Open"
  developer: string
  completionDate: string
  rating: number
  reviews: number
  features: string[]
  originalPrice?: string
  shortPrice: string // For map markers like "€250k"
}

type PropertyTypeFilter = "all" | "houses" | "apartments"

export default function ListingsPage() {
  const [selectedCity, setSelectedCity] = useState("Sofia")
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<PropertyTypeFilter>("all")
  const [isMapLoading, setIsMapLoading] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<PropertyData | null>(null)
  const [hoveredProperty, setHoveredProperty] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<google.maps.Map | null>(null)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })

  // API hook to fetch projects
  const { projects: apiProjects, loading, error } = useProjects({
    city: selectedCity === "all" ? undefined : selectedCity,
    per_page: 50, // Get more for client-side filtering
  })

  // Health check for production monitoring - NO POLLING to prevent UX interruptions
  const { 
    isHealthy, 
    getSystemStatus, 
    isServiceAvailable, 
    checkHealth 
  } = useHealthCheck({
    enabled: false, // Disable automatic health checks to prevent page reloads
    interval: 0 // No automatic polling
  })

  const PROPERTIES_PER_PAGE = 18 // 6 rows × 3 properties per row

  // State for cached system status to prevent re-renders
  const [systemStatus, setSystemStatus] = useState('healthy')
  const [errorHandlingStrategy, setErrorHandlingStrategy] = useState('none')

  // Close popup with escape key - MUST be before any early returns to fix Hooks order
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedProperty(null)
      }
    }

    document.addEventListener("keydown", handleEscapeKey)
    return () => document.removeEventListener("keydown", handleEscapeKey)
  }, [])

  // System status and error handling - moved to useEffect to prevent infinite re-renders
  useEffect(() => {
    const status = getSystemStatus()
    const strategy = getErrorHandlingStrategy(!!error)
    
    setSystemStatus(status)
    setErrorHandlingStrategy(strategy)
    
    // Log errors for monitoring
    if (error) {
      logError(error, {
        context: 'listings_page',
        city: selectedCity,
        systemStatus: status,
        strategy: strategy
      })
    }
  }, [error, selectedCity, getSystemStatus, getErrorHandlingStrategy])

  // No more mock data - developers see real production behavior

  const cities = [
    { name: "Sofia", id: "sofia" },
    { name: "Plovdiv", id: "plovdiv" },
    { name: "Varna", id: "varna" },
  ]

  // Simple data handling - no more mock data fallback
  // Developers and users see exactly the same behavior
  const allProperties = apiProjects || []

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ds-background-50 to-ds-background-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ds-primary-500 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-ds-foreground-800 mb-2">Finding Properties</h3>
              <p className="text-ds-foreground-600">
                Searching for the best properties in {selectedCity}...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Production-ready error handling based on strategy
  if (error && errorHandlingStrategy === 'maintenance') {
    return (
      <MaintenancePage
        message="We're currently experiencing technical difficulties with our property listing service."
        expectedReturn="Service should resume within the next hour"
        onRetry={checkHealth}
        showContact={true}
        showRetry={true}
      />
    );
  }

  // Show empty state when API returns no results - but keep the normal page layout
  const showEmptyState = !loading && !error && apiProjects !== null && apiProjects.length === 0;

  // Filter properties by selected city and property type
  const filteredProperties = allProperties.filter((property: PropertyData) => {
    // City filter
    let cityMatch = true
    if (selectedCity === "Sofia") cityMatch = property.location.includes("Sofia")
    else if (selectedCity === "Plovdiv") cityMatch = property.location.includes("Plovdiv")
    else if (selectedCity === "Varna") cityMatch = property.location.includes("Varna")

    // Property type filter
    let typeMatch = true
    if (propertyTypeFilter === "houses") {
      typeMatch = property.type === "Residential Houses"
    } else if (propertyTypeFilter === "apartments") {
      typeMatch = property.type === "Apartment Complex" || property.type === "Mixed-Use Building"
    }

    return cityMatch && typeMatch
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredProperties.length / PROPERTIES_PER_PAGE)
  const startIndex = (currentPage - 1) * PROPERTIES_PER_PAGE
  const endIndex = startIndex + PROPERTIES_PER_PAGE
  const currentProperties = filteredProperties.slice(startIndex, endIndex)

  // Initialize Google Map once
  useEffect(() => {
    let cancelled = false
    const init = async () => {
      try {
        if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
          console.error('Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY')
          return
        }
        const loader = new GoogleLoader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
          version: "weekly",
        })
        await loader.load()
        if (!mapRef.current || cancelled) return
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 42.6977, lng: 23.3219 },
          zoom: 11,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        })
        googleMapRef.current = map
      } catch (e) {
        console.error("Google Maps init failed", e)
      }
    }
    init()
    return () => { cancelled = true }
  }, [])

  // Handle city change
  const handleCityChange = (value: string) => {
    if (value && value !== selectedCity) {
      setIsMapLoading(true)
      setSelectedCity(value)
      setSelectedProperty(null)
      setHoveredProperty(null)
      setCurrentPage(1) // Reset to first page

      setTimeout(() => {
        setIsMapLoading(false)
      }, 1000)
    }
  }

  // Handle property type filter change
  const handlePropertyTypeChange = (value: PropertyTypeFilter) => {
    setPropertyTypeFilter(value)
    setCurrentPage(1) // Reset to first page
  }

  // Handle property pin click with smart positioning
  const handlePinClick = (property: PropertyData, event: React.MouseEvent) => {
    event.stopPropagation()

    if (!mapRef.current) return

    const mapRect = mapRef.current.getBoundingClientRect()
    const pinElement = event.currentTarget as HTMLElement
    const pinRect = pinElement.getBoundingClientRect()

    // Calculate position relative to map container
    const pinX = pinRect.left - mapRect.left + pinRect.width / 2
    const pinY = pinRect.top - mapRect.top

    // Popup dimensions (approximate)
    const popupWidth = 320
    const popupHeight = 400
    const mapPadding = 32 // 8 * 4 (p-8 padding)
    const mapWidth = mapRect.width - mapPadding * 2
    const mapHeight = mapRect.height - mapPadding * 2

    // Smart positioning logic
    let x = pinX
    let y = pinY - popupHeight - 16 // Default: above the pin

    // Horizontal positioning
    if (x - popupWidth / 2 < mapPadding) {
      // Too far left, align to left edge with padding
      x = mapPadding + popupWidth / 2
    } else if (x + popupWidth / 2 > mapWidth + mapPadding) {
      // Too far right, align to right edge with padding
      x = mapWidth + mapPadding - popupWidth / 2
    }

    // Vertical positioning
    if (y < mapPadding) {
      // Not enough space above, show below the pin
      y = pinY + 40 // Below the pin

      // Check if it fits below
      if (y + popupHeight > mapHeight + mapPadding) {
        // If it doesn't fit below either, center it vertically
        y = mapHeight / 2 - popupHeight / 2 + mapPadding
      }
    }

    setPopupPosition({ x, y })
    setSelectedProperty(property)
  }

  // Handle map click
  const handleMapClick = () => {
    setSelectedProperty(null)
  }

  // Handle property card hover
  const handlePropertyHover = (propertyId: number | null) => {
    setHoveredProperty(propertyId)
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top of listings
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 7

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i)
        pages.push("...")
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 3) {
        pages.push(1)
        pages.push("...")
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push("...")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push("...")
        pages.push(totalPages)
      }
    }

    return pages
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-ds-background-50 to-ds-background-100">
      {/* Development indicator - shows when in dev mode with errors */}
      {error && shouldShowDevIndicators() && (
        <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">
                <strong>🔧 Development Mode:</strong> You're seeing the same experience users would see in production. 
                Start your backend server to see real data.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Graceful degradation notice for partial outages */}
        {error && errorHandlingStrategy === 'graceful' && (
          <GracefulDegradation
            serviceType="listings"
            message="Property listings may be incomplete due to temporary service issues. We're working to restore full functionality."
            onRetry={checkHealth}
            showRetry={true}
          />
        )}

        {/* Filters Row */}
        <div className="flex items-center justify-between">
          {/* Left Side - City Selector + Property Type Filter */}
          <div className="flex items-center space-x-6">
            {/* City Selector - Moved to left */}
            <div className="bg-white/95 backdrop-blur-sm p-1 rounded-xl border border-ds-neutral-200 shadow-sm">
              <ToggleGroup type="single" value={selectedCity} onValueChange={handleCityChange} className="flex gap-1">
                {cities.map((city) => (
                  <ToggleGroupItem
                    key={city.id}
                    value={city.name}
                    className="group relative px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 data-[state=on]:bg-ds-accent-500 data-[state=on]:text-white data-[state=on]:shadow-md data-[state=off]:text-ds-neutral-600 hover:data-[state=off]:text-ds-neutral-800 hover:data-[state=off]:bg-gray-50 hover:scale-105 data-[state=on]:scale-105"
                  >
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 transition-all duration-300 group-data-[state=on]:text-white group-data-[state=off]:text-ds-accent-500 group-hover:scale-110" />
                      <span>{city.name}</span>
                    </div>
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-ds-accent-500 rounded-full opacity-0 group-data-[state=on]:opacity-100 transition-opacity duration-300"></div>
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            {/* Separator */}
            <div className="w-px h-8 bg-ds-neutral-200"></div>

            {/* Property Type Filter */}
            <div className="bg-white/95 backdrop-blur-sm p-1 rounded-xl border border-ds-neutral-200 shadow-sm">
              <ToggleGroup
                type="single"
                value={propertyTypeFilter}
                onValueChange={handlePropertyTypeChange}
                className="flex gap-1"
              >
                <ToggleGroupItem
                  value="all"
                  className="px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 data-[state=on]:bg-ds-accent-500 data-[state=on]:text-white data-[state=on]:shadow-md data-[state=off]:text-ds-neutral-600 hover:data-[state=off]:text-ds-neutral-800 hover:data-[state=off]:bg-gray-50 hover:scale-105 data-[state=on]:scale-105"
                >
                  All Properties
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="houses"
                  className="px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-300 data-[state=on]:bg-ds-accent-500 data-[state=on]:text-white data-[state=on]:shadow-md data-[state=off]:text-ds-neutral-600 hover:data-[state=off]:text-ds-neutral-800 hover:data-[state=off]:bg-gray-50 hover:scale-105 data-[state=on]:scale-105 flex items-center justify-center relative group"
                >
                  <Home className="h-5 w-5 transition-all duration-300 group-data-[state=on]:text-white group-data-[state=off]:text-ds-accent-500 group-hover:scale-110" />
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-ds-accent-500 rounded-full opacity-0 group-data-[state=on]:opacity-100 transition-opacity duration-300"></div>
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="apartments"
                  className="px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-300 data-[state=on]:bg-ds-accent-500 data-[state=on]:text-white data-[state=on]:shadow-md data-[state=off]:text-ds-neutral-600 hover:data-[state=off]:text-ds-neutral-800 hover:data-[state=off]:bg-gray-50 hover:scale-105 data-[state=on]:scale-105 flex items-center justify-center relative group"
                >
                  <Building className="h-5 w-5 transition-all duration-300 group-data-[state=on]:text-white group-data-[state=off]:text-ds-accent-500 group-hover:scale-110" />
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-ds-accent-500 rounded-full opacity-0 group-data-[state=on]:opacity-100 transition-opacity duration-300"></div>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {/* Right Side - Empty for now, can add sorting or other controls later */}
          <div></div>
        </div>

        {/* Main Content - Airbnb Desktop Layout */}
        <div className="flex">
          {/* Left Side - Property Cards (Scrollable) - 60% width */}
          <div className="w-3/5 min-h-[calc(100vh-200px)]">
            <div className="p-6">
              {/* Property Grid - 3 columns, 6 rows max */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                {loading ? (
                  // Loading placeholder cards
                  [...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-100 rounded-lg h-64 animate-pulse"></div>
                  ))
                ) : showEmptyState ? (
                  // Empty state message within the normal layout
                  <div className="col-span-3 text-center py-12">
                    <div className="text-ds-foreground-400 text-6xl mb-4">🏠</div>
                    <h3 className="text-xl font-semibold text-ds-foreground-900 mb-2">
                      No properties in {selectedCity}
                    </h3>
                    <p className="text-ds-foreground-600 mb-6">
                      We don't have any listings in {selectedCity} yet. Try a different city or check back later.
                    </p>
                    <div className="space-y-3">
                      <button 
                        onClick={() => {
                          setPropertyTypeFilter("all")
                          setSelectedCity("Sofia")
                          setCurrentPage(1)
                        }}
                        className="bg-ds-primary-500 text-white px-6 py-2 rounded-lg hover:bg-ds-primary-600 transition-colors"
                      >
                        Browse Sofia Properties
                      </button>
                    </div>
                  </div>
                ) : (
                  currentProperties.map((property: PropertyData) => (
                    <div
                      key={property.id}
                      className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border rounded-lg ${
                        hoveredProperty === property.id
                          ? "border-ds-primary-500 shadow-xl scale-[1.02]"
                          : selectedProperty?.id === property.id
                            ? "border-ds-primary-400 shadow-lg"
                            : "border-ds-neutral-200 hover:border-ds-neutral-300"
                      }`}
                      onMouseEnter={() => handlePropertyHover(property.id)}
                      onMouseLeave={() => handlePropertyHover(null)}
                      onClick={() => window.open(`/listing/${property.id}`, "_blank", "noopener,noreferrer")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          window.open(`/listing/${property.id}`, "_blank", "noopener,noreferrer")
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`View details for ${property.title}`}
                    >
                      <Card className="border-0 shadow-none">
                        <CardContent className="p-0">
                          <div className="flex flex-col">
                            {/* Property Image */}
                            <div className="relative w-full h-48 flex-shrink-0">
                              <Image
                                src={property.image || "/placeholder.svg"}
                                alt={property.title}
                                fill
                                className="object-cover rounded-t-lg transition-transform duration-300 group-hover:scale-105"
                              />
                              {/* Heart Icon */}
                              <button
                                className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 z-10"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  // Handle favorite logic here
                                }}
                                aria-label={`Add ${property.title} to favorites`}
                              >
                                <Heart className="h-4 w-4 text-ds-neutral-600 hover:text-red-500" />
                              </button>
                              {/* Status Badge */}
                              <div className="absolute bottom-3 left-3 bg-ds-accent-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                {property.status}
                              </div>
                            </div>

                            {/* Property Details */}
                            <div className="p-4 space-y-3">
                              {/* Header */}
                              <div className="space-y-1">
                                <h3 className="text-lg font-bold text-ds-neutral-900 group-hover:text-ds-primary-600 transition-colors duration-300 leading-tight line-clamp-1">
                                  {property.title}
                                </h3>
                                <p className="text-sm text-ds-neutral-600 flex items-center line-clamp-1">
                                  <MapPin className="h-3 w-3 mr-1 text-ds-accent-500 flex-shrink-0" />
                                  {property.location}
                                </p>
                              </div>

                              {/* Rating and Type */}
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-1">
                                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                                  <span className="font-semibold">{property.rating}</span>
                                  <span className="text-ds-neutral-500">({property.reviews})</span>
                                </div>
                                <div className="flex items-center space-x-1 text-ds-neutral-600">
                                  {property.type === "Residential Houses" ? (
                                    <Home className="h-3 w-3" />
                                  ) : (
                                    <Building className="h-3 w-3" />
                                  )}
                                  <span className="text-xs">
                                    {property.type.replace(" Complex", "").replace(" Building", "")}
                                  </span>
                                </div>
                              </div>

                              {/* Price */}
                              <div className="flex items-baseline space-x-2">
                                {property.originalPrice && (
                                  <span className="text-sm text-ds-neutral-500 line-through">{property.originalPrice}</span>
                                )}
                                <span className="text-lg font-bold text-ds-primary-600">
                                  {property.priceRange.split(" - ")[0]}
                                </span>
                                <span className="text-xs text-ds-neutral-500">starting</span>
                              </div>

                              {/* Completion Date */}
                              <p className="text-xs text-ds-neutral-600">Completion: {property.completionDate}</p>

                              {/* View Details Button */}
                              <Button
                                className="w-full bg-ds-primary-600 hover:bg-ds-primary-700 text-white font-semibold py-2 rounded-lg mt-3 group-hover:bg-ds-primary-700 transition-colors duration-300"
                                onClick={(e) => e.stopPropagation()}
                                tabIndex={-1}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))
                )}
              </div>

              {/* Airbnb-style Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 py-8">
                  {/* Previous Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border-ds-neutral-300 text-ds-neutral-700 hover:bg-ds-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {/* Page Numbers */}
                  {getPageNumbers().map((page, index) => (
                    <div key={index}>
                      {page === "..." ? (
                        <span className="px-3 py-2 text-ds-neutral-500">...</span>
                      ) : (
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page as number)}
                          className={`px-3 py-2 min-w-[40px] ${
                            currentPage === page
                              ? "bg-ds-neutral-900 text-white hover:bg-ds-neutral-800"
                              : "border-ds-neutral-300 text-ds-neutral-700 hover:bg-ds-neutral-50"
                          }`}
                        >
                          {page}
                        </Button>
                      )}
                    </div>
                  ))}

                  {/* Next Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border-ds-neutral-300 text-ds-neutral-700 hover:bg-ds-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

                          {/* No Results after filtering */}
            {!loading && !showEmptyState && filteredProperties.length === 0 && allProperties.length > 0 && (
              <div className="text-center py-12">
                <div className="text-ds-neutral-400 mb-4">
                  <Building className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-ds-neutral-900 mb-2">No properties match your filters</h3>
                <p className="text-ds-neutral-600 mb-4">Try adjusting your filters or selecting a different city.</p>
                <Button
                  onClick={() => {
                    setPropertyTypeFilter("all")
                    setSelectedCity("Sofia")
                    setCurrentPage(1)
                  }}
                  variant="outline"
                  className="border-ds-primary-600 text-ds-primary-600 hover:bg-ds-primary-50"
                >
                  Reset Filters
                </Button>
              </div>
            )}
            </div>
          </div>

          {/* Right Side - Google Map (Sticky/Fixed) - 40% width */}
          <div className="w-2/5 sticky top-[200px] h-[calc(100vh-200px)] bg-gray-100" onClick={handleMapClick}>
            <div ref={mapRef} className="w-full h-full relative">
              {/* Google Map Canvas */}
              <div className="absolute inset-0" ref={mapRef} />

              {/* Airbnb-style Price Markers */}
              {currentProperties.map((property: PropertyData, index: number) => {
                const positions = [
                  { top: "15%", left: "20%" },
                  { top: "25%", left: "45%" },
                  { top: "35%", left: "70%" },
                  { top: "45%", left: "15%" },
                  { top: "55%", left: "50%" },
                  { top: "65%", left: "75%" },
                  { top: "75%", left: "25%" },
                ]
                const pos = positions[index % positions.length]
                return (
                  <div
                    key={property.id}
                    className={`absolute z-10 cursor-pointer group transition-all duration-300 ${
                      hoveredProperty === property.id
                        ? "scale-110 z-20"
                        : selectedProperty?.id === property.id
                          ? "scale-105 z-20"
                          : "opacity-90 hover:opacity-100"
                    }`}
                    style={{ top: pos.top, left: pos.left }}
                    onMouseEnter={() => handlePropertyHover(property.id)}
                    onMouseLeave={() => handlePropertyHover(null)}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedProperty(property)
                      setPopupPosition({ x: e.clientX, y: e.clientY })
                    }}
                  >
                    <span className="bg-white px-3 py-1 rounded-full shadow-lg border border-ds-primary-500 text-ds-primary-600 font-semibold text-sm group-hover:bg-ds-primary-600 group-hover:text-white transition-colors duration-300">
                      {property.shortPrice}
                    </span>
                  </div>
                )
              })}

              {/* Popup for Selected Property */}
              {selectedProperty && (
                <div
                  className="absolute z-30 bg-white rounded-2xl shadow-2xl border border-ds-neutral-200 overflow-hidden"
                  style={{
                    left: `${popupPosition.x - 160}px`, // Center the popup (320px width / 2)
                    top: `${popupPosition.y}px`,
                    maxWidth: "320px",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Popup Card */}
                  <div className="bg-white rounded-2xl shadow-2xl border border-ds-neutral-200 overflow-hidden w-80 max-w-sm">
                    {/* Property Image */}
                    <div className="relative h-48 w-full">
                      <Image
                        src={selectedProperty.image || "/placeholder.svg"}
                        alt={selectedProperty.title}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-300 hover:scale-105"
                      />

                      {/* Close Button */}
                      <button
                        onClick={() => setSelectedProperty(null)}
                        className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                      >
                        <X className="h-4 w-4 text-ds-neutral-600" />
                      </button>

                      {/* Price Badge */}
                      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        <p className="text-sm font-bold text-ds-neutral-900">{selectedProperty.priceRange}</p>
                      </div>
                    </div>

                    {/* Property Details */}
                    <div className="p-6 space-y-4">
                      {/* Title and Location */}
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-ds-neutral-900 leading-tight">{selectedProperty.title}</h3>
                        <div className="flex items-center text-ds-neutral-600">
                          <MapPin className="h-4 w-4 mr-2 text-ds-accent-500" />
                          <p className="text-sm">{selectedProperty.location}</p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-ds-neutral-700 leading-relaxed">{selectedProperty.description}</p>

                      {/* View Details Button */}
                      <Button
                        asChild
                        className="w-full bg-ds-primary-600 hover:bg-ds-primary-700 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 group"
                      >
                        <Link href={`/listing/${selectedProperty.id}`} target="_blank" rel="noopener noreferrer">
                          View Details
                          <ExternalLink className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading Overlay */}
              {isMapLoading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20">
                  <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-8 w-8 text-ds-primary-600 animate-spin" />
                    <p className="text-sm font-medium text-ds-neutral-700">Loading {selectedCity} projects...</p>
                  </div>
                </div>
              )}

              {/* Map Controls */}
              <div className="absolute bottom-6 right-6 flex flex-col space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-10 h-10 p-0 bg-white/95 backdrop-blur-sm text-lg font-bold"
                >
                  +
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-10 h-10 p-0 bg-white/95 backdrop-blur-sm text-lg font-bold"
                >
                  −
                </Button>
              </div>

              {/* Results Count - Bottom Left */}
              <div className="absolute bottom-6 left-6 bg-ds-neutral-900 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                {filteredProperties.length} projects in {selectedCity}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
