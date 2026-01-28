"use client"

/**
 * Thin Client Wrapper - Only essential states that MUST be client-side
 * 
 * This component manages:
 * - Map state (refs, bounds)
 * - Selection state (hovered, selected property)
 * - Filter state (city, property type)
 * - Fetch controller
 * 
 * NO UI/JSX except passing props to ListingsClientContent
 */

import { useState, useRef, useCallback, useMemo, useEffect } from "react"
import { PropertyData } from "@/lib/marker-manager"
import { MapFetchController, PropertyTypeFilter as MapPropertyTypeFilter } from "@/lib/map-fetch-controller"
import { MarkerManager } from "@/lib/marker-manager"
import { ListingsClientContent } from "./listings-client-content"
import { CityType, PropertyTypeFilter, CITY_BOUNDS } from "./listings-layout-server"
import { useIsMobile } from "@/hooks/use-is-mobile"
import { useRouter } from "next/navigation"
import { cityListingsHref } from "@/lib/routes"
import { getCityKeyFromCityType } from "@/lib/city-registry"

export interface ListingsClientWrapperProps {
  dict: any
  lang: 'en' | 'bg' | 'ru' | 'gr'
  initialCity?: CityType
  initialType?: PropertyTypeFilter
  initialProperties?: PropertyData[]
}

