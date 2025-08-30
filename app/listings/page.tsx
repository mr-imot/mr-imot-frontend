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

import { MapPin, Building, Home, Loader2, Star, Heart, ExternalLink, Maximize2, X, RefreshCw } from "lucide-react"
import { useProjects } from "@/hooks/use-projects"
import { PropertyMapCard } from "@/components/property-map-card"
import { ListingCardSkeleton, ListingCardSkeletonGrid } from "@/components/ListingCardSkeleton"
import { FilterSkeleton } from "@/components/FilterSkeleton"

// import { AdvancedMapGestures } from "@/lib/advanced-map-gestures"
import { haptic } from "@/lib/haptic-feedback"
// import { FloatingPWAInstallButton } from "@/components/PWAInstallButton"

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

// Add city mapping for Bulgarian database values
const CITY_MAPPING: Record<CityType, string> = {
  "Sofia": "София",
  "Plovdiv": "Пловдив",
  "Varna": "Варна"
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
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null)
  const [isMapExpanded, setIsMapExpanded] = useState(false)
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [ariaLiveMessage, setAriaLiveMessage] = useState<string>("")
  const [isMobileMapView, setIsMobileMapView] = useState(false)
  const [cardPosition, setCardPosition] = useState<{
    top?: number
    left?: number
    right?: number
    bottom?: number
  }>({})
  const [localError, setLocalError] = useState<string | null>(null)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  // const [advancedMapGestures, setAdvancedMapGestures] = useState<AdvancedMapGestures | null>(null)
  
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
  
  const setDebouncedHover = (propertyId: string | null, delay: number = 150) => {
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

  // Cleanup marker manager and advanced gestures on unmount
  useEffect(() => {
    return () => {
      if (markerManagerRef.current) {
        markerManagerRef.current.cleanup()
      }
      // if (advancedMapGestures) {
      //   advancedMapGestures.disable()
      // }
    }
  }, [])

  const mapRef = useRef<HTMLDivElement>(null)
  const mobileMapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<google.maps.Map | null>(null)
  const mobileGoogleMapRef = useRef<google.maps.Map | null>(null)

  // Cleanup mobile map when switching views
  useEffect(() => {
    if (!isMobileMapView && mobileGoogleMapRef.current) {
      mobileGoogleMapRef.current = null
      // Re-render markers on desktop map only
      if (markerManagerRef.current && googleMapRef.current) {
        const availableMaps = [googleMapRef.current]
        markerManagerRef.current.updateConfig({ maps: availableMaps })
        markerManagerRef.current.renderMarkers()
      }
    } else if (isMobileMapView && mobileGoogleMapRef.current) {
      // Re-render markers on both maps when mobile map is available
      if (markerManagerRef.current) {
        const availableMaps = [googleMapRef.current, mobileGoogleMapRef.current].filter(
          (map): map is google.maps.Map => map !== null
        )
        markerManagerRef.current.updateConfig({ maps: availableMaps })
        markerManagerRef.current.renderMarkers()
      }
    }
  }, [isMobileMapView, mobileGoogleMapRef.current])
  // Fullscreen map refs
  const fullscreenMapRef = useRef<HTMLDivElement>(null)
  const fullscreenGoogleMapRef = useRef<google.maps.Map | null>(null)
  const markerManagerRef = useRef<MarkerManager | null>(null)
  const fullscreenMarkersRef = useRef<Record<string, google.maps.Marker>>({})
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
      // Add city and property type filters for mobile only (desktop shows all properties in bounds)
      ...(typeof window !== 'undefined' && window.innerWidth < 1024 ? {
        city: CITY_MAPPING[selectedCity], // Use Bulgarian city name for API
        project_type: propertyTypeFilter === 'all' ? undefined :
          propertyTypeFilter === 'apartments' ? 'apartment_building' : 'house_complex'
      } : {}),
    } : {
      // For mobile without bounds, fetch by city and property type
      per_page: 100,
      city: CITY_MAPPING[selectedCity], // Use Bulgarian city name for API
      project_type: propertyTypeFilter === 'all' ? undefined :
        propertyTypeFilter === 'apartments' ? 'apartment_building' : 'house_complex',
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
         
         // Initialize advanced map gestures - TEMPORARILY DISABLED
         // const gestures = new AdvancedMapGestures({
         //   map,
         //   enablePinchToZoom: true,
         //   enableRotation: true,
         //   enableDoubleTapZoom: true,
         //   enableLongPress: true,
         //   hapticFeedback: true
         // })
         // gestures.enable()
         // setAdvancedMapGestures(gestures)
         
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

  // Initialize mobile map when mobile map view is enabled
  useEffect(() => {
    const initMobileMap = async () => {
      if (!isMobileMapView || !mobileMapRef.current || mobileGoogleMapRef.current) return
      try {
        await ensureGoogleMaps()
        const mobileMap = new google.maps.Map(mobileMapRef.current, {
          center: CITY_COORDINATES[selectedCity],
          zoom: CITY_COORDINATES[selectedCity].zoom,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          zoomControl: true,
          scrollwheel: true,
          gestureHandling: 'greedy',
          mapId: 'DEMO_MAP_ID',
        })
        mobileGoogleMapRef.current = mobileMap
        
        // Center on selected city with current filters
        mobileMap.setCenter(CITY_COORDINATES[selectedCity])
        mobileMap.setZoom(CITY_COORDINATES[selectedCity].zoom)
        
        // Add bounds listener for mobile map to update markers
        mobileMap.addListener('idle', () => {
          const bounds = mobileMap.getBounds()
          if (bounds) {
            // Update current bounds for API calls
            const sw = bounds.getSouthWest()
            const ne = bounds.getNorthEast()
            setCurrentBounds({
              sw_lat: sw.lat(),
              sw_lng: sw.lng(),
              ne_lat: ne.lat(),
              ne_lng: ne.lng(),
            })
          }
        })
        
        // Ensure markers are rendered on mobile map
        if (markerManagerRef.current) {
          const availableMaps = [googleMapRef.current, mobileMap].filter(
            (map): map is google.maps.Map => map !== null
          )
          markerManagerRef.current.updateConfig({ maps: availableMaps })
          markerManagerRef.current.renderMarkers()
        }
      } catch (e) {
        console.error("Error initializing mobile Google Maps:", e)
      }
    }
    initMobileMap()
    }, [isMobileMapView, selectedCity])
  
  // Recenter when city changes (navigation only, not filtering)
  useEffect(() => {
    if (!googleMapRef.current) return
    googleMapRef.current.panTo(CITY_COORDINATES[selectedCity])
    googleMapRef.current.setZoom(CITY_COORDINATES[selectedCity].zoom)
    
    // Set bounds immediately for API call
    const bounds = googleMapRef.current.getBounds()
    if (bounds) {
      const sw = bounds.getSouthWest()
      const ne = bounds.getNorthEast()
      setCurrentBounds({
        sw_lat: sw.lat(),
        sw_lng: sw.lng(),
        ne_lat: ne.lat(),
        ne_lng: ne.lng(),
      })
    }
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

  // Debug filtered properties
  useEffect(() => {

  }, [filteredProperties, propertyTypeFilter, selectedCity])

  // Update mobile map markers when mobile map view or filtered properties change
  useEffect(() => {
    if (isMobileMapView && mobileGoogleMapRef.current && markerManagerRef.current) {
      const availableMaps = [googleMapRef.current, mobileGoogleMapRef.current].filter(
        (map): map is google.maps.Map => map !== null
      )
      markerManagerRef.current.updateConfig({ maps: availableMaps })
      markerManagerRef.current.renderMarkers()
    }
  }, [isMobileMapView, filteredProperties])

  // Render markers when filtered data changes with clustering
  useEffect(() => {
    if (!googleMapRef.current || !filteredProperties) return

    const list = filteredProperties


    // Initialize marker manager only once
    if (!markerManagerRef.current) {
      // Get available maps (desktop + mobile if exists and we're in mobile view)
      const availableMaps = [googleMapRef.current]
      if (isMobileMapView && mobileGoogleMapRef.current) {
        availableMaps.push(mobileGoogleMapRef.current)
      }

      markerManagerRef.current = new MarkerManager({
        maps: availableMaps,
        properties: list,
        onPropertySelect: (propertyId) => {
          setSelectedPropertyId(propertyId)
          if (propertyId) {
            const property = filteredProperties.find(p => p.id === propertyId)
            if (property) {
              setCardPosition(calculateCardPosition(property))
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
       const propertyId = id
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
      developer: (property as any).developer ? {
        company_name: (property as any).developer.company_name,
        phone: (property as any).developer.phone,
        website: (property as any).developer.website,
      } : undefined,
    }
  }

  const calculateCardPosition = (property: PropertyData) => {
    if (!mapRef.current || !googleMapRef.current) return {}
    
    const mapBounds = mapRef.current.getBoundingClientRect()
    const cardWidth = 327
    const cardHeight = 321
    const padding = 20
    
    // Convert property lat/lng to screen coordinates
    const projection = googleMapRef.current.getProjection()
    if (!projection) {
      // Fallback to center positioning if projection not available
      return {
        top: mapBounds.top + mapBounds.height * 0.3,
        left: mapBounds.left + mapBounds.width * 0.6 - cardWidth / 2
      }
    }
    
    const markerLatLng = new google.maps.LatLng(property.lat, property.lng)
    const markerPoint = projection.fromLatLngToPoint(markerLatLng)
    const bounds = googleMapRef.current.getBounds()
    
    if (!markerPoint || !bounds) {
      // Fallback positioning
      return {
        top: mapBounds.top + mapBounds.height * 0.3,
        left: mapBounds.left + mapBounds.width * 0.6 - cardWidth / 2
      }
    }
    
    // Calculate marker's position within the map viewport
    const sw = projection.fromLatLngToPoint(bounds.getSouthWest())
    const ne = projection.fromLatLngToPoint(bounds.getNorthEast())
    
    if (!sw || !ne) return { top: mapBounds.top + 100, left: mapBounds.left + 100 }
    
    // Normalize marker position to 0-1 range within viewport
    const markerX = (markerPoint.x - sw.x) / (ne.x - sw.x)
    const markerY = (markerPoint.y - ne.y) / (sw.y - ne.y)
    
    // Convert to screen coordinates
    const markerScreenX = mapBounds.left + markerX * mapBounds.width
    const markerScreenY = mapBounds.top + markerY * mapBounds.height
    
    // Airbnb-style intelligent positioning
    let left: number
    let top: number
    
    // Horizontal positioning: avoid overlapping marker
    if (markerScreenX < mapBounds.left + mapBounds.width / 2) {
      // Marker on left side → place card on right
      left = markerScreenX + 60 // Offset from marker
    } else {
      // Marker on right side → place card on left  
      left = markerScreenX - cardWidth - 60
    }
    
    // Vertical positioning: prefer above marker, but adapt
    if (markerScreenY > mapBounds.top + cardHeight + 60) {
      // Enough space above → place above marker
      top = markerScreenY - cardHeight - 40
    } else {
      // Not enough space above → place below or beside
      top = markerScreenY + 60
    }
    
    // Ensure card stays within screen bounds
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
    // This function is now only used for map interactions
    // The actual navigation is handled by the semantic <a> tag in ListingCard
    // No need to manually open windows
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
    
    // Haptic feedback for city change
    haptic.light()
    
    // Loading will be cleared when map finishes animating and bounds update
    setTimeout(() => setIsMapLoading(false), 1000)
  }

  const handlePropertyTypeFilter = (type: PropertyTypeFilter) => {
    setPropertyTypeFilter(type)
    
    // Haptic feedback for filter change
    haptic.light()
  }



  

  // Set initial loading to false after first data fetch
  useEffect(() => {
    if (!loading) {
      setIsInitialLoading(false)
    }
  }, [loading])


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
                            {/* Glass Morphism Mobile Filters - Premium Design */}
        <section className="lg:hidden sticky top-0 z-20">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              {/* City Dropdown */}
              <div className="flex-1 max-w-44 min-w-0 flex items-center bg-white/20 backdrop-blur-md rounded-xl p-1.5 border border-white/30 shadow-lg">
                <div className="relative w-full">
                  <select
                    value={selectedCity}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border-0 rounded-lg focus:ring-4 focus:ring-brand/20 focus:border-brand transition-all duration-200 bg-transparent text-gray-900 font-semibold hover:bg-white/30 cursor-pointer appearance-none"
                  >
                    <option value="Sofia">📍 Sofia</option>
                    <option value="Plovdiv">📍 Plovdiv</option>
                    <option value="Varna">📍 Varna</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Property Type Switcher */}
              <div className="flex-1 max-w-44 min-w-0 flex items-center bg-white/20 backdrop-blur-md rounded-xl p-1.5 border border-white/30 shadow-lg">
                <button
                  onClick={() => setPropertyTypeFilter('all')}
                  className={`w-1/3 px-4 py-3 rounded-lg text-base font-semibold transition-all duration-200 ${
                    propertyTypeFilter === 'all'
                      ? 'bg-white/90 text-gray-900 shadow-lg'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-white/30'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setPropertyTypeFilter('apartments')}
                  className={`w-1/3 px-4 py-3 rounded-lg text-base font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    propertyTypeFilter === 'apartments'
                      ? 'bg-white/90 text-gray-900 shadow-lg'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-white/30'
                  }`}
                >
                  <Building className="w-5 h-5" />
                  <span className="hidden xs:inline">Apartments</span>
                </button>
                <button
                  onClick={() => setPropertyTypeFilter('houses')}
                  className={`w-1/3 px-4 py-3 rounded-lg text-base font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    propertyTypeFilter === 'houses'
                      ? 'bg-white/90 text-gray-900 shadow-lg'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-white/30'
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <span className="hidden xs:inline">Houses</span>
                </button>
              </div>
            </div>
          </div>
        </section>

      {/* Airbnb-style layout with exact proportions */}
      <div className="mx-auto w-full max-w-[1905px] px-4 py-8">
                           {/* Mobile: Full-screen Map or List View */}
          <div className="lg:hidden">
                       {isMobileMapView ? (
              <div className="fixed inset-0 z-30 bg-white">
                {/* Mobile Full Screen Map Header */}
                <div className="absolute top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setIsMobileMapView(false)}
                        className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all duration-200"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <div className="text-left">
                        <h2 className="font-semibold text-gray-900">
                          {selectedCity} • {propertyTypeFilter === 'all' ? 'All Properties' : 
                           propertyTypeFilter === 'apartments' ? 'Apartments' : 'Houses'}
                        </h2>
                        <p className="text-sm text-gray-600">
                          {filteredProperties.length} properties found
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Full Screen Map */}
                <div ref={mobileMapRef} className="w-full h-full bg-muted" />
                
                {/* Property Card Overlay - Bottom 50% when marker is clicked */}
                {selectedProperty && (
                  <div className="absolute bottom-0 left-0 right-0 h-[50vh] bg-white rounded-t-3xl shadow-2xl z-50">
                    <PropertyMapCard
                      property={transformToPropertyMapData(selectedProperty)}
                      onClose={() => setSelectedPropertyId(null)}
                      position={{ bottom: 0, left: 0, right: 0 }}
                    />
                  </div>
                )}
              </div>
           ) : (
                           <div 
                className="space-y-4 relative"
              >
               
                             {loading || isBoundsLoading ? (
                 isInitialLoading ? (
                   <ListingCardSkeletonGrid count={6} />
                 ) : (
                   <div className="flex flex-col items-center justify-center py-12 xs:py-16 space-y-3 xs:space-y-4">
                     <div className="relative">
                       <Loader2 className="h-8 xs:h-10 w-8 xs:w-10 animate-spin text-brand" />
                       <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                     </div>
                     <div className="text-center">
                       <p className="text-base xs:text-lg font-semibold text-gray-700 mb-1">
                         {isBoundsLoading ? 'Updating Properties' : 'Loading Properties'}
                       </p>
                       <p className="text-gray-500 text-sm">
                         {isBoundsLoading ? 'Finding properties in this area...' : 'Finding the perfect properties for you...'}
                       </p>
                     </div>
                   </div>
                 )
                             ) : showError ? (
                 <div className="bg-red-50 border border-red-200 rounded-2xl p-4 xs:p-6 lg:p-8 text-center">
                   <div className="w-12 xs:w-16 h-12 xs:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 xs:mb-4">
                     <Building className="w-6 xs:w-8 h-6 xs:h-8 text-red-500" />
                   </div>
                   <h3 className="text-base xs:text-lg font-semibold text-red-800 mb-2">Unable to Load Properties</h3>
                   <p className="text-red-600 mb-4 xs:mb-6 text-sm">We're having trouble connecting to our servers. Please check your internet connection and try again.</p>
                   <Button 
                     onClick={() => window.location.reload()} 
                     className="bg-red-600 hover:bg-red-700 text-white px-4 xs:px-6"
                   >
                     Try Again
                   </Button>
                 </div>
               ) : showEmpty ? (
                 <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 xs:p-6 lg:p-8 text-center">
                   <div className="w-12 xs:w-16 h-12 xs:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 xs:mb-4">
                     <Building className="w-6 xs:w-8 h-6 xs:h-8 text-gray-400" />
                   </div>
                   <h3 className="text-base xs:text-lg font-semibold text-gray-800 mb-2">No Properties in This Area</h3>
                   <p className="text-gray-600 mb-4 xs:mb-6 text-sm">No properties found in the current map view. Try zooming out to see more properties or explore nearby areas.</p>
                   <div className="flex flex-col gap-3">
                     <Button 
                       variant="outline" 
                       onClick={() => setPropertyTypeFilter("all")}
                       className="w-full px-4 xs:px-6"
                     >
                       Clear Property Type Filter
                     </Button>
                   </div>
                 </div>
                             ) : hasData ? (
                 <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4">
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
                <div ref={listContainerRef} className="grid grid-cols-3 gap-6 pt-3">
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
       
               {/* PWA Install Button - TEMPORARILY DISABLED */}
        {/* <FloatingPWAInstallButton /> */}

                                   {/* Mobile: Sticky Map Button/Pagination - End of Entire Listings Section */}
                  <div className="lg:hidden sticky bottom-6 z-40">
                    <div className="flex justify-center">
                      {filteredProperties.length >= 18 ? (
                        /* Pagination Navigation - Airbnb Style */
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => {/* TODO: Implement previous page */}}
                            disabled={true} /* TODO: Enable when previous page exists */
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                            aria-label="Previous page"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          <span className="text-sm font-medium text-sm font-medium text-gray-600">
                            Page 1 of {Math.ceil(filteredProperties.length / 18)}
                          </span>
                          <button
                            onClick={() => {/* TODO: Implement next page */}}
                            disabled={filteredProperties.length <= 18}
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                            aria-label="Next page"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      ) : (
                        /* Map Button - When Less Than 18 Listings */
                        <button
                          onClick={() => setIsMobileMapView(!isMobileMapView)}
                          className="flex items-center gap-3 px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 font-medium text-lg"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span>Map</span>
                        </button>
                      )}
                    </div>
                  </div>
      </div>
    )
  }
