"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"

import { ensureGoogleMaps } from "@/lib/google-maps"
import { MarkerManager, PropertyData } from "@/lib/marker-manager"
import { ListingCard } from "@/components/ListingCard"
import { propertyToListing } from "@/lib/listing-adapter"

import { Card, CardContent } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import { MapPin, Building, Home, Loader2, Star, Heart, ExternalLink, Maximize2, X } from "lucide-react"
import { useProjects } from "@/hooks/use-projects"
import { PropertyMapCard } from "@/components/property-map-card"

// Debounce utility for map bounds updates
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout
  return ((...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }) as T
}

type CityType = "Sofia" | "Plovdiv" | "Varna"
 type PropertyTypeFilter = "all" | "apartments" | "houses"



const CITY_COORDINATES: Record<CityType, { lat: number; lng: number; zoom: number }> = {
  Sofia: { lat: 42.6977, lng: 23.3219, zoom: 11 },
  Plovdiv: { lat: 42.1354, lng: 24.7453, zoom: 11 },
  Varna: { lat: 43.2141, lng: 27.9147, zoom: 11 },
}

export default function ListingsPage() {
  const searchParams = useSearchParams()
  const urlCity = searchParams.get("city") as CityType | null
  const urlType = searchParams.get("type") as PropertyTypeFilter | null

  const [selectedCity, setSelectedCity] = useState<CityType>(
    urlCity && ["Sofia", "Plovdiv", "Varna"].includes(urlCity) ? urlCity : "Sofia",
  )
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<PropertyTypeFilter>(urlType || "all")
  const [isMapLoading, setIsMapLoading] = useState(false)
  const [hoveredPropertyId, setHoveredPropertyId] = useState<number | null>(null)
  const [isMapExpanded, setIsMapExpanded] = useState(false)
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null)
  const [ariaLiveMessage, setAriaLiveMessage] = useState<string>("")
  const [isMobileMapView, setIsMobileMapView] = useState(false)
  const [cardPosition, setCardPosition] = useState<{
    top?: number
    left?: number
    right?: number
    bottom?: number
  }>({})
  const [localError, setLocalError] = useState<string | null>(null)
  
  // Map bounds state for API calls
  const [currentBounds, setCurrentBounds] = useState<{
    sw_lat: number
    sw_lng: number
    ne_lat: number
    ne_lng: number
  } | null>(null)
  const [isBoundsLoading, setIsBoundsLoading] = useState(false)
  
  // Debounce hover updates
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const setDebouncedHover = (propertyId: number | null, delay: number = 150) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredPropertyId(propertyId)
    }, delay)
  }

  // Clear aria live messages after announcement
  useEffect(() => {
    if (ariaLiveMessage) {
      const timer = setTimeout(() => {
        setAriaLiveMessage("")
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [ariaLiveMessage])

  // Cleanup marker manager on unmount
  useEffect(() => {
    return () => {
      if (markerManagerRef.current) {
        markerManagerRef.current.cleanup()
      }
    }
  }, [])

  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<google.maps.Map | null>(null)
  // Fullscreen map refs
  const fullscreenMapRef = useRef<HTMLDivElement>(null)
  const fullscreenGoogleMapRef = useRef<google.maps.Map | null>(null)
  const markerManagerRef = useRef<MarkerManager | null>(null)
  const fullscreenMarkersRef = useRef<Record<number, google.maps.Marker>>({})
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const listContainerRef = useRef<HTMLDivElement>(null)
  const [mapBounds, setMapBounds] = useState<google.maps.LatLngBounds | null>(null)

  // Fetch projects from API using map bounds (only when bounds are available)
  const { projects: apiProjects, loading, error } = useProjects(
    currentBounds ? {
      per_page: 100,
      sw_lat: currentBounds.sw_lat,
      sw_lng: currentBounds.sw_lng,
      ne_lat: currentBounds.ne_lat,
      ne_lng: currentBounds.ne_lng,
    } : {
      // Empty params when no bounds - useProjects will not fetch
      per_page: 0
    }
  )
  
  // Debounced bounds update to avoid spamming API
  const debouncedBoundsUpdate = useCallback(
    debounce((bounds: google.maps.LatLngBounds) => {
      const sw = bounds.getSouthWest()
      const ne = bounds.getNorthEast()
      
      setIsBoundsLoading(true)
      setCurrentBounds({
        sw_lat: sw.lat(),
        sw_lng: sw.lng(),
        ne_lat: ne.lat(),
        ne_lng: ne.lng(),
      })
    }, 500),
    []
  )

  // Clear bounds loading when API call completes
  useEffect(() => {
    if (!loading && isBoundsLoading) {
      setIsBoundsLoading(false)
    }
  }, [loading, isBoundsLoading])

  // Debug API data
  useEffect(() => {
    console.log('🔍 API Data Debug:', { 
      loading, 
      error, 
      projectsCount: apiProjects?.length || 0,
      currentBounds,
      hasProjects: !!apiProjects?.length,
      isBoundsLoading
    })
  }, [apiProjects, loading, error, currentBounds, isBoundsLoading])

  // Initialize Google Maps like the homepage
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return
      try {
        await ensureGoogleMaps()
        const map = new google.maps.Map(mapRef.current, {
          center: CITY_COORDINATES[selectedCity],
          zoom: CITY_COORDINATES[selectedCity].zoom,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          zoomControl: true,
          scrollwheel: true,
          gestureHandling: 'greedy',
          mapId: 'DEMO_MAP_ID', // Required for AdvancedMarkerElement
        })
        googleMapRef.current = map
        
        // Set initial bounds immediately for API call (no debounce on first load)
        const initialBounds = map.getBounds()
        if (initialBounds) {
          const sw = initialBounds.getSouthWest()
          const ne = initialBounds.getNorthEast()
          
          setCurrentBounds({
            sw_lat: sw.lat(),
            sw_lng: sw.lng(),
            ne_lat: ne.lat(),
            ne_lng: ne.lng(),
          })
        }
        
        // Listen for map idle (after pan/zoom/resize)
        google.maps.event.addListener(map, "idle", () => {
          const bounds = map.getBounds()
          if (bounds) {
            setMapBounds(bounds)
            debouncedBoundsUpdate(bounds)
          }
        })
        
        // Listen for zoom changes to re-cluster markers
        google.maps.event.addListener(map, "zoom_changed", () => {
          // Debounce zoom change to avoid excessive re-clustering
          setTimeout(() => {
            if (googleMapRef.current) {
              const bounds = googleMapRef.current.getBounds()
              if (bounds) {
                setMapBounds(bounds)
              }
            }
          }, 300)
        })
      } catch (e) {
        console.error("Error initializing Google Maps:", e)
      }
    }
    initMap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Recenter when city changes (navigation only, not filtering)
  useEffect(() => {
    if (!googleMapRef.current) return
    googleMapRef.current.panTo(CITY_COORDINATES[selectedCity])
    googleMapRef.current.setZoom(CITY_COORDINATES[selectedCity].zoom)
    // Bounds will update via the idle listener and trigger API call
  }, [selectedCity])

  // Apply only property type filters (map bounds drive the data, not city)
  const filteredProperties = (apiProjects as unknown as PropertyData[] | undefined)?.filter((p) => {
    // Apply property type filter only
    if (propertyTypeFilter === "all") return true;
    if (propertyTypeFilter === "apartments") {
      return p.type === "Apartment Complex";
    }
    if (propertyTypeFilter === "houses") {
      return p.type === "Residential Houses";
    }
    return true;
  }) || [];

  // Render markers when filtered data changes with clustering
  useEffect(() => {
    if (!googleMapRef.current || !filteredProperties) return
    
    const list = filteredProperties
    // console.log('🗺️ Updating markers for', list.length, 'filtered projects')

    // Initialize marker manager only once
    if (!markerManagerRef.current) {
      markerManagerRef.current = new MarkerManager({
        map: googleMapRef.current,
        properties: list,
        onPropertySelect: (propertyId) => {
          // console.log('🎯 Marker clicked, property ID:', propertyId)
          setSelectedPropertyId(propertyId)
          if (propertyId) {
            const property = filteredProperties.find(p => p.id === propertyId)
            // console.log('🏠 Found property for card:', property)
            if (property) {
              const position = calculateCardPosition(property)
              // console.log('📍 Calculated card position:', position)
              setCardPosition(position)
            }
            // Scroll to card
            const card = listContainerRef.current?.querySelector(
              `[data-prop-id="${propertyId}"]`
            ) as HTMLElement | null
            if (card) {
              card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" })
            }
          }
        },
        onPropertyHover: (propertyId) => setDebouncedHover(propertyId, 50),
        onAriaAnnouncement: setAriaLiveMessage,
        selectedPropertyId,
        hoveredPropertyId,
      })
      
      // Initial render
      markerManagerRef.current.renderMarkers()
    } else {
      // Update configuration for callbacks that depend on current state
      markerManagerRef.current.updateConfig({
        selectedPropertyId,
        hoveredPropertyId,
        onPropertySelect: (propertyId) => {
          setSelectedPropertyId(propertyId)
          if (propertyId) {
            const property = filteredProperties.find(p => p.id === propertyId)
            if (property) {
              setCardPosition(calculateCardPosition(property))
            }
            const card = listContainerRef.current?.querySelector(
              `[data-prop-id="${propertyId}"]`
            ) as HTMLElement | null
            if (card) {
              card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" })
            }
          }
        },
        onPropertyHover: (propertyId) => setDebouncedHover(propertyId, 50),
        onAriaAnnouncement: setAriaLiveMessage,
      })
      
      // Update properties efficiently without recreating markers
      markerManagerRef.current.updateProperties(list)
    }
  }, [filteredProperties, mapBounds, selectedPropertyId, hoveredPropertyId])



  // Update marker states when hover/selection changes
  useEffect(() => {
    if (markerManagerRef.current) {
      markerManagerRef.current.updateMarkerStates()
    }
    
    // Update fullscreen map markers (if any) - keeping old logic for now
    Object.entries(fullscreenMarkersRef.current).forEach(([id, marker]) => {
      const propertyId = Number(id)
      // Note: We'll need to refactor fullscreen markers later or keep a reference to prices
      // For now, keeping the old behavior
    })
  }, [hoveredPropertyId, selectedPropertyId])

  // When fullscreen map is opened or data changes, sync center/zoom and markers
  useEffect(() => {
    const mountFullscreenMarkers = () => {
      if (!isMapExpanded || !fullscreenGoogleMapRef.current) return

      // Clear existing fullscreen markers
      Object.values(fullscreenMarkersRef.current).forEach((m) => m.setMap(null))
      fullscreenMarkersRef.current = {}

      const list = (apiProjects || []) as unknown as PropertyData[]
      list.forEach((p) => {
        if (typeof p.lat !== "number" || typeof p.lng !== "number") return
        const m = new google.maps.Marker({
          position: { lat: p.lat, lng: p.lng },
          map: fullscreenGoogleMapRef.current!,
          zIndex: 1,
        })
        fullscreenMarkersRef.current[p.id] = m

        // Scroll to card on fullscreen marker click
        m.addListener("click", () => {
          const card = listContainerRef.current?.querySelector(
            `[data-prop-id="${p.id}"]`
          ) as HTMLElement | null
          if (card) {
            setIsMapExpanded(false)
      setTimeout(() => {
              card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" })
              setHoveredPropertyId(p.id)
            }, 50)
          }
        })
      })
    }

    mountFullscreenMarkers()
  }, [isMapExpanded, apiProjects])

  // Transform PropertyData to match PropertyMapCard interface (strictly from API values)
  const transformToPropertyMapData = (property: PropertyData) => {
    const image = property.image || (Array.isArray(property.images) ? property.images[0] : undefined)
    return {
      id: property.id,
      title: property.title,
      location: property.location,
      image,
      images: (property as any).images || (image ? [image] : undefined),
      // Use API-provided shortPrice/price_label string directly; no parsing or mock fallbacks
      priceLabel: property.shortPrice || undefined,
      type: (property.type?.toLowerCase().includes('house') ? 'house' : 'apartment') as 'house' | 'apartment',
    }
  }

  const calculateCardPosition = (property: PropertyData) => {
    if (!mapRef.current || !googleMapRef.current) return {}
    
    const mapBounds = mapRef.current.getBoundingClientRect()
    
    // Simple positioning: center the card on the map with some offset
    const cardWidth = 327
    const cardHeight = 321
    const padding = 20
    
    // Position card in center-right area of map
    let left = mapBounds.left + mapBounds.width * 0.6 - cardWidth / 2
    let top = mapBounds.top + mapBounds.height * 0.3
    
    // Adjust if too close to screen edges
    if (left < padding) left = padding
    if (left + cardWidth > window.innerWidth - padding) {
      left = window.innerWidth - cardWidth - padding
    }
    if (top < padding) top = padding
    if (top + cardHeight > window.innerHeight - padding) {
      top = window.innerHeight - cardHeight - padding
    }
    
    return { top, left }
  }

  const handleCardClick = (property: PropertyData) => {
    setHoveredPropertyId(property.id)
    setSelectedPropertyId(property.id)
    setCardPosition(calculateCardPosition(property))
    
    const marker = markerManagerRef.current?.getMarker(property.id)
    if (googleMapRef.current && marker) {
      // Pan to marker and zoom to at least 14 (Airbnb-style behavior)
      const currentZoom = googleMapRef.current.getZoom() || 10
      const targetZoom = Math.max(currentZoom, 14)
      
      googleMapRef.current.panTo({ lat: property.lat, lng: property.lng })
      if (targetZoom > currentZoom) {
        googleMapRef.current.setZoom(targetZoom)
      }
    }
  }



  const showEmpty = !loading && !error && filteredProperties.length === 0
  const showError = !loading && (error || localError)
  const hasData = !loading && !error && filteredProperties.length > 0

  // Get selected property data for info popup
  const selectedProperty = selectedPropertyId 
    ? filteredProperties.find(p => p.id === selectedPropertyId)
    : null

  // Close card when clicking on the map (outside the card)
  useEffect(() => {
    if (!googleMapRef.current) return
    
    const handleMapClick = () => {
      if (selectedPropertyId) {
        setSelectedPropertyId(null)
      }
    }

    const listener = googleMapRef.current.addListener('click', handleMapClick)

    return () => {
      google.maps.event.removeListener(listener)
    }
  }, [selectedPropertyId])

  const handleCityChange = (city: string) => {
    if (!city || city === selectedCity) return
    const newCity = city as CityType
    setSelectedCity(newCity)
    setIsMapLoading(true)
    // Loading will be cleared when map finishes animating and bounds update
    setTimeout(() => setIsMapLoading(false), 1000)
  }

  const handlePropertyTypeFilter = (type: PropertyTypeFilter) => {
    setPropertyTypeFilter(type)
  }


  return (
    <div className="min-h-screen bg-background">
      {/* Accessibility: Screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {ariaLiveMessage}
      </div>
      {/* Filters - Professional styling (mobile & tablet only) */}
      <section className="py-8 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 lg:hidden">
        <div className="container mx-auto px-4 max-w-[1800px]">
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              {/* Mobile Map/List Toggle */}
              <div className="md:hidden mb-8 flex justify-center">
                <Button 
                  variant={isMobileMapView ? "default" : "outline"}
                  onClick={() => setIsMobileMapView(!isMobileMapView)}
                  className="h-12 px-8 rounded-full border-2 border-brand/20 text-ink bg-brand text-white border-brand hover:bg-brand/90 shadow-lg hover:shadow-xl transition-all duration-300 ease-out font-semibold text-base"
                  size="lg"
                >
                  <span className="mr-2">{isMobileMapView ? "📋" : "🗺️"}</span>
                  {isMobileMapView ? "List View" : "Map View"}
                </Button>
              </div>
              <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
                {/* City Selector */}
                <div className="flex flex-col items-center space-y-4 w-full lg:w-auto">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-brand" />
                    Choose Your City
                  </h3>
                  <ToggleGroup
                    type="single"
                    value={selectedCity}
                    onValueChange={handleCityChange}
                    className="flex gap-3 w-full lg:w-auto"
                  >
                    <ToggleGroupItem 
                      value="Sofia" 
                      className="h-12 px-8 rounded-full border-2 border-brand/20 text-gray-700 data-[state=on]:bg-brand data-[state=on]:text-white data-[state=on]:border-brand hover:bg-brand/10 hover:border-brand/40 transition-all duration-300 ease-out font-semibold text-base shadow-sm hover:shadow-md"
                    >
                      Sofia
                    </ToggleGroupItem>
                    <ToggleGroupItem 
                      value="Plovdiv" 
                      className="h-12 px-8 rounded-full border-2 border-brand/20 text-gray-700 data-[state=on]:bg-brand data-[state=on]:text-white data-[state=on]:border-brand hover:bg-brand/10 hover:border-brand/40 transition-all duration-300 ease-out font-semibold text-base shadow-sm hover:shadow-md"
                    >
                      Plovdiv
                    </ToggleGroupItem>
                    <ToggleGroupItem 
                      value="Varna" 
                      className="h-12 px-8 rounded-full border-2 border-brand/20 text-gray-700 data-[state=on]:bg-brand data-[state=on]:text-white data-[state=on]:border-brand hover:bg-brand/10 hover:border-brand/40 transition-all duration-300 ease-out font-semibold text-base shadow-sm hover:shadow-md"
                    >
                      Varna
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>

                {/* Divider */}
                <Separator orientation="vertical" className="hidden lg:block h-20 bg-gray-200" />
                <Separator className="lg:hidden w-full bg-gray-200" />

                {/* Property Type Filter */}
                <div className="flex flex-col items-center space-y-4 w-full lg:w-auto">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-3">
                    <Building className="w-5 h-5 text-brand" />
                    Property Type
                  </h3>
                  <ToggleGroup
                    type="single"
                    value={propertyTypeFilter}
                    onValueChange={handlePropertyTypeFilter}
                    className="flex flex-wrap gap-3 w-full lg:w-auto justify-center"
                  >
                    <ToggleGroupItem 
                      value="all" 
                      className="h-12 px-8 rounded-full border-2 border-brand/20 text-gray-700 data-[state=on]:bg-brand data-[state=on]:text-white data-[state=on]:border-brand hover:bg-brand/10 hover:border-brand/40 transition-all duration-300 ease-out font-semibold text-base shadow-sm hover:shadow-md"
                    >
                      All
                    </ToggleGroupItem>
                    <ToggleGroupItem 
                      value="apartments" 
                      className="h-12 px-6 rounded-full border-2 border-brand/20 text-gray-700 data-[state=on]:bg-brand data-[state=on]:text-white data-[state=on]:border-brand hover:bg-brand/10 hover:border-brand/40 transition-all duration-300 ease-out font-semibold text-base shadow-sm hover:shadow-md flex items-center gap-2"
                    >
                      <Building className="w-4 h-4" /> Apartments
                    </ToggleGroupItem>
                    <ToggleGroupItem 
                      value="houses" 
                      className="h-12 px-6 rounded-full border-2 border-brand/20 text-gray-700 data-[state=on]:bg-brand data-[state=on]:text-white data-[state=on]:border-brand hover:bg-brand/10 hover:border-brand/40 transition-all duration-300 ease-out font-semibold text-base shadow-sm hover:shadow-md flex items-center gap-2"
                    >
                      <Home className="w-4 h-4" /> Houses
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Airbnb-style layout with exact proportions */}
      <div className="mx-auto w-full max-w-[1905px] px-4 py-8">
        {/* Mobile: Full-screen Map or List View */}
        <div className="lg:hidden">
          {isMobileMapView ? (
            <div className="h-[420px] w-full rounded-lg overflow-hidden">
              <div ref={mapRef} className="w-full h-full bg-muted" />
            </div>
          ) : (
            <div className="space-y-4">
              {loading || isBoundsLoading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                  <div className="relative">
                    <Loader2 className="h-10 w-10 animate-spin text-brand" />
                    <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-700 mb-1">
                      {isBoundsLoading ? 'Updating Properties' : 'Loading Properties'}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {isBoundsLoading ? 'Finding properties in this area...' : 'Finding the perfect properties for you...'}
                    </p>
                  </div>
                </div>
              ) : showError ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Properties</h3>
                  <p className="text-red-600 mb-6 text-sm">We're having trouble connecting to our servers. Please check your internet connection and try again.</p>
                  <Button 
                    onClick={() => window.location.reload()} 
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Try Again
                  </Button>
                </div>
              ) : showEmpty ? (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No Properties in This Area</h3>
                  <p className="text-gray-600 mb-6 text-sm">No properties found in the current map view. Try zooming out to see more properties or explore nearby areas.</p>
                  <div className="flex flex-col gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setPropertyTypeFilter("all")}
                      className="w-full"
                    >
                      Clear Property Type Filter
                    </Button>
                  </div>
                </div>
              ) : hasData ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredProperties.map((property) => (
                    <ListingCard
                      key={property.id}
                      listing={propertyToListing(property)}
                      isActive={selectedPropertyId === property.id}
                      onCardClick={() => handleCardClick(property)}
                      onCardHover={(id) => setDebouncedHover(id, 100)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">Something Went Wrong</h3>
                  <p className="text-yellow-700 text-sm">We encountered an unexpected issue. Please try refreshing the page.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Desktop: Professional layout with 3 listings per row and wider map */}
        <div className="hidden lg:flex gap-8">
          {/* Left: Scrollable Listings Container (60% width) */}
          <section className="flex-1 min-w-0">
            {/* Desktop Filters aligned with map top */}
            <div className="mb-6">
              <Card className="shadow-lg border" style={{backgroundColor: '#ffffff', borderColor: 'var(--brand-gray-200)'}}>
                <CardContent className="p-6">
                  <div className="flex flex-row items-center justify-center gap-12">
                    {/* City Selector */}
                    <div className="flex flex-col items-center space-y-4 w-full lg:w-auto">
                      <h3 className="text-lg font-bold flex items-center gap-3" style={{color: 'var(--brand-text-primary)'}}>
                        <MapPin className="w-5 h-5" style={{color: 'var(--brand-btn-primary-bg)'}} />
                        Choose Your City
                      </h3>
                      <ToggleGroup
                        type="single"
                        value={selectedCity}
                        onValueChange={handleCityChange}
                        className="flex gap-3 w-full lg:w-auto"
                      >
                        <ToggleGroupItem 
                          value="Sofia" 
                          className="h-12 px-8 rounded-full border-2 font-semibold text-base shadow-sm hover:shadow-md transition-all duration-300 ease-out bg-transparent border-gray-700 text-gray-900 data-[state=on]:bg-gray-900 data-[state=on]:text-white data-[state=on]:border-gray-900"
                        >
                          Sofia
                        </ToggleGroupItem>
                        <ToggleGroupItem 
                          value="Plovdiv" 
                          className="h-12 px-8 rounded-full border-2 font-semibold text-base shadow-sm hover:shadow-md transition-all duration-300 ease-out bg-transparent border-gray-700 text-gray-900 data-[state=on]:bg-gray-900 data-[state=on]:text-white data-[state=on]:border-gray-900"
                        >
                          Plovdiv
                        </ToggleGroupItem>
                        <ToggleGroupItem 
                          value="Varna" 
                          className="h-12 px-8 rounded-full border-2 font-semibold text-base shadow-sm hover:shadow-md transition-all duration-300 ease-out bg-transparent border-gray-700 text-gray-900 data-[state=on]:bg-gray-900 data-[state=on]:text-white data-[state=on]:border-gray-900"
                        >
                          Varna
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>

                    {/* Divider */}
                    <Separator orientation="vertical" className="hidden lg:block h-20" style={{backgroundColor: 'var(--brand-gray-200)'}} />

                    {/* Property Type Filter */}
                    <div className="flex flex-col items-center space-y-4 w-full lg:w-auto">
                      <h3 className="text-lg font-bold flex items-center gap-3" style={{color: 'var(--brand-text-primary)'}}>
                        <Building className="w-5 h-5" style={{color: 'var(--brand-btn-primary-bg)'}} />
                        Property Type
                      </h3>
                      <ToggleGroup
                        type="single"
                        value={propertyTypeFilter}
                        onValueChange={handlePropertyTypeFilter}
                        className="flex flex-wrap gap-3 w-full lg:w-auto justify-center"
                      >
                        <ToggleGroupItem 
                          value="all" 
                          className="h-12 px-8 rounded-full border-2 font-semibold text-base shadow-sm hover:shadow-md transition-all duration-300 ease-out bg-transparent border-gray-700 text-gray-900 data-[state=on]:bg-gray-900 data-[state=on]:text-white data-[state=on]:border-gray-900"
                        >
                          All
                        </ToggleGroupItem>
                        <ToggleGroupItem 
                          value="apartments" 
                          className="h-12 px-6 rounded-full border-2 font-semibold text-base shadow-sm hover:shadow-md transition-all duration-300 ease-out flex items-center gap-2 bg-transparent border-gray-700 text-gray-900 data-[state=on]:bg-gray-900 data-[state=on]:text-white data-[state=on]:border-gray-900"
                        >
                          <Building className="w-4 h-4" /> Apartments
                        </ToggleGroupItem>
                        <ToggleGroupItem 
                          value="houses" 
                          className="h-12 px-6 rounded-full border-2 font-semibold text-base shadow-sm hover:shadow-md transition-all duration-300 ease-out flex items-center gap-2 bg-transparent border-gray-700 text-gray-900 data-[state=on]:bg-gray-900 data-[state=on]:text-white data-[state=on]:border-gray-900"
                        >
                          <Home className="w-4 h-4" /> Houses
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="h-[calc(100vh-120px)] overflow-y-auto pr-4 scrollbar-thin" style={{
              scrollbarColor: 'var(--brand-gray-300) var(--brand-gray-100)'
            }}>
              {loading || isBoundsLoading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-6">
                  <div className="relative">
                    <Loader2 className="h-12 w-12 animate-spin" style={{color: 'var(--brand-btn-primary-bg)'}} />
                    <div className="absolute inset-0 rounded-full border-4" style={{borderColor: 'var(--brand-gray-200)'}}></div>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold mb-2" style={{color: 'var(--brand-text-primary)'}}>
                      {isBoundsLoading ? 'Updating Properties' : 'Loading Properties'}
                    </p>
                    <p style={{color: 'var(--brand-text-muted)'}}>
                      {isBoundsLoading ? 'Finding properties in this area...' : 'Finding the perfect properties for you...'}
                    </p>
                  </div>
                </div>
              ) : showError ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-12 text-center shadow-sm">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Building className="w-10 h-10 text-red-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-red-800 mb-3">Unable to Load Properties</h3>
                  <p className="text-red-600 mb-8 max-w-md mx-auto">We're experiencing technical difficulties. Please check your internet connection and try again.</p>
                  <div className="flex gap-4 justify-center">
                    <Button 
                      onClick={() => window.location.reload()}
                      className="h-11 px-8 rounded-full font-semibold bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      Refresh Page
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setLocalError(null)}
                      className="h-11 px-6 rounded-full font-semibold border-2 border-red-300 text-red-700 hover:border-red-400 hover:bg-red-50 transition-all duration-200"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : showEmpty ? (
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Building className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">No Properties in This Area</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">No properties found in the current map view. Try zooming out to see more properties or explore nearby areas.</p>
                  <div className="flex gap-4 justify-center">
                    <Button 
                      variant="secondary" 
                      onClick={() => setPropertyTypeFilter("all")}
                      className="h-11 px-6 rounded-full font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              ) : hasData ? (
                <div ref={listContainerRef} className="grid grid-cols-3 gap-6">
                  {filteredProperties.map((property, index) => (
                    <div 
                      key={property.id} 
                      data-prop-id={property.id} 
                      className="w-full animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <ListingCard
                        listing={propertyToListing(property)}
                        isActive={selectedPropertyId === property.id}
                        onCardClick={() => handleCardClick(property)}
                        onCardHover={(id) => setDebouncedHover(id, 100)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-12 text-center shadow-sm">
                  <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Building className="w-10 h-10 text-yellow-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-yellow-800 mb-3">Something Went Wrong</h3>
                  <p className="text-yellow-700 max-w-md mx-auto">We encountered an unexpected issue. Please try refreshing the page.</p>
                </div>
              )}
            </div>
          </section>

          {/* Right: Sticky Map (fixed width on 2XL to match Airbnb) */}
          <aside className="w-[40%] 2xl:w-[752px] flex-shrink-0">
            <div className="sticky top-8 h-[calc(100vh-120px)] rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
              <div ref={mapRef} className="w-full h-full bg-muted" />
              
              {/* Expand control */}
              <button
                type="button"
                className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-white/95 border border-gray-200 shadow-lg flex items-center justify-center hover:bg-white hover:shadow-xl transition-all duration-200"
                onClick={() => {
                  setIsMapExpanded(true)
                  setTimeout(async () => {
                    try {
                      await ensureGoogleMaps()
                      if (fullscreenMapRef.current && !fullscreenGoogleMapRef.current) {
                        fullscreenGoogleMapRef.current = new google.maps.Map(fullscreenMapRef.current, {
                          center: googleMapRef.current?.getCenter() || CITY_COORDINATES[selectedCity],
                          zoom: googleMapRef.current?.getZoom() || CITY_COORDINATES[selectedCity].zoom,
                          streetViewControl: false,
                          mapTypeControl: false,
                          fullscreenControl: false,
                          zoomControl: true,
                          scrollwheel: true,
                          gestureHandling: 'greedy',
                          mapId: 'DEMO_MAP_ID', // Required for AdvancedMarkerElement
                        })
                      }
                      // Sync center/zoom and markers
                      if (fullscreenGoogleMapRef.current) {
                        fullscreenGoogleMapRef.current.setCenter(
                          googleMapRef.current?.getCenter() || CITY_COORDINATES[selectedCity]
                        )
                        fullscreenGoogleMapRef.current.setZoom(
                          googleMapRef.current?.getZoom() || CITY_COORDINATES[selectedCity].zoom
                        )
                        // Render markers on fullscreen map via sync effect
                        // (markers are mounted in useEffect when isMapExpanded changes)
                      }
                    } catch {}
                  }, 0)
                }}
                aria-label="Expand map"
              >
                <Maximize2 className="h-5 w-5 text-gray-700" />
              </button>
              {isMapLoading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="relative">
                    <Loader2 className="h-8 w-8 animate-spin text-brand" />
                    <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Expanded map overlay */}
      {isMapExpanded && (
        <div className="fixed left-6 right-6 bottom-6 top-8 z-50">
          <div className="absolute inset-0 rounded-2xl border shadow-xl overflow-hidden bg-muted" ref={fullscreenMapRef} />
          <button
            type="button"
            aria-label="Collapse map"
            className="absolute top-6 right-8 z-50 w-9 h-9 rounded-full bg-card/95 border shadow flex items-center justify-center hover:bg-muted"
            onClick={() => setIsMapExpanded(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Airbnb-style Property Map Card */}
      {selectedProperty && (
        <PropertyMapCard
          property={transformToPropertyMapData(selectedProperty)}
          onClose={() => setSelectedPropertyId(null)}
          position={cardPosition}
        />
      )}
    </div>
  )
}