export function ListingsClientWrapper({
  dict,
  lang,
  initialCity = 'Sofia',
  initialType = 'all',
  initialProperties = []
}: ListingsClientWrapperProps) {
  // ─────────────────────────────────────────────────────────────────────────
  // ESSENTIAL STATE - Must be client-side
  // ─────────────────────────────────────────────────────────────────────────
  
  // Filter state
  const [selectedCity, setSelectedCity] = useState<CityType>(initialCity)
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<PropertyTypeFilter>(initialType)
  
  // Map bounds state (needed for filtering)
  const [mapBounds, setMapBounds] = useState<google.maps.LatLngBounds | null>(null)
  const [mobileBounds, setMobileBounds] = useState<google.maps.LatLngBounds | null>(null)
  
  // Selection state
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null)
  
  // Loading/error state
  const [isLoading, setIsLoading] = useState(initialProperties.length === 0)
  const [error, setError] = useState<string | null>(null)
  
  // Cache version to trigger re-renders on data update
  const [cacheVersion, setCacheVersion] = useState(0)
  
  // ─────────────────────────────────────────────────────────────────────────
  // REFS - No re-renders needed
  // ─────────────────────────────────────────────────────────────────────────
  
  // Map refs
  const googleMapRef = useRef<google.maps.Map | null>(null)
  const mobileGoogleMapRef = useRef<google.maps.Map | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const mobileMapRef = useRef<HTMLDivElement>(null)
  
  // Manager refs
  const markerManagerRef = useRef<MarkerManager | null>(null)
  const fetchControllerRef = useRef<MapFetchController | null>(null)
  
  // Property cache (using Map for O(1) lookups)
  // Initialize with SSR data immediately (computed once on first render)
  const [initialCache] = useState(() => {
    const cache = new Map<string, PropertyData>()
    initialProperties.forEach(p => cache.set(String(p.id), p))
    return cache
  })
  const propertyCacheRef = useRef<Map<string, PropertyData>>(initialCache)
  
  // ─────────────────────────────────────────────────────────────────────────
  // MEMOIZED CALLBACKS - Stable references
  // ─────────────────────────────────────────────────────────────────────────
  
  // Track latest requestId to prevent stale overwrites
  const latestRequestIdRef = useRef<number>(0)
  
  // Fetch controller factory
  const getOrCreateFetchController = useCallback(() => {
    if (!fetchControllerRef.current) {
      fetchControllerRef.current = new MapFetchController({
        debounceMs: 300,  // Reduced from 600 for faster response
        throttleMs: 800,  // Reduced from 1500 for faster updates
        onDataUpdate: (properties, requestId) => {
          // Guard: Only update if this requestId is >= latest (prevents stale overwrites)
          if (requestId !== undefined && requestId < latestRequestIdRef.current) {
            if (process.env.NODE_ENV === 'development') {
              console.log('[MapFetchController] Ignoring stale request:', { requestId, latest: latestRequestIdRef.current })
            }
            return
          }
          if (requestId !== undefined) {
            latestRequestIdRef.current = requestId
          }
          
          // Replace propertyCacheRef completely (no accumulation - represents current viewport)
          const cache = new Map<string, PropertyData>()
          properties.forEach((p) => cache.set(String(p.id), p))
          propertyCacheRef.current = cache
          setCacheVersion((v) => v + 1)
          setIsLoading(false)
        },
        onLoadingChange: (loading) => {
          if (loading) setIsLoading(true)
        },
        onError: (err) => {
          console.error('[MapFetchController] Error:', err)
          setError(err.message)
        },
      })
    }
    return fetchControllerRef.current
  }, [])
  
  // Filter properties by type and bounds
  const isPointInBounds = useCallback((lat: number, lng: number, bounds: google.maps.LatLngBounds | null): boolean => {
    if (!bounds) return true
    try {
      const sw = bounds.getSouthWest()
      const ne = bounds.getNorthEast()
      return lat >= sw.lat() && lat <= ne.lat() && lng >= sw.lng() && lng <= ne.lng()
    } catch {
      return true
    }
  }, [])
  
  // SSR-safe mobile detection hook
  const isMobile = useIsMobile()
  
  // Memoized filtered properties - single source of truth for both list and markers
  // NOTE: propertyCacheRef is replaced per fetch (represents current viewport), so no bounds filtering needed
  // This ensures list and markers always show the same properties
  const filteredProperties = useMemo(() => {
    const all = Array.from(propertyCacheRef.current.values())
    
    // Filter by property type only (no bounds filtering - propertyCacheRef is viewport-specific)
    return all.filter((p) => {
      if (propertyTypeFilter === 'all') return true
      if (propertyTypeFilter === 'apartments') return p.type === 'Apartment Complex'
      if (propertyTypeFilter === 'houses') return p.type === 'Residential Houses'
      return true
    })
  }, [propertyTypeFilter, cacheVersion])
  
  // City change handler - navigates to hub route using Next.js router
  const router = useRouter()
  
  const handleCityChange = useCallback((city: CityType) => {
    if (city === selectedCity) return
    setSelectedCity(city)
    
    const cityKey = getCityKeyFromCityType(city)
    if (!cityKey) return
    
    // Use Next.js router for navigation to hub route (not window.location.href)
    const hubUrl = cityListingsHref(lang, cityKey)
    router.push(hubUrl) // Full navigation for SEO
  }, [selectedCity, lang, router])
  
  // Property type filter handler
  const handlePropertyTypeChange = useCallback((type: PropertyTypeFilter) => {
    setPropertyTypeFilter(type)
  }, [])
  
  // Selection handlers
  const handlePropertySelect = useCallback((id: string | null) => {
    setSelectedPropertyId(id)
  }, [])
  
  const handlePropertyHover = useCallback((id: string | null) => {
    setHoveredPropertyId(id)
  }, [])
  
  // Bounds update handlers
  const handleMapBoundsChange = useCallback((bounds: google.maps.LatLngBounds) => {
    setMapBounds(bounds)
  }, [])
  
  const handleMobileBoundsChange = useCallback((bounds: google.maps.LatLngBounds) => {
    setMobileBounds(bounds)
  }, [])
  
  // Error clear handler
  const handleErrorClear = useCallback(() => {
    setError(null)
  }, [])
  
  // ─────────────────────────────────────────────────────────────────────────
  // CLEANUP
  // ─────────────────────────────────────────────────────────────────────────
  
  useEffect(() => {
    return () => {
      markerManagerRef.current?.cleanup()
      fetchControllerRef.current?.cancel()
    }
  }, [])
  
  // ─────────────────────────────────────────────────────────────────────────
  // RENDER - Minimal JSX, delegates to ListingsClientContent
  // ─────────────────────────────────────────────────────────────────────────
  
  // Hide SSR grid after client hydration
  useEffect(() => {
    const ssrGrid = document.querySelector('[data-ssr-listings]')
    if (ssrGrid) {
      ssrGrid.classList.add('hidden')
    }
  }, [])
  
  return (
    <ListingsClientContent
      // Dictionary & language
      dict={dict}
      lang={lang}
      
      // Filter state
      selectedCity={selectedCity}
      propertyTypeFilter={propertyTypeFilter}
      onCityChange={handleCityChange}
      onPropertyTypeChange={handlePropertyTypeChange}
      
      // Selection state
      selectedPropertyId={selectedPropertyId}
      hoveredPropertyId={hoveredPropertyId}
      onPropertySelect={handlePropertySelect}
      onPropertyHover={handlePropertyHover}
      
      // Data
      filteredProperties={filteredProperties}
      isLoading={isLoading}
      error={error}
      onErrorClear={handleErrorClear}
      
      // Map refs
      mapRef={mapRef}
      mobileMapRef={mobileMapRef}
      googleMapRef={googleMapRef}
      mobileGoogleMapRef={mobileGoogleMapRef}
      markerManagerRef={markerManagerRef}
      
      // Fetch controller
      getOrCreateFetchController={getOrCreateFetchController}
      
      // Bounds handlers
      onMapBoundsChange={handleMapBoundsChange}
      onMobileBoundsChange={handleMobileBoundsChange}
      
      // Property cache ref for marker manager
      propertyCacheRef={propertyCacheRef}
    />
  )
}

