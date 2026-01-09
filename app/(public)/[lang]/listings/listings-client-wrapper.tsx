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
  
  // Fetch controller factory
  const getOrCreateFetchController = useCallback(() => {
    if (!fetchControllerRef.current) {
      fetchControllerRef.current = new MapFetchController({
        debounceMs: 300,  // Reduced from 600 for faster response
        throttleMs: 800,  // Reduced from 1500 for faster updates
        onDataUpdate: (properties) => {
          const prevSize = propertyCacheRef.current.size
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
  
  // Memoized filtered properties
  const filteredProperties = useMemo(() => {
    const all = Array.from(propertyCacheRef.current.values())
    
    // Filter by property type
    const typeFiltered = all.filter((p) => {
      if (propertyTypeFilter === 'all') return true
      if (propertyTypeFilter === 'apartments') return p.type === 'Apartment Complex'
      if (propertyTypeFilter === 'houses') return p.type === 'Residential Houses'
      return true
    })
    
    // Determine which bounds to use (SSR-safe: isMobile starts as false, updates after mount)
    const activeBounds = isMobile ? mobileBounds : mapBounds
    
    if (activeBounds) {
      return typeFiltered.filter((p) =>
        typeof p.lat === 'number' && typeof p.lng === 'number' &&
        isPointInBounds(p.lat, p.lng, activeBounds)
      )
    }
    
    return typeFiltered
  }, [propertyTypeFilter, mapBounds, mobileBounds, cacheVersion, isPointInBounds, isMobile])
  
  // City change handler
  const handleCityChange = useCallback((city: CityType) => {
    if (city === selectedCity) return
    setSelectedCity(city)
  }, [selectedCity])
  
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

