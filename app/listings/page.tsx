"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"

import { ensureGoogleMaps } from "@/lib/google-maps"
import { MarkerManager, PropertyData } from "@/lib/marker-manager"
import { ListingCard } from "@/components/ListingCard"
import { propertyToListing } from "@/lib/listing-adapter"
import { propertyCache } from "@/lib/property-cache"

import { Card, CardContent } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import { MapPin, Building, Home, Loader2, Star, Heart, ExternalLink, Maximize2, X, RefreshCw } from "lucide-react"
import { useProjects } from "@/hooks/use-projects"
import { getProjects } from "@/lib/api"
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

// City bounds for mobile filtering
const CITY_BOUNDS: Record<CityType, { sw_lat: number; sw_lng: number; ne_lat: number; ne_lng: number }> = {
  Sofia: { sw_lat: 42.5977, sw_lng: 23.2219, ne_lat: 42.7977, ne_lng: 23.4219 },
  Plovdiv: { sw_lat: 42.0354, sw_lng: 24.6453, ne_lat: 42.2354, ne_lng: 24.8453 },
  Varna: { sw_lat: 43.1141, sw_lng: 27.8147, ne_lat: 43.3141, ne_lng: 28.0147 }
}

// Note: Mobile now uses coordinate bounds instead of city names for filtering
// This avoids issues with Google Places API returning different city name variations

// Dynamic header height calculation + robust viewport unit fallback
const useHeaderHeight = () => {
  useEffect(() => {
    const setVhUnit = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }

    const updateHeaderHeight = () => {
      const header = document.querySelector('header')
      if (header) {
        const height = header.offsetHeight
        document.documentElement.style.setProperty('--header-height', `${height}px`)
      }
    }

    // Initial calculation with a small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      setVhUnit()
      updateHeaderHeight()
    }, 100)

    // Recalculate on resize
    window.addEventListener('resize', setVhUnit)
    window.addEventListener('resize', updateHeaderHeight)
    
    // Recalculate when DOM changes
    const observer = new MutationObserver(updateHeaderHeight)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', setVhUnit)
      window.removeEventListener('resize', updateHeaderHeight)
      observer.disconnect()
    }
  }, [])
}

