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

import { MapPin, Building, Home, Loader2, Star, Heart, ExternalLink, Maximize2, X, RefreshCw, Search, SlidersHorizontal } from "lucide-react"
import { useProjects } from "@/hooks/use-projects"
import { getProjects } from "@/lib/api"
import { PropertyMapCard } from "@/components/property-map-card"
import { ListingCardSkeleton, ListingCardSkeletonGrid } from "@/components/ListingCardSkeleton"
import { FilterSkeleton } from "@/components/FilterSkeleton"
import { LocationSearch } from "@/components/location-search"
import { DraggableSheet } from "@/components/draggable-sheet"
import { AirbnbSearch } from "@/components/airbnb-search"
import { MobileNav } from "@/components/mobile-nav"

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

interface LocalizedListingsPageProps {
  dict: any
  lang: 'en' | 'bg'
}

export function LocalizedListingsPage({ dict, lang }: LocalizedListingsPageProps) {
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
  
  // Mobile: Always show map, use bottom sheet for listings
  const [mobileSheetSnap, setMobileSheetSnap] = useState(0) // 0 = collapsed, 1 = expanded
  const [mobileBounds, setMobileBounds] = useState<google.maps.LatLngBounds | null>(null)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchButtonRef = useRef<HTMLButtonElement | null>(null)
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
  const [headerSnapPct, setHeaderSnapPct] = useState<number>(90)
  
  // Track current fetch request to prevent race conditions
  const currentFetchRef = useRef<number>(0)
  
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

  // Compute dynamic final snap that stops right below the mobile header
  useEffect(() => {
    const computeHeaderSnap = () => {
      const header = document.getElementById('mobile-map-header')
      if (!header) return setHeaderSnapPct(90)
      const rect = header.getBoundingClientRect()
      const gap = 8
      const viewportH = window.innerHeight || document.documentElement.clientHeight
      let pct = ((viewportH - (rect.bottom + gap)) / viewportH) * 100
      pct = Math.max(70, Math.min(95, Math.round(pct)))
      setHeaderSnapPct(pct)
    }
    computeHeaderSnap()
    window.addEventListener('resize', computeHeaderSnap)
    const mo = new MutationObserver(computeHeaderSnap)
    mo.observe(document.body, { childList: true, subtree: true, attributes: true })
    return () => {
      window.removeEventListener('resize', computeHeaderSnap)
      mo.disconnect()
    }
  }, [])

  const mapRef = useRef<HTMLDivElement>(null)
  const mobileMapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<google.maps.Map | null>(null)
  const mobileGoogleMapRef = useRef<google.maps.Map | null>(null)

  // Mobile: Use single map (mobileGoogleMapRef) on mobile, desktop map on desktop
  useEffect(() => {
    if (markerManagerRef.current) {
      const availableMaps = []
      
      // Desktop: use desktop map
      if (typeof window !== 'undefined' && window.innerWidth >= 1024 && googleMapRef.current) {
        availableMaps.push(googleMapRef.current as unknown as google.maps.Map)
      }
      
      // Mobile: use mobile map
      if (typeof window !== 'undefined' && window.innerWidth < 1024 && mobileGoogleMapRef.current) {
        availableMaps.push(mobileGoogleMapRef.current)
      }
      
      if (availableMaps.length > 0) {
        markerManagerRef.current.updateConfig({ maps: availableMaps })
        markerManagerRef.current.renderMarkers()
      }
    }
  }, [mobileGoogleMapRef.current, googleMapRef.current])
  // Map refs
  const markerManagerRef = useRef<MarkerManager | null>(null)
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const listContainerRef = useRef<HTMLDivElement>(null)
  const [mapBounds, setMapBounds] = useState<google.maps.LatLngBounds | null>(null)

  // Airbnb-style pure bounds-based caching system
  const propertyCacheRef = useRef<Map<string, PropertyData>>(new Map())
  const loadedTilesRef = useRef<Set<string>>(new Set())
  const [fetchParams, setFetchParams] = useState<any>({ per_page: 0 })
  const [cacheVersion, setCacheVersion] = useState(0)

  // Unified: Bounds-based API hook (works for both desktop and mobile)
  const { projects: apiProjects, loading, error } = useProjects(fetchParams)
  
  // CHANGE 1a: Background cache refresh – fetchFreshData helper
  // Fetches via city bounds + type, maps to PropertyData, and stores into global cache
  const fetchFreshData = useCallback(async (): Promise<PropertyData[]> => {
    const params = {
      per_page: 100,
      sw_lat: CITY_BOUNDS[selectedCity].sw_lat,
      sw_lng: CITY_BOUNDS[selectedCity].sw_lng,
      ne_lat: CITY_BOUNDS[selectedCity].ne_lat,
      ne_lng: CITY_BOUNDS[selectedCity].ne_lng,
      project_type:
        propertyTypeFilter === 'all'
          ? undefined
          : propertyTypeFilter === 'apartments'
            ? 'apartment_building'
            : 'house_complex',
    } as const

    try {
      const data: any = await getProjects(params)
      const mapped: PropertyData[] = (data.projects || []).map((project: any) => ({
        id: String(project.id),
        slug: String(project.title || project.name || 'Project')
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, ''),
        title: project.title || project.name || 'Project',
        priceRange: project.price_label ? `${project.price_label}` : 'Price on request',
        shortPrice: project.price_label || 'Request price',
        location: project.neighborhood ? `${project.neighborhood}, ${project.city}` : project.city,
        image: project.cover_image_url || '/placeholder.svg?height=300&width=400',
        images: Array.isArray(project.images)
          ? project.images.map((img: any) => img?.urls?.card || img?.image_url).filter(Boolean)
          : [],
        description: project.description || '',
        lat: typeof project.latitude === 'number' ? project.latitude : 42.6977,
        lng: typeof project.longitude === 'number' ? project.longitude : 23.3219,
        color: `from-blue-500 to-blue-700`,
        type: project.project_type === 'apartment_building' ? 'Apartment Complex' : 'Residential Houses',
        status: 'Under Construction',
        developer: project.developer?.company_name || 'Unknown Developer',
        completionDate: project.expected_completion_date
          ? new Date(project.expected_completion_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
          : 'TBD',
        rating: 4.5 + Math.random() * 0.4,
        reviews: Math.floor(Math.random() * 30) + 5,
        features: project.amenities_list && project.amenities_list.length > 0 ? project.amenities_list : ['Modern Design', 'Quality Construction'],
        originalPrice: undefined,
      }))

      // Populate global cache for this city/type
      propertyCache.setCacheData(selectedCity, propertyTypeFilter, mapped)
      return mapped
    } catch (err) {
      console.error('Failed to fetch fresh data:', err)
      return []
    }
  }, [selectedCity, propertyTypeFilter])

  // CHANGE 1b: checkCacheAndFetch – show cached immediately; start background refresh if needed
  const checkCacheAndFetch = useCallback(async () => {
    const cached = propertyCache.getCachedData(selectedCity, propertyTypeFilter)
    if (cached && cached.length > 0) {
      // Hydrate page-local cache from cached data for immediate UI
      const local = new Map<string, PropertyData>()
      cached.forEach((p) => local.set(String((p as any).id || p.id), p))
      propertyCacheRef.current = local
      setCacheVersion((v) => v + 1)

      // Background refresh if stale – emits propertyCacheUpdated on completion
      if (propertyCache.needsBackgroundRefresh(selectedCity, propertyTypeFilter)) {
        propertyCache.startBackgroundRefresh(selectedCity, propertyTypeFilter, fetchFreshData)
      }
      return cached
    }

    // No cached data: fetch fresh and seed local cache
    const fresh = await fetchFreshData()
    const local = new Map<string, PropertyData>()
    fresh.forEach((p) => local.set(String((p as any).id || p.id), p))
    propertyCacheRef.current = local
    setCacheVersion((v) => v + 1)
    return fresh
  }, [selectedCity, propertyTypeFilter, fetchFreshData])
  
  // DESKTOP: Fetch properties for current map bounds (Airbnb-style)
  const fetchBoundsData = useCallback((bounds: google.maps.LatLngBounds, immediate = false) => {
    // Skip on mobile
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return
    
    const sw = bounds.getSouthWest()
    const ne = bounds.getNorthEast()
    
    setCurrentBounds({
      sw_lat: sw.lat(),
      sw_lng: sw.lng(),
      ne_lat: ne.lat(),
      ne_lng: ne.lng(),
    })

    // Compute a stable tile key to avoid duplicate fetches (0.05° grid)
    const center = bounds.getCenter()
    const tileKey = `${Math.floor(center.lat()/0.05)}:${Math.floor(center.lng()/0.05)}`
    const willFetch = !loadedTilesRef.current.has(tileKey)
    
    if (willFetch) {
      console.log('🔄 Fetching properties for bounds:', { sw: sw.toJSON(), ne: ne.toJSON() })
      setIsBoundsLoading(true)
      loadedTilesRef.current.add(tileKey)
      setFetchParams({
        per_page: 100,
        sw_lat: sw.lat(),
        sw_lng: sw.lng(),
        ne_lat: ne.lat(),
        ne_lng: ne.lng(),
        // Desktop: no city/type filter, fetch all properties in viewport
      })
    } else {
      console.log('✅ Using cached data for this area')
      setFetchParams({ per_page: 0 })
    }
  }, [])

  // Debounced version for pan/zoom
  const debouncedBoundsUpdate = useCallback(
    debounce((bounds: google.maps.LatLngBounds) => {
      // CHANGE 3: Bounds fetch gating – ensure we keep the willFetch vs cached tile branches inside fetchBoundsData
      // and that setIsBoundsLoading(true) and setFetchParams({ per_page: 0 }) are used consistently.
      fetchBoundsData(bounds, false)
    }, 500),
    [fetchBoundsData]
  )

  // Clear bounds loading when API call completes
  useEffect(() => {
    if (!loading && isBoundsLoading) {
      setIsBoundsLoading(false)
    }
  }, [loading, isBoundsLoading])

  // Merge API data into cache when bounds fetch completes (both desktop and mobile)
  useEffect(() => {
    if (apiProjects && apiProjects.length > 0) {
      const projects = apiProjects as unknown as PropertyData[]
      
      console.log(`✅ Cached ${projects.length} properties from bounds fetch`)
      
      // Update cache with fetched properties
      projects.forEach((p) => {
        propertyCacheRef.current.set(String((p as any).id || p.id), p)
      })
      
      setCacheVersion((v) => v + 1)
    }
    
    if (!loading) {
      setIsBoundsLoading(false)
      setIsInitialLoading(false)
    }
  }, [apiProjects, loading])

  // CHANGE 2: Subscribe to propertyCacheUpdated and merge only matching city/type
  useEffect(() => {
    const handleCacheUpdate = (event: Event) => {
      const custom = event as CustomEvent<{ city: string; propertyType: string; data: PropertyData[] }>
      const { city, propertyType, data } = custom.detail || ({} as any)
      if (!city || !propertyType || !Array.isArray(data)) return
      if (city !== selectedCity || propertyType !== propertyTypeFilter) return

      const local = new Map<string, PropertyData>(propertyCacheRef.current)
      data.forEach((p) => local.set(String((p as any).id || p.id), p))
      propertyCacheRef.current = local
      setCacheVersion((v) => v + 1)
      setAriaLiveMessage(`Updated with ${data.length} properties`)
    }

    window.addEventListener('propertyCacheUpdated', handleCacheUpdate as EventListener)
    return () => {
      window.removeEventListener('propertyCacheUpdated', handleCacheUpdate as EventListener)
    }
  }, [selectedCity, propertyTypeFilter])

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
         
         // DESKTOP: Fetch initial data immediately based on map bounds (Airbnb-style)
        const initialBounds = map.getBounds()
        if (initialBounds && typeof window !== 'undefined' && window.innerWidth >= 1024) {
          console.log('🚀 Initial desktop load - fetching properties for Sofia bounds')
          fetchBoundsData(initialBounds, true) // Immediate fetch, no debounce
        }
        
        // Listen for map idle (after pan/zoom/resize)
        google.maps.event.addListener(map, "idle", () => {
          // Skip API calls during programmatic map movements (city switches)
          if (isProgrammaticMove) return
          
          const bounds = map.getBounds()
          if (bounds) {
            setMapBounds(bounds)
            // Desktop: Debounced bounds fetch (Airbnb-style)
            if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
              debouncedBoundsUpdate(bounds)
            }
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

  // Initialize mobile map (always-on, Airbnb-style)
  useEffect(() => {
    const initMobileMap = async () => {
      // Only on mobile
      if (typeof window !== 'undefined' && window.innerWidth >= 1024) return
      if (!mobileMapRef.current || mobileGoogleMapRef.current) return
      
      try {
        await ensureGoogleMaps()
        const mobileMap = new google.maps.Map(mobileMapRef.current, {
          center: CITY_COORDINATES[selectedCity],
          zoom: CITY_COORDINATES[selectedCity].zoom,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          zoomControl: false, // Hide zoom controls for cleaner UI
          scrollwheel: true,
          gestureHandling: 'greedy',
          mapId: 'DEMO_MAP_ID',
          draggableCursor: 'grab',
          draggingCursor: 'grabbing'
          // Note: styles removed when mapId is present to avoid Google Maps warning
        })
        mobileGoogleMapRef.current = mobileMap
        
        // MOBILE: Bounds-based data fetching (like Airbnb)
        mobileMap.addListener('idle', () => {
          const bounds = mobileMap.getBounds()
          if (bounds) {
            console.log('📱 Mobile map bounds changed')
            setMobileBounds(bounds)
            
            // Fetch properties in viewport
            const sw = bounds.getSouthWest()
            const ne = bounds.getNorthEast()
            
            setFetchParams({
              per_page: 100,
              sw_lat: sw.lat(),
              sw_lng: sw.lng(),
              ne_lat: ne.lat(),
              ne_lng: ne.lng(),
              project_type: propertyTypeFilter === 'all' ? undefined :
                propertyTypeFilter === 'apartments' ? 'apartment_building' : 'house_complex'
            })
          }
        })
        
        // Close property card when tapping map
        mobileMap.addListener('click', () => {
          if (selectedPropertyId) {
            setSelectedPropertyId(null)
          }
        })
        
        // Trigger initial fetch after map first idle (ensures bounds are ready)
        google.maps.event.addListenerOnce(mobileMap, 'idle', () => {
          const initialBounds = mobileMap.getBounds()
          if (initialBounds) {
            setMobileBounds(initialBounds)
            const sw = initialBounds.getSouthWest()
            const ne = initialBounds.getNorthEast()
            setFetchParams({
              per_page: 100,
              sw_lat: sw.lat(),
              sw_lng: sw.lng(),
              ne_lat: ne.lat(),
              ne_lng: ne.lng(),
              project_type: propertyTypeFilter === 'all' ? undefined :
                propertyTypeFilter === 'apartments' ? 'apartment_building' : 'house_complex'
            })
          }
        })
      } catch (e) {
        console.error("Error initializing mobile Google Maps:", e)
      }
    }
    initMobileMap()
  }, [])
  
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

        // CHANGE 1c: Check cache and optionally start background refresh on city change
        void checkCacheAndFetch()
      }
    }
    // Mobile: No cache reset needed - mobileFetchParams will trigger new fetch automatically
  }, [selectedCity])

  // CHANGE 1d: Also re-check cache when property type changes (affects cache key)
  useEffect(() => {
    void checkCacheAndFetch()
  }, [propertyTypeFilter])

  // Build filtered list - MOBILE & DESKTOP both use bounds-based filtering
  const filteredProperties = useMemo(() => {
    const all = Array.from(propertyCacheRef.current.values())
    
    // Filter by property type first
    const typeFiltered = all.filter((p) => {
      if (propertyTypeFilter === 'all') return true
      if (propertyTypeFilter === 'apartments') return p.type === 'Apartment Complex'
      if (propertyTypeFilter === 'houses') return p.type === 'Residential Houses'
      return true
    })
    
    // MOBILE: Filter by mobile map bounds
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      if (mobileBounds) {
        return typeFiltered.filter((p) =>
          typeof p.lat === 'number' && typeof p.lng === 'number' &&
          mobileBounds.contains(new google.maps.LatLng(p.lat, p.lng))
        )
      }
      return typeFiltered // No bounds yet, show all
    }
    
    // DESKTOP: Filter by desktop map bounds
    if (mapBounds) {
      return typeFiltered.filter((p) =>
        typeof p.lat === 'number' && typeof p.lng === 'number' &&
        mapBounds.contains(new google.maps.LatLng(p.lat, p.lng))
      )
    }
    
    // No bounds yet, return all
    return typeFiltered
  }, [propertyTypeFilter, mapBounds, mobileBounds, cacheVersion])

  // Memoize to prevent effects from re-running on equivalent arrays
  const memoizedProperties = useMemo(() => filteredProperties, [
    filteredProperties.length,
    JSON.stringify(filteredProperties.map(p => p.id)),
  ])

  // Debug filtered properties
  useEffect(() => {

  }, [filteredProperties, propertyTypeFilter, selectedCity])

  // Mobile/Desktop map management is now handled in the earlier useEffect

  // Render/update markers when data changes (visibility mode)
  useEffect(() => {
    if (!googleMapRef.current || !memoizedProperties) return

    const list = memoizedProperties

    // Effect runs to update marker visibility and grid from memoized data


    // Initialize marker manager only once
    if (!markerManagerRef.current) {
      // Get available maps (desktop OR mobile)
      const availableMaps = []
      if (typeof window !== 'undefined' && window.innerWidth >= 1024 && googleMapRef.current) {
        availableMaps.push(googleMapRef.current as unknown as google.maps.Map)
      } else if (typeof window !== 'undefined' && window.innerWidth < 1024 && mobileGoogleMapRef.current) {
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
      // CHANGE 4a: Marker update order – update config first with current hover/selection state
      markerManagerRef.current.updateConfig({
        hoveredPropertyId,
        selectedPropertyId
      })
      // CHANGE 4b: Then update marker states with the new config
      markerManagerRef.current.updateMarkerStates()
    }
  }, [hoveredPropertyId, selectedPropertyId])


  // Map structural changes are now handled in the earlier useEffect

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



  // Smart loading state
  const shouldShowLoading = (loading || isInitialLoading) && filteredProperties.length === 0 && !error
  const showEmpty = !shouldShowLoading && !error && filteredProperties.length === 0
  const showError = !shouldShowLoading && (error || localError)
  const hasData = !shouldShowLoading && !error && filteredProperties.length > 0

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
    
    // MOBILE: Fetch new data for the selected city
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      // Mobile fetch will be triggered by useEffect
      return
    }
    
    // DESKTOP: Just pan the map (Airbnb-style) - bounds change will trigger fetch
    // Map will automatically pan via the useEffect that watches selectedCity
  }

  const handlePropertyTypeFilter = (type: PropertyTypeFilter) => {
    setPropertyTypeFilter(type)
    
    // Haptic feedback for filter change
    haptic.light()
    
    // Mobile fetch will be triggered by useEffect
    // Desktop will re-filter from cache immediately (no API call needed)
  }



  

  // Set initial loading to false after first data fetch
  useEffect(() => {
    if (!loading || filteredProperties.length > 0) {
      setIsInitialLoading(false)
    }
  }, [loading, filteredProperties.length])


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

      {/* Airbnb-style layout with exact proportions */}
        <div className={`mx-auto w-full max-w-[1905px] px-3 xs:px-4 sm:px-6 md:px-8 py-4`}>
          {/* Mobile: Map-first with draggable bottom sheet (Airbnb-style) */}
          <div className="xl:hidden fixed inset-0 z-10">
            {/* Full screen map */}
            <div ref={mobileMapRef} className="w-full h-full" />
            
            {/* In-map header: Logo + Search + Filter + Hamburger on one line */}
            <div id="mobile-map-header" className="absolute top-4 left-4 right-4 z-40">
              <div className="flex items-center gap-3">
                {/* Logo: match homepage size (56x56) but keep compact padding */}
                <Link href="/" className="flex-shrink-0">
                  <div className="relative w-14 h-14 flex items-center justify-center rounded-full bg-white/95 backdrop-blur-md border border-white/30 shadow-lg hover:shadow-xl transition-all">
                    <Image src="/images/mr-imot-logo-no-background.png" alt="Mr. Imot Logo" width={56} height={56} className="object-contain" priority />
                  </div>
                </Link>

                {/* Search Field */}
                <button
                  ref={searchButtonRef}
                  onClick={() => {
                    setIsSearchOpen(true)
                  }}
                  className="flex-1 flex items-center gap-3 px-5 py-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-xl transition-all touch-manipulation"
                >
                  <Search className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <span className="text-base text-gray-600 truncate">
                    {lang === 'bg' ? 'Търси София, Пловдив...' : 'Search Sofia, Plovdiv...'}
                  </span>
                </button>
                
                {/* Filter Button (same visual weight as search) */}
                <button
                  onClick={() => setIsFilterModalOpen(true)}
                  className="flex items-center justify-center w-14 h-14 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-xl transition-all flex-shrink-0 touch-manipulation"
                >
                  <SlidersHorizontal className="w-6 h-6 text-gray-700" />
                </button>

                {/* Hamburger - use MobileNav trigger (align right) */}
                <div className="md:hidden flex-shrink-0">
                  <MobileNav />
                </div>
              </div>
            </div>
            
            {/* Expanded Search Overlay */}
            {isSearchOpen && (
              <div className="absolute top-0 left-0 right-0 bottom-0 z-50 bg-white" role="dialog" aria-modal="true">
                <div className="flex flex-col h-full">
                  {/* Header with back button */}
                  <div className="flex items-center gap-3 px-3 py-3 border-b border-gray-200">
                    <button
                      onClick={() => {
                        setIsSearchOpen(false)
                        searchButtonRef.current?.focus()
                      }}
                      className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-full transition-colors"
                      aria-label={lang === 'bg' ? 'Затвори търсенето' : 'Close search'}
                    >
                      <X className="w-5 h-5 text-gray-700" />
                    </button>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {lang === 'bg' ? 'Търси локация' : 'Search location'}
                    </h2>
                  </div>
                  
                  {/* Search content */}
                  <div className="flex-1 overflow-y-auto p-4">
                    <AirbnbSearch
                      defaultExpanded
                      onPlaceSelected={({ lat, lng, zoom }) => {
                        if (mobileGoogleMapRef.current) {
                          mobileGoogleMapRef.current.panTo({ lat, lng })
                          mobileGoogleMapRef.current.setZoom(zoom)
                        }
                        setIsSearchOpen(false)
                        searchButtonRef.current?.focus()
                      }}
                      onFilterClick={() => {
                        setIsSearchOpen(false)
                        setIsFilterModalOpen(true)
                      }}
                      placeholder={lang === 'bg' ? 'Търси София, Пловдив, Варна...' : 'Search Sofia, Plovdiv, Varna...'}
                      locale={lang}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Filter Modal */}
            {isFilterModalOpen && (
              <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
                <div className="w-full bg-white rounded-t-3xl p-6 animate-slide-up">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">
                      {lang === 'bg' ? 'Филтри' : 'Filters'}
                    </h2>
                    <button
                      onClick={() => setIsFilterModalOpen(false)}
                      className="p-3 hover:bg-gray-100 active:bg-gray-200 rounded-full transition-colors touch-manipulation"
                    >
                      <X className="w-7 h-7" />
                    </button>
                  </div>
                  
                  {/* Property Type */}
                  <div className="mb-8">
                    <h3 className="text-base font-bold text-gray-900 mb-4">
                      {dict.listings.filters.propertyTypeLabel}
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => {
                          handlePropertyTypeFilter('all')
                          setIsFilterModalOpen(false)
                        }}
                        className={`py-5 px-4 rounded-2xl text-base font-semibold transition-all border-2 touch-manipulation ${
                          propertyTypeFilter === 'all'
                            ? 'bg-gray-900 text-white border-gray-900 shadow-lg'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:shadow-md active:bg-gray-50'
                        }`}
                      >
                        {dict.listings.filters.all}
                      </button>
                      <button
                        onClick={() => {
                          handlePropertyTypeFilter('apartments')
                          setIsFilterModalOpen(false)
                        }}
                        className={`py-5 px-4 rounded-2xl text-base font-semibold transition-all border-2 flex flex-col items-center gap-2 touch-manipulation ${
                          propertyTypeFilter === 'apartments'
                            ? 'bg-gray-900 text-white border-gray-900 shadow-lg'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:shadow-md active:bg-gray-50'
                        }`}
                      >
                        <Building className="w-6 h-6" />
                        <span className="text-xs">{dict.listings.filters.apartments}</span>
                      </button>
                      <button
                        onClick={() => {
                          handlePropertyTypeFilter('houses')
                          setIsFilterModalOpen(false)
                        }}
                        className={`py-5 px-4 rounded-2xl text-base font-semibold transition-all border-2 flex flex-col items-center gap-2 touch-manipulation ${
                          propertyTypeFilter === 'houses'
                            ? 'bg-gray-900 text-white border-gray-900 shadow-lg'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:shadow-md active:bg-gray-50'
                        }`}
                      >
                        <Home className="w-6 h-6" />
                        <span className="text-xs">{dict.listings.filters.houses}</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Apply Button */}
                  <button
                    onClick={() => setIsFilterModalOpen(false)}
                    className="w-full py-5 bg-gray-900 text-white font-bold text-lg rounded-2xl hover:bg-gray-800 active:bg-gray-700 transition-colors touch-manipulation shadow-lg"
                  >
                    {lang === 'bg' ? 'Приложи филтри' : 'Apply filters'}
                  </button>
                </div>
              </div>
            )}
            
            {/* Touch overlay so map doesn't steal gestures under sheet */}
            <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40" style={{ height: '50vh' }} />

            {/* Draggable bottom sheet with listings */}
            {!isSearchOpen && !isFilterModalOpen && (
            <DraggableSheet 
              snapPoints={[16, 40, headerSnapPct]}
              initialSnap={0}
              onSnapChange={setMobileSheetSnap}
            >
              <div className="px-5 py-4">
                {/* Sheet header */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {filteredProperties.length === 1
                      ? (lang === 'bg' ? '1 имот' : '1 property')
                      : `${filteredProperties.length} ${lang === 'bg' ? 'имота' : 'properties'}`}
                  </h2>
                  <p className="text-base text-gray-600 font-medium">
                    {propertyTypeFilter === 'all' ? dict.listings.allProperties : 
                     propertyTypeFilter === 'apartments' ? dict.listings.filters.apartments : dict.listings.filters.houses}
                  </p>
                </div>
                
                {/* Listings grid */}
                {shouldShowLoading ? (
                  <ListingCardSkeletonGrid count={6} />
                ) : showEmpty ? (
                  <div className="py-16 text-center">
                    <Building className="w-20 h-20 mx-auto text-gray-300 mb-6" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                      {dict.listings.noPropertiesAvailable}
                    </h3>
                    <p className="text-gray-600 text-base">
                      {dict.listings.tryDifferentLocation}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 pb-24">
                    {filteredProperties.map((property, index) => (
                      <ListingCard
                        key={property.id}
                        listing={propertyToListing(property)}
                        isActive={selectedPropertyId === property.id}
                        onCardClick={() => {
                          setSelectedPropertyId(property.id)
                          setMobileSheetSnap(2) // Expand sheet
                        }}
                        onCardHover={() => {}}
                        priority={index < 4}
                        priceTranslations={dict.price}
                      />
                    ))}
                  </div>
                )}
              </div>
            </DraggableSheet>
            )}
            
            {/* Selected property card (when marker tapped) */}
            {selectedProperty && (
              <div className="absolute bottom-0 left-0 right-0 h-[50vh] z-50">
                <PropertyMapCard
                  property={transformToPropertyMapData(selectedProperty)}
                  onClose={() => setSelectedPropertyId(null)}
                  position={{ bottom: 0, left: 0, right: 0 }}
                  floating={true}
                  forceMobile={true}
                  priceTranslations={dict.price}
                />
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
                        {dict.listings.filters.chooseCity}
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
                          {dict.listings.cities.sofia}
                        </ToggleGroupItem>
                        <ToggleGroupItem 
                          value="Plovdiv" 
                          className="h-8 laptop:h-8 xl:h-10 px-4 laptop:px-3 xl:px-4 rounded-full border-2 font-medium text-sm laptop:text-sm xl:text-sm shadow-sm hover:shadow-md transition-all duration-300 ease-out bg-transparent border-gray-700 text-gray-900 data-[state=on]:bg-gray-900 data-[state=on]:text-white data-[state=on]:border-gray-900"
                        >
                          {dict.listings.cities.plovdiv}
                        </ToggleGroupItem>
                        <ToggleGroupItem 
                          value="Varna" 
                          className="h-8 laptop:h-8 xl:h-10 px-4 laptop:px-3 xl:px-4 rounded-full border-2 font-medium text-sm laptop:text-sm xl:text-sm shadow-sm hover:shadow-md transition-all duration-300 ease-out bg-transparent border-gray-700 text-gray-900 data-[state=on]:bg-gray-900 data-[state=on]:text-white data-[state=on]:border-gray-900"
                        >
                          {dict.listings.cities.varna}
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>

                    {/* Divider */}
                    <Separator orientation="vertical" className="hidden xl:block h-12" style={{backgroundColor: 'var(--brand-gray-200)'}} />

                    {/* Property Type Filter */}
                    <div className="flex flex-col items-center space-y-2 laptop:space-y-2 xl:space-y-3 w-full xl:w-auto">
                      <h3 className="text-base font-semibold flex items-center gap-2" style={{color: 'var(--brand-text-primary)'}}>
                        <Building className="w-4 h-4" style={{color: 'var(--brand-btn-primary-bg)'}} />
                        {dict.listings.filters.propertyTypeLabel}
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
                          {dict.listings.filters.all}
                        </ToggleGroupItem>
                        <ToggleGroupItem 
                          value="apartments" 
                          className="h-8 laptop:h-8 xl:h-10 px-3 laptop:px-2 xl:px-3 rounded-full border-2 font-medium text-sm laptop:text-sm xl:text-sm shadow-sm hover:shadow-md transition-all duration-300 ease-out flex items-center gap-1 bg-transparent border-gray-700 text-gray-900 data-[state=on]:bg-gray-900 data-[state=on]:text-white data-[state=on]:border-gray-900"
                        >
                          <Building className="w-3 h-3" /> {dict.listings.filters.apartments}
                        </ToggleGroupItem>
                        <ToggleGroupItem 
                          value="houses" 
                          className="h-8 laptop:h-8 xl:h-10 px-3 laptop:px-2 xl:px-3 rounded-full border-2 font-medium text-sm laptop:text-sm xl:text-sm shadow-sm hover:shadow-md transition-all duration-300 ease-out flex items-center gap-1 bg-transparent border-gray-700 text-gray-900 data-[state=on]:bg-gray-900 data-[state=on]:text-white data-[state=on]:border-gray-900"
                        >
                          <Home className="w-3 h-3" /> {dict.listings.filters.houses}
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
                      {dict.listings.loadingProperties}
                    </p>
                    <p style={{color: 'var(--brand-text-muted)'}}>
                      {dict.listings.findingProperties}
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
                    {propertyTypeFilter === 'all' ? dict.listings.noPropertiesAvailable : 
                     propertyTypeFilter === 'apartments' ? dict.listings.noApartmentsFound : dict.listings.noHousesFound}
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {propertyTypeFilter === 'all' 
                      ? dict.listings.noPropertiesInCity.replace('{{city}}', dict.listings.cities[selectedCity.toLowerCase()])
                      : propertyTypeFilter === 'apartments'
                      ? dict.listings.noApartmentsInCity.replace('{{city}}', dict.listings.cities[selectedCity.toLowerCase()])
                      : dict.listings.noHousesInCity.replace('{{city}}', dict.listings.cities[selectedCity.toLowerCase()])
                    }
                  </p>
                  <p className="text-gray-500 text-sm max-w-md mx-auto">
                    {dict.listings.tryDifferentLocation}
                  </p>
                </div>
              ) : hasData ? (
                <div ref={listContainerRef} className="grid grid-cols-3 gap-6 pt-3">
                  {filteredProperties.map((property, index) => (
                    <div 
                      key={property.id} 
                      data-prop-id={property.id} 
                      className="w-full"
                    >
                      <ListingCard
                        listing={propertyToListing(property)}
                        isActive={selectedPropertyId === property.id}
                        onCardClick={() => handleCardClick(property)}
                        onCardHover={(id) => setDebouncedHover(id, 100)}
                        priority={index < 6} // Priority for first 6 cards (2 rows on desktop)
                        priceTranslations={dict.price}
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
                aria-label={isMapExpanded ? dict.listings.collapseMap : dict.listings.expandMap}
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
        
        {/* Airbnb-style Property Map Card - Desktop Only */}
        {selectedProperty && typeof window !== 'undefined' && window.innerWidth >= 1024 && (
          <PropertyMapCard
            property={transformToPropertyMapData(selectedProperty)}
            onClose={() => setSelectedPropertyId(null)}
            position={cardPosition}
            priceTranslations={dict.price}
          />
        )}
      </div>
    </div>
  )
}