export default function ListingsPage() {
  // Dynamic header height calculation
  useHeaderHeight()
  
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
  const [isProgrammaticMove, setIsProgrammaticMove] = useState(false)
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

  // Cleanup marker manager and background refresh on unmount
  useEffect(() => {
    return () => {
      if (markerManagerRef.current) {
        markerManagerRef.current.cleanup()
      }
      // Stop background refresh when component unmounts
      propertyCache.stopBackgroundRefresh()
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
      // Structural change: desktop map becomes sole map → re-render
      if (markerManagerRef.current && googleMapRef.current) {
        const availableMaps = [googleMapRef.current as unknown as google.maps.Map]
        markerManagerRef.current.updateConfig({ maps: availableMaps })
        markerManagerRef.current.renderMarkers()
      }
    } else if (isMobileMapView && mobileGoogleMapRef.current) {
      // Structural change: desktop + mobile maps active → re-render
      if (markerManagerRef.current) {
        const availableMaps = [googleMapRef.current, mobileGoogleMapRef.current].filter(
          (map): map is google.maps.Map => map !== null
        )
        markerManagerRef.current.updateConfig({ maps: availableMaps })
        markerManagerRef.current.renderMarkers()
      }
    }
  }, [isMobileMapView, mobileGoogleMapRef.current])
  // Map refs
  const markerManagerRef = useRef<MarkerManager | null>(null)
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const listContainerRef = useRef<HTMLDivElement>(null)
  const [mapBounds, setMapBounds] = useState<google.maps.LatLngBounds | null>(null)

  // Airbnb-quality hybrid caching system
  const [cachedProperties, setCachedProperties] = useState<PropertyData[]>([])
  const [isUsingCache, setIsUsingCache] = useState(false)
  const [fetchParams, setFetchParams] = useState<any>({ per_page: 0 })
  
  // Legacy desktop cache for map bounds (still needed for map exploration)
  const propertyCacheRef = useRef<Map<string, PropertyData>>(new Map())
  const loadedTilesRef = useRef<Set<string>>(new Set())
  const [cacheVersion, setCacheVersion] = useState(0)

  // Smart caching: Check cache first, then decide if we need to fetch
  const checkCacheAndFetch = useCallback(async () => {
    const cacheKey = `${selectedCity}-${propertyTypeFilter}`
    
    // 1. Check cache first (instant)
    const cachedData = propertyCache.getCachedData(selectedCity, propertyTypeFilter)
    if (cachedData && cachedData.length > 0) {
      console.log(`✅ Using cached data for ${cacheKey}: ${cachedData.length} properties`)
      setCachedProperties(cachedData)
      setIsUsingCache(true)
      
      // Start background refresh if needed
      if (propertyCache.needsBackgroundRefresh(selectedCity, propertyTypeFilter)) {
        console.log(`🔄 Starting background refresh for ${cacheKey}`)
        propertyCache.startBackgroundRefresh(selectedCity, propertyTypeFilter, async () => {
          const freshData = await fetchFreshData()
          return freshData
        })
      }
      
      return cachedData
    }
    
    // 2. No cache found, fetch fresh data
    console.log(`📡 Fetching fresh data for ${cacheKey}`)
    setIsUsingCache(false)
    const freshData = await fetchFreshData()
    if (freshData && freshData.length > 0) {
      console.log(`💾 Caching ${freshData.length} properties for ${cacheKey}`)
      propertyCache.setCacheData(selectedCity, propertyTypeFilter, freshData)
      setCachedProperties(freshData)
      console.log('📊 Cache stats:', propertyCache.getCacheStats())
    }
    
    return freshData
  }, [selectedCity, propertyTypeFilter])

  // Fetch fresh data from API using existing API infrastructure
  const fetchFreshData = useCallback(async () => {
    const params = {
      per_page: 100,
      sw_lat: CITY_BOUNDS[selectedCity].sw_lat,
      sw_lng: CITY_BOUNDS[selectedCity].sw_lng,
      ne_lat: CITY_BOUNDS[selectedCity].ne_lat,
      ne_lng: CITY_BOUNDS[selectedCity].ne_lng,
      project_type: propertyTypeFilter === 'all' ? undefined :
        propertyTypeFilter === 'apartments' ? 'apartment_building' : 'house_complex'
    }
    
    console.log('📡 Fetching projects with params:', params)
    
    try {
      const data = await getProjects(params)
      console.log(`✅ Fetched ${data.projects?.length || 0} projects`)
      
      // Transform API response to PropertyData format
      return (data.projects || []).map((project: any) => ({
        id: String(project.id),
        slug: String(project.title || project.name || 'Project').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        title: project.title || project.name || 'Project',
        priceRange: project.price_label ? `${project.price_label}` : 'Price on request',
        shortPrice: project.price_label || 'Request price',
        location: project.neighborhood ? `${project.neighborhood}, ${project.city}` : project.city,
        image: project.cover_image_url || '/placeholder.svg?height=300&width=400',
        images: Array.isArray(project.images) ? project.images.map((img: any) => img?.urls?.card || img?.image_url).filter(Boolean) : [],
        description: project.description || '',
        lat: typeof project.latitude === 'number' ? project.latitude : 42.6977,
        lng: typeof project.longitude === 'number' ? project.longitude : 23.3219,
        color: `from-blue-500 to-blue-700`,
        type: project.project_type === 'apartment_building' ? 'Apartment Complex' : 'Residential Houses',
        status: 'Under Construction',
        developer: project.developer?.company_name || 'Unknown Developer',
        completionDate: project.expected_completion_date ? 
          new Date(project.expected_completion_date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
          }) : 'TBD',
        rating: 4.5 + Math.random() * 0.4,
        reviews: Math.floor(Math.random() * 30) + 5,
        features: project.amenities_list && project.amenities_list.length > 0 ? project.amenities_list : ['Modern Design', 'Quality Construction'],
        originalPrice: undefined,
      }))
    } catch (error) {
      console.error('Failed to fetch fresh data:', error)
      return []
    }
  }, [selectedCity, propertyTypeFilter])

  // Legacy API hook for fallback (will be removed)
  const { projects: apiProjects, loading, error } = useProjects({ per_page: 0 })

  // Trigger cache check when city or property type changes
  useEffect(() => {
    checkCacheAndFetch()
  }, [selectedCity, propertyTypeFilter, checkCacheAndFetch])

  // Listen for background cache updates
  useEffect(() => {
    const handleCacheUpdate = (event: CustomEvent) => {
      const { city, propertyType, data } = event.detail
      if (city === selectedCity && propertyType === propertyTypeFilter) {
        console.log(`🔄 Background update received: ${data.length} properties`)
        setCachedProperties(data)
        // Show subtle notification that data was updated
        setAriaLiveMessage(`Updated with ${data.length} properties`)
      }
    }

    window.addEventListener('propertyCacheUpdated', handleCacheUpdate as EventListener)
    return () => {
      window.removeEventListener('propertyCacheUpdated', handleCacheUpdate as EventListener)
    }
  }, [selectedCity, propertyTypeFilter])

  // Debug: Expose cache stats to window for debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).propertyCache = propertyCache
      console.log('🔧 Cache manager available at window.propertyCache')
      console.log('📊 Current cache stats:', propertyCache.getCacheStats())
    }
  }, [])
  
  // Debounced bounds update for desktop caching system only
  const debouncedBoundsUpdate = useCallback(
    debounce((bounds: google.maps.LatLngBounds) => {
      // Skip bounds updates on mobile - mobile uses simple city-based fetching
      if (typeof window !== 'undefined' && window.innerWidth < 1024) return
      
      const sw = bounds.getSouthWest()
      const ne = bounds.getNorthEast()
      
      // Only set bounds-loading if we will actually fetch
      setCurrentBounds({
        sw_lat: sw.lat(),
        sw_lng: sw.lng(),
        ne_lat: ne.lat(),
        ne_lng: ne.lng(),
      })

      // Compute a stable tile key to avoid duplicate fetches (0.05° grid, center-based)
      const center = bounds.getCenter()
      const tileKey = `${Math.floor(center.lat()/0.05)}:${Math.floor(center.lng()/0.05)}`
      const willFetch = !loadedTilesRef.current.has(tileKey)
      if (willFetch) {
        setIsBoundsLoading(true)
        loadedTilesRef.current.add(tileKey)
        setFetchParams({
          per_page: 100,
          sw_lat: sw.lat(),
          sw_lng: sw.lng(),
          ne_lat: ne.lat(),
          ne_lng: ne.lng(),
          // Desktop: no city filter, fetch all properties in bounds
        })
      } else {
        // Using cache only – no network
        setFetchParams({ per_page: 0 })
      }
    }, 500),
    []
  )

  // Clear bounds loading when API call completes
  useEffect(() => {
    if (!loading && isBoundsLoading) {
      setIsBoundsLoading(false)
    }
  }, [loading, isBoundsLoading])

  // Legacy: Merge API data into cache (desktop only) - kept for map bounds exploration
  useEffect(() => {
    // Only cache on desktop - mobile uses direct API results
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return
    
    if (apiProjects && apiProjects.length > 0) {
      const projects = apiProjects as unknown as PropertyData[]
      
      // Update desktop property cache (for map bounds exploration)
      projects.forEach((p) => {
        propertyCacheRef.current.set(String((p as any).id || p.id), p)
      })
      
      setCacheVersion((v) => v + 1)
    }
    if (!loading) {
      setIsBoundsLoading(false)
    }
  }, [apiProjects, selectedCity, propertyTypeFilter])

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
          draggableCursor: 'grab',
          draggingCursor: 'grabbing',
        })
                 googleMapRef.current = map
         
         // Add cursor behavior to desktop map container only
         const mapContainer = mapRef.current
         if (mapContainer) {
           mapContainer.style.cursor = 'grab'
           
           // Add mouse event listeners for cursor changes
           mapContainer.addEventListener('mousedown', () => {
             mapContainer.style.cursor = 'grabbing'
           })
           
           mapContainer.addEventListener('mouseup', () => {
             mapContainer.style.cursor = 'grab'
           })
           
           mapContainer.addEventListener('mouseleave', () => {
             mapContainer.style.cursor = 'grab'
           })
         }
         
         // Add click listener to close property card when clicking on map (Airbnb-style)
         map.addListener('click', () => {
           if (selectedPropertyId) {
             console.log('🗺️ DESKTOP MAP CLICKED - Closing property card')
             setSelectedPropertyId(null)
           }
         })
         
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
          // Skip API calls during programmatic map movements (city switches)
          if (isProgrammaticMove) return
          
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
          draggableCursor: 'grab',
          draggingCursor: 'grabbing',
        })
        mobileGoogleMapRef.current = mobileMap
        
        // Add click listener to close property card when tapping on map (Airbnb-style)
        mobileMap.addListener('click', () => {
          if (selectedPropertyId) {
            console.log('🗺️ MOBILE MAP CLICKED - Closing property card')
            setSelectedPropertyId(null)
          }
        })
        
        // Center on selected city with current filters
        mobileMap.setCenter(CITY_COORDINATES[selectedCity])
        mobileMap.setZoom(CITY_COORDINATES[selectedCity].zoom)
        
        // Mobile map doesn't need bounds listeners - it shows filtered properties from grid
        // No bounds updates needed for mobile
        
        // Structural change: mobile map created → re-render
        if (markerManagerRef.current) {
          const availableMaps = [googleMapRef.current, mobileMap].filter(
            (map): map is google.maps.Map => map !== null
          )
          markerManagerRef.current.updateConfig({ maps: availableMaps })
          markerManagerRef.current.renderMarkers()
        }

        // Mobile map shows properties from current grid filter - no initial fetch needed
      } catch (e) {
        console.error("Error initializing mobile Google Maps:", e)
      }
    }
    initMobileMap()
    }, [isMobileMapView, selectedCity])
  
  // Recenter when city changes (navigation only, not filtering)
  useEffect(() => {
    // Set flag to prevent API calls during programmatic map movement
    setIsProgrammaticMove(true)
    
    // Recenter desktop map
    if (googleMapRef.current) {
      googleMapRef.current.panTo(CITY_COORDINATES[selectedCity])
      googleMapRef.current.setZoom(CITY_COORDINATES[selectedCity].zoom)
    }
    
    // Recenter mobile map if it exists
    if (mobileGoogleMapRef.current) {
      mobileGoogleMapRef.current.panTo(CITY_COORDINATES[selectedCity])
      mobileGoogleMapRef.current.setZoom(CITY_COORDINATES[selectedCity].zoom)
    }
    
    // Reset flag after map animation completes (1 second should be enough)
    setTimeout(() => {
      setIsProgrammaticMove(false)
    }, 1000)
    
    // Desktop: Only fetch if we don't have cached data for this city
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      const bounds = googleMapRef.current?.getBounds()
      if (bounds) {
        // Don't clear cache - keep previous city data
        setMapBounds(bounds)
        
        // Check cache will be handled by checkCacheAndFetch
        // No need to manually trigger fetch here - the useEffect will handle it
      }
    }
    // Mobile: No cache reset needed - mobileFetchParams will trigger new fetch automatically
  }, [selectedCity])

  // Build filtered list using Airbnb-quality caching
  const filteredProperties = useMemo(() => {
    // Use cached properties as primary source
    if (cachedProperties && cachedProperties.length > 0) {
      // Filter by map bounds if on desktop and bounds are available
      if (typeof window !== 'undefined' && window.innerWidth >= 1024 && mapBounds) {
        return cachedProperties.filter((p) =>
          typeof p.lat === 'number' && typeof p.lng === 'number' &&
          mapBounds.contains(new google.maps.LatLng(p.lat, p.lng))
        )
      }
      
      // Mobile or no bounds: return all cached properties
      return cachedProperties
    }
    
    // Fallback to legacy system if no cached data
    const all = Array.from(propertyCacheRef.current.values())
    const typeFiltered = all.filter((p) => {
      if (propertyTypeFilter === 'all') return true
      if (propertyTypeFilter === 'apartments') return p.type === 'Apartment Complex'
      if (propertyTypeFilter === 'houses') return p.type === 'Residential Houses'
      return true
    })
    
    if (!mapBounds) return typeFiltered
    return typeFiltered.filter((p) =>
      typeof p.lat === 'number' && typeof p.lng === 'number' &&
      mapBounds.contains(new google.maps.LatLng(p.lat, p.lng))
    )
  }, [cachedProperties, propertyTypeFilter, mapBounds, cacheVersion]) || []

  // Memoize to prevent effects from re-running on equivalent arrays
  const memoizedProperties = useMemo(() => filteredProperties, [
    filteredProperties.length,
    JSON.stringify(filteredProperties.map(p => p.id)),
  ])

  // Debug filtered properties
  useEffect(() => {

  }, [filteredProperties, propertyTypeFilter, selectedCity])

  // Data-change only: do not call renderMarkers here
  useEffect(() => {
    if (isMobileMapView && mobileGoogleMapRef.current && markerManagerRef.current) {
      const availableMaps = [googleMapRef.current, mobileGoogleMapRef.current].filter(
        (map): map is google.maps.Map => map !== null
      )
      markerManagerRef.current.updateConfig({ maps: availableMaps })
      // No renderMarkers; properties effect will update visibility
    }
  }, [isMobileMapView])

  // Render/update markers when data changes (visibility mode)
  useEffect(() => {
    if (!googleMapRef.current || !memoizedProperties) return

    const list = memoizedProperties

    // Effect runs to update marker visibility and grid from memoized data


    // Initialize marker manager only once
    if (!markerManagerRef.current) {
      // Get available maps (desktop + mobile if exists and we're in mobile view)
      const availableMaps = [googleMapRef.current as unknown as google.maps.Map]
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

      // Initial render for first-time setup
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
  }, [memoizedProperties, mapBounds])



  // Update marker states when hover/selection changes
  useEffect(() => {
    if (markerManagerRef.current) {
      // First update the config with current hover/selection state
      markerManagerRef.current.updateConfig({
        hoveredPropertyId,
        selectedPropertyId
      })
      // Then update marker states with the new config
      markerManagerRef.current.updateMarkerStates()
    }
  }, [hoveredPropertyId, selectedPropertyId])


  // Structural: desktop/mobile map set changed → re-render
  useEffect(() => {
    if (!markerManagerRef.current) return

    const availableMaps = [googleMapRef.current as unknown as google.maps.Map]
    if (isMobileMapView && mobileGoogleMapRef.current) {
      availableMaps.push(mobileGoogleMapRef.current)
    }

    // Update maps and re-render for structural change only
    markerManagerRef.current.updateConfig({ maps: availableMaps })
    markerManagerRef.current.renderMarkers()
  }, [isMobileMapView])

  // Structural: city change → re-render
  useEffect(() => {
    if (markerManagerRef.current) {
      markerManagerRef.current.renderMarkers()
    }
  }, [selectedCity])

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
    if (googleMapRef.current) {
      // Small delay to ensure DOM has updated
      setTimeout(() => {
        google.maps.event.trigger(googleMapRef.current as unknown as object, 'resize')
        
      }, 100)
    }
  }, [isMapExpanded])

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



  // Smart loading state - don't show loading if we have cached data
  const hasCachedData = cachedProperties && cachedProperties.length > 0
  const shouldShowLoading = !isUsingCache && !hasCachedData && !error
  
  const showEmpty = !shouldShowLoading && !error && filteredProperties && filteredProperties.length === 0
  const showError = !shouldShowLoading && (error || localError)
  const hasData = !shouldShowLoading && !error && filteredProperties && filteredProperties.length > 0

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
    
    // Haptic feedback for city change
    haptic.light()
    
    // No map loading state needed - just panning to new city
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
        <section className="xl:hidden sticky top-0 z-20">
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
                  <span className="hidden xl:inline">Apartments</span>
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
                  <span className="hidden xl:inline">Houses</span>
                </button>
              </div>
            </div>
          </div>
        </section>

      {/* Airbnb-style layout with exact proportions */}
        <div className={`mx-auto w-full max-w-[1905px] px-3 xs:px-4 sm:px-6 md:px-8 py-4`}>
                           {/* Mobile: Full-screen Map or List View */}
          <div className="xl:hidden">
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
                
                {/* Property Card Overlay - Bottom 50% when marker is clicked - Mobile Map View Only */}
                {isMobileMapView && selectedProperty && (
                  <div className="absolute bottom-0 left-0 right-0 h-[50vh] bg-white rounded-t-3xl shadow-2xl z-50">
                    <div className="w-full h-full">
                      <PropertyMapCard
                        property={transformToPropertyMapData(selectedProperty)}
                        onClose={() => setSelectedPropertyId(null)}
                        position={{ bottom: 0, left: 0, right: 0 }}
                        floating={true}
                        forceMobile={true}
                      />
                    </div>
                  </div>
                )}
              </div>
           ) : (
                           <div 
                className="space-y-4 relative"
              >
               
                             {shouldShowLoading ? (
                 isInitialLoading ? (
                   <ListingCardSkeletonGrid count={6} />
                 ) : (
                   <div className="flex flex-col items-center justify-center py-12 xs:py-16 space-y-3 xs:space-y-4">
                     <div className="relative">
                       <Loader2 className="h-8 xs:h-10 w-8 xs:w-10 animate-spin text-brand" />
                       <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                     </div>
                     <div className="text-center">
                       <p className="text-base xs:text-lg font-semibold text-gray-700 mb-1">Loading Properties</p>
                       <p className="text-gray-500 text-sm">Finding the perfect properties for you...</p>
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
                 <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-4 xs:p-6 lg:p-8 text-center shadow-sm">
                   <div className="w-12 xs:w-16 h-12 xs:h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 xs:mb-4">
                     <Building className="w-6 xs:w-8 h-6 xs:h-8 text-gray-500" />
                   </div>
                   <h3 className="text-base xs:text-lg font-semibold text-gray-800 mb-2">
                     {propertyTypeFilter === 'all' ? 'No Properties Available' : 
                      propertyTypeFilter === 'apartments' ? 'No Apartments Found' : 'No Houses Found'}
                   </h3>
                   <p className="text-gray-600 mb-4 xs:mb-6 text-sm">
                     {propertyTypeFilter === 'all' 
                       ? `We couldn't find any properties in ${selectedCity} at the moment. New developments are added regularly, so check back soon!`
                       : propertyTypeFilter === 'apartments'
                       ? `No apartment complexes are currently available in ${selectedCity}. Consider expanding your search to include houses or check back later for new listings.`
                       : `No residential houses are currently available in ${selectedCity}. Consider expanding your search to include apartments or check back later for new listings.`
                     }
                   </p>
                   <p className="text-gray-500 text-sm">
                     💡 Try exploring a different location or adjusting your filters to discover more properties.
                   </p>
                 </div>
                            ) : hasData ? (
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4" style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}>
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
        <div className={`hidden xl:flex ${isMapExpanded ? 'gap-0' : 'gap-8'}`}>
          {/* Left: Scrollable Listings Container */}
          <section className={`min-w-0 ${isMapExpanded ? '!flex-none !w-0 !min-w-0' : ''}`} style={isMapExpanded ? {display: 'none'} : { width: 'calc(100% - max(600px, 40vw) - 2rem)' }}>
             {/* Desktop Filters aligned with map top */}
             <div className="mt-4 mb-4">
              <Card className="shadow-lg border" style={{backgroundColor: '#ffffff', borderColor: 'var(--brand-gray-200)'}}>
                <CardContent className="p-4 laptop:p-4 xl:p-6">
                  <div className="flex flex-row items-center justify-center gap-8 laptop:gap-6 xl:gap-12">
                    {/* City Selector */}
                    <div className="flex flex-col items-center space-y-2 laptop:space-y-2 xl:space-y-3 w-full xl:w-auto">
                      <h3 className="text-base font-semibold flex items-center gap-2" style={{color: 'var(--brand-text-primary)'}}>
                        <MapPin className="w-4 h-4" style={{color: 'var(--brand-btn-primary-bg)'}} />
                        Choose Your City
                      </h3>
                      <ToggleGroup
                        type="single"
                        value={selectedCity}
                        onValueChange={handleCityChange}
                        className="flex gap-2 w-full xl:w-auto"
                      >
                        <ToggleGroupItem 
                          value="Sofia" 
                          className="h-8 laptop:h-8 xl:h-10 px-4 laptop:px-3 xl:px-4 rounded-full border-2 font-medium text-sm laptop:text-sm xl:text-sm shadow-sm hover:shadow-md transition-all duration-300 ease-out bg-transparent border-gray-700 text-gray-900 data-[state=on]:bg-gray-900 data-[state=on]:text-white data-[state=on]:border-gray-900"
                        >
                          Sofia
                        </ToggleGroupItem>
                        <ToggleGroupItem 
                          value="Plovdiv" 
                          className="h-8 laptop:h-8 xl:h-10 px-4 laptop:px-3 xl:px-4 rounded-full border-2 font-medium text-sm laptop:text-sm xl:text-sm shadow-sm hover:shadow-md transition-all duration-300 ease-out bg-transparent border-gray-700 text-gray-900 data-[state=on]:bg-gray-900 data-[state=on]:text-white data-[state=on]:border-gray-900"
                        >
                          Plovdiv
                        </ToggleGroupItem>
                        <ToggleGroupItem 
                          value="Varna" 
                          className="h-8 laptop:h-8 xl:h-10 px-4 laptop:px-3 xl:px-4 rounded-full border-2 font-medium text-sm laptop:text-sm xl:text-sm shadow-sm hover:shadow-md transition-all duration-300 ease-out bg-transparent border-gray-700 text-gray-900 data-[state=on]:bg-gray-900 data-[state=on]:text-white data-[state=on]:border-gray-900"
                        >
                          Varna
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>

                    {/* Divider */}
                    <Separator orientation="vertical" className="hidden xl:block h-12" style={{backgroundColor: 'var(--brand-gray-200)'}} />

                    {/* Property Type Filter */}
                    <div className="flex flex-col items-center space-y-2 laptop:space-y-2 xl:space-y-3 w-full xl:w-auto">
                      <h3 className="text-base font-semibold flex items-center gap-2" style={{color: 'var(--brand-text-primary)'}}>
                        <Building className="w-4 h-4" style={{color: 'var(--brand-btn-primary-bg)'}} />
                        Property Type
                      </h3>
                      <ToggleGroup
                        type="single"
                        value={propertyTypeFilter}
                        onValueChange={handlePropertyTypeFilter}
                        className="flex gap-2 w-full xl:w-auto justify-center"
                      >
                        <ToggleGroupItem 
                          value="all" 
                          className="h-8 laptop:h-8 xl:h-10 px-4 laptop:px-3 xl:px-4 rounded-full border-2 font-medium text-sm laptop:text-sm xl:text-sm shadow-sm hover:shadow-md transition-all duration-300 ease-out bg-transparent border-gray-700 text-gray-900 data-[state=on]:bg-gray-900 data-[state=on]:text-white data-[state=on]:border-gray-900"
                        >
                          All
                        </ToggleGroupItem>
                        <ToggleGroupItem 
                          value="apartments" 
                          className="h-8 laptop:h-8 xl:h-10 px-3 laptop:px-2 xl:px-3 rounded-full border-2 font-medium text-sm laptop:text-sm xl:text-sm shadow-sm hover:shadow-md transition-all duration-300 ease-out flex items-center gap-1 bg-transparent border-gray-700 text-gray-900 data-[state=on]:bg-gray-900 data-[state=on]:text-white data-[state=on]:border-gray-900"
                        >
                          <Building className="w-3 h-3" /> Apartments
                        </ToggleGroupItem>
                        <ToggleGroupItem 
                          value="houses" 
                          className="h-8 laptop:h-8 xl:h-10 px-3 laptop:px-2 xl:px-3 rounded-full border-2 font-medium text-sm laptop:text-sm xl:text-sm shadow-sm hover:shadow-md transition-all duration-300 ease-out flex items-center gap-1 bg-transparent border-gray-700 text-gray-900 data-[state=on]:bg-gray-900 data-[state=on]:text-white data-[state=on]:border-gray-900"
                        >
                          <Home className="w-3 h-3" /> Houses
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
             <div className="listings-map-container overflow-y-auto pr-4 scrollbar-thin" style={{
               scrollbarColor: 'var(--brand-gray-300) var(--brand-gray-100)'
             }}>
              {shouldShowLoading || isBoundsLoading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-6">
                  <div className="relative">
                    <Loader2 className="h-12 w-12 animate-spin" style={{color: 'var(--brand-btn-primary-bg)'}} />
                    <div className="absolute inset-0 rounded-full border-4" style={{borderColor: 'var(--brand-gray-200)'}}></div>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold mb-2" style={{color: 'var(--brand-text-primary)'}}>
                      Loading Properties
                    </p>
                    <p style={{color: 'var(--brand-text-muted)'}}>
                      Finding the perfect properties for you...
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
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Building className="w-10 h-10 text-gray-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    {propertyTypeFilter === 'all' ? 'No Properties Available' : 
                     propertyTypeFilter === 'apartments' ? 'No Apartments Found' : 'No Houses Found'}
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {propertyTypeFilter === 'all' 
                      ? `We couldn't find any properties in ${selectedCity} at the moment. New developments are added regularly, so check back soon!`
                      : propertyTypeFilter === 'apartments'
                      ? `No apartment complexes are currently available in ${selectedCity}. Consider expanding your search to include houses or check back later for new listings.`
                      : `No residential houses are currently available in ${selectedCity}. Consider expanding your search to include apartments or check back later for new listings.`
                    }
                  </p>
                  <p className="text-gray-500 text-sm max-w-md mx-auto">
                    💡 Try exploring a different location or adjusting your filters to discover more properties.
                  </p>
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

           {/* Right: Sticky Map (responsive with minimum width) */}
           <aside className={`${isMapExpanded ? '!flex-1 !w-full' : 'flex-shrink-0'}`} style={{ width: isMapExpanded ? '100%' : 'max(600px, 40vw)' }}>
             <div className="sticky top-4 listings-map-container rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
              <div ref={mapRef} className="w-full h-full bg-muted" />
              
              {/* Expand control */}
              <button
                type="button"
                className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-white/95 border border-gray-200 shadow-lg flex items-center justify-center hover:bg-white hover:shadow-xl transition-all duration-200 cursor-pointer"
                onClick={() => setIsMapExpanded(!isMapExpanded)}
                aria-label={isMapExpanded ? "Collapse map" : "Expand map"}
              >
                {isMapExpanded ? <X className="h-5 w-5 text-gray-700 cursor-pointer" /> : <Maximize2 className="h-5 w-5 text-gray-700 cursor-pointer" />}
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


             {/* Airbnb-style Property Map Card - Desktop Map View Only */}
       {!isMobileMapView && selectedProperty && (
         <PropertyMapCard
           property={transformToPropertyMapData(selectedProperty)}
           onClose={() => setSelectedPropertyId(null)}
           position={cardPosition}
         />
       )}
       
               {/* PWA Install Button - TEMPORARILY DISABLED */}
        {/* <FloatingPWAInstallButton /> */}

                                   {/* Mobile: Sticky Map Button/Pagination - End of Entire Listings Section */}
                  <div className="xl:hidden sticky bottom-6 z-40">
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
                        !isMobileMapView && (
                          <button
                            onClick={() => setIsMobileMapView(true)}
                            className="flex items-center gap-3 px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 font-medium text-lg"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>Map</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
    </div>
  )
  }
