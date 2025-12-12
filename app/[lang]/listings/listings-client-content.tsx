"use client"

/**
 * Listings Client Content - Interactive map and listings UI
 * 
 * Receives all state from ListingsClientWrapper via props.
 * Handles:
 * - Google Maps initialization and interaction
 * - Mobile and desktop layouts
 * - Property cards and markers
 * - Search and filter UI
 */

import { useEffect, useRef, useState, useCallback, memo, RefObject, MutableRefObject } from "react"
import Link from "next/link"
import Image from "next/image"

import { ensureGoogleMaps } from "@/lib/google-maps"
import { MarkerManager, PropertyData } from "@/lib/marker-manager"
import { ListingCard } from "@/components/ListingCard"
import { propertyToListing } from "@/lib/listing-adapter"
import { MapFetchController, PropertyTypeFilter as MapPropertyTypeFilter } from "@/lib/map-fetch-controller"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { MapPin, Building, Home, Loader2, Maximize2, X, Search, SlidersHorizontal } from "lucide-react"
import { PropertyMapCard } from "@/components/property-map-card"
import { ListingCardSkeletonGrid } from "@/components/ListingCardSkeleton"
import { DraggableSheet } from "@/components/draggable-sheet"
import { AirbnbSearch } from "@/components/airbnb-search"
import { DesktopSearch } from "@/components/desktop-search"
import { MobileNav } from "@/components/mobile-nav"
import { haptic } from "@/lib/haptic-feedback"
import { MapDebugPanel } from "@/components/map-debug-panel"

import { CityType, PropertyTypeFilter, CITY_COORDINATES } from "./listings-layout-server"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ListingsClientContentProps {
  dict: any
  lang: 'en' | 'bg' | 'ru'
  
  // Filter state
  selectedCity: CityType
  propertyTypeFilter: PropertyTypeFilter
  onCityChange: (city: CityType) => void
  onPropertyTypeChange: (type: PropertyTypeFilter) => void
  
  // Selection state
  selectedPropertyId: string | null
  hoveredPropertyId: string | null
  onPropertySelect: (id: string | null) => void
  onPropertyHover: (id: string | null) => void
  
  // Data
  filteredProperties: PropertyData[]
  isLoading: boolean
  error: string | null
  onErrorClear: () => void
  
  // Map refs
  mapRef: RefObject<HTMLDivElement | null>
  mobileMapRef: RefObject<HTMLDivElement | null>
  googleMapRef: MutableRefObject<google.maps.Map | null>
  mobileGoogleMapRef: MutableRefObject<google.maps.Map | null>
  markerManagerRef: MutableRefObject<MarkerManager | null>
  
  // Fetch controller
  getOrCreateFetchController: () => MapFetchController
  
  // Bounds handlers
  onMapBoundsChange: (bounds: google.maps.LatLngBounds) => void
  onMobileBoundsChange: (bounds: google.maps.LatLngBounds) => void
  
  // Property cache ref
  propertyCacheRef: MutableRefObject<Map<string, PropertyData>>
}

// ─────────────────────────────────────────────────────────────────────────────
// Memoized ListingCard to prevent unnecessary re-renders
// ─────────────────────────────────────────────────────────────────────────────

const MemoizedListingCard = memo(ListingCard, (prev, next) => {
  return (
    prev.listing.id === next.listing.id &&
    prev.isActive === next.isActive &&
    prev.priority === next.priority
  )
})

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ListingsClientContent({
  dict,
  lang,
  selectedCity,
  propertyTypeFilter,
  onCityChange,
  onPropertyTypeChange,
  selectedPropertyId,
  hoveredPropertyId,
  onPropertySelect,
  onPropertyHover,
  filteredProperties,
  isLoading,
  error,
  onErrorClear,
  mapRef,
  mobileMapRef,
  googleMapRef,
  mobileGoogleMapRef,
  markerManagerRef,
  getOrCreateFetchController,
  onMapBoundsChange,
  onMobileBoundsChange,
  propertyCacheRef,
}: ListingsClientContentProps) {
  // ─────────────────────────────────────────────────────────────────────────
  // LOCAL UI STATE (not lifted to wrapper)
  // ─────────────────────────────────────────────────────────────────────────
  
  const [isMapExpanded, setIsMapExpanded] = useState(false)
  const [isMapLoading, setIsMapLoading] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [mobileSheetSnap, setMobileSheetSnap] = useState(0)
  const [desktopMapReady, setDesktopMapReady] = useState(false)
  const [mobileMapReady, setMobileMapReady] = useState(false)
  const [headerSnapPct, setHeaderSnapPct] = useState(90)
  const [cardPosition, setCardPosition] = useState<{ top?: number; left?: number }>({})
  
  // Refs for UI elements
  const searchButtonRef = useRef<HTMLButtonElement>(null)
  const listContainerRef = useRef<HTMLDivElement>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Refs to track current filter values for map idle callbacks (avoids stale closures)
  const propertyTypeFilterRef = useRef(propertyTypeFilter)
  propertyTypeFilterRef.current = propertyTypeFilter
  
  // ─────────────────────────────────────────────────────────────────────────
  // DERIVED STATE
  // ─────────────────────────────────────────────────────────────────────────
  
  const shouldShowLoading = isLoading && filteredProperties.length === 0
  const showEmpty = !shouldShowLoading && !error && filteredProperties.length === 0
  const showError = !shouldShowLoading && error
  const hasData = !shouldShowLoading && !error && filteredProperties.length > 0
  
  const selectedProperty = selectedPropertyId
    ? filteredProperties.find(p => p.id === selectedPropertyId)
    : null
  
  // ─────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────────
  
  const setDebouncedHover = useCallback((propertyId: string | null, delay = 100) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    hoverTimeoutRef.current = setTimeout(() => {
      onPropertyHover(propertyId)
    }, delay)
  }, [onPropertyHover])
  
  const handleCityChange = useCallback((city: string) => {
    if (!city || city === selectedCity) return
    onCityChange(city as CityType)
    haptic.light()
  }, [selectedCity, onCityChange])
  
  const handlePropertyTypeFilter = useCallback((type: PropertyTypeFilter) => {
    onPropertyTypeChange(type)
    haptic.light()
  }, [onPropertyTypeChange])
  
  // Transform PropertyData to PropertyMapCard format
  const transformToPropertyMapData = useCallback((property: PropertyData) => {
    const image = property.image || (Array.isArray(property.images) ? property.images[0] : undefined)
    return {
      id: property.id,
      title: property.title,
      location: property.location,
      image,
      images: (property as any).images || (image ? [image] : undefined),
      priceLabel: property.shortPrice || undefined,
      type: (property.type?.toLowerCase().includes('house') ? 'house' : 'apartment') as 'house' | 'apartment',
      developer: (property as any).developer ? {
        company_name: (property as any).developer.company_name,
        phone: (property as any).developer.phone,
        website: (property as any).developer.website,
      } : undefined,
    }
  }, [])
  
  // Calculate card position for desktop
  const calculateCardPosition = useCallback((property: PropertyData) => {
    if (!mapRef.current || !googleMapRef.current) return {}
    
    const mapBounds = mapRef.current.getBoundingClientRect()
    const cardWidth = 327
    const cardHeight = 321
    const padding = 20
    
    const projection = googleMapRef.current.getProjection()
    if (!projection) {
      return { top: mapBounds.top + mapBounds.height * 0.3, left: mapBounds.left + mapBounds.width * 0.6 - cardWidth / 2 }
    }
    
    const markerLatLng = new google.maps.LatLng(property.lat, property.lng)
    const markerPoint = projection.fromLatLngToPoint(markerLatLng)
    const bounds = googleMapRef.current.getBounds()
    
    if (!markerPoint || !bounds) {
      return { top: mapBounds.top + 100, left: mapBounds.left + 100 }
    }
    
    const sw = projection.fromLatLngToPoint(bounds.getSouthWest())
    const ne = projection.fromLatLngToPoint(bounds.getNorthEast())
    
    if (!sw || !ne) return { top: mapBounds.top + 100, left: mapBounds.left + 100 }
    
    const markerX = (markerPoint.x - sw.x) / (ne.x - sw.x)
    const markerY = (markerPoint.y - ne.y) / (sw.y - ne.y)
    const markerScreenX = mapBounds.left + markerX * mapBounds.width
    const markerScreenY = mapBounds.top + markerY * mapBounds.height
    
    let left = markerScreenX < mapBounds.left + mapBounds.width / 2
      ? markerScreenX + 60
      : markerScreenX - cardWidth - 60
    
    let top = markerScreenY > mapBounds.top + cardHeight + 60
      ? markerScreenY - cardHeight - 40
      : markerScreenY + 60
    
    left = Math.max(mapBounds.left + padding, Math.min(left, mapBounds.left + mapBounds.width - cardWidth - padding))
    top = Math.max(mapBounds.top + padding, Math.min(top, mapBounds.top + mapBounds.height - cardHeight - padding))
    
    return { top, left }
  }, [mapRef, googleMapRef])
  
  // ─────────────────────────────────────────────────────────────────────────
  // EFFECTS - Map initialization
  // ─────────────────────────────────────────────────────────────────────────
  
  // Header snap calculation for mobile
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
    return () => window.removeEventListener('resize', computeHeaderSnap)
  }, [])
  
  // Desktop map initialization
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current || googleMapRef.current) return
      
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
          mapId: 'e1ea25ce333a0b0deb34ff54',
          draggableCursor: 'grab',
          draggingCursor: 'grabbing',
        })
        
        googleMapRef.current = map
        setDesktopMapReady(true)
        
        // Immediate initial fetch when map is ready (no delay)
        google.maps.event.addListenerOnce(map, 'idle', () => {
          const bounds = map.getBounds()
          if (bounds && typeof window !== 'undefined' && window.innerWidth >= 1024) {
            const sw = bounds.getSouthWest()
            const ne = bounds.getNorthEast()
            getOrCreateFetchController().schedule(
              sw.lat(), sw.lng(), ne.lat(), ne.lng(),
              propertyTypeFilterRef.current as MapPropertyTypeFilter,
              { immediate: true }
            )
          }
        })
        
        // Bounds change listener - use ref to get current filter value
        // Skip fetch if we already have properties in cache for this area
        google.maps.event.addListener(map, "idle", () => {
          const bounds = map.getBounds()
          if (bounds) {
            onMapBoundsChange(bounds)
            if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
              const sw = bounds.getSouthWest()
              const ne = bounds.getNorthEast()
              // Only fetch if we don't have enough cached data
              // This prevents redundant fetches when panning within cached area
              const cachedCount = propertyCacheRef.current.size
              if (cachedCount === 0) {
                // No data at all - fetch immediately
                getOrCreateFetchController().schedule(
                  sw.lat(), sw.lng(), ne.lat(), ne.lng(),
                  propertyTypeFilterRef.current as MapPropertyTypeFilter,
                  { immediate: true }
                )
              } else {
                // Have some data - use debounced fetch for updates
                getOrCreateFetchController().schedule(
                  sw.lat(), sw.lng(), ne.lat(), ne.lng(),
                  propertyTypeFilterRef.current as MapPropertyTypeFilter
                )
              }
            }
          }
        })
        
        // Click to close card
        map.addListener('click', () => {
          if (selectedPropertyId) onPropertySelect(null)
        })
        
      } catch (e) {
        console.error("Error initializing Google Maps:", e)
      }
    }
    
    initMap()
  }, []) // Only run once on mount
  
  // Mobile map initialization
  useEffect(() => {
    const initMobileMap = async () => {
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
          zoomControl: false,
          scrollwheel: true,
          gestureHandling: 'greedy',
          mapId: 'e1ea25ce333a0b0deb34ff54',
          draggableCursor: 'grab',
          draggingCursor: 'grabbing',
        })
        
        mobileGoogleMapRef.current = mobileMap
        setMobileMapReady(true)
        
        // Bounds listener - use ref to get current filter value
        mobileMap.addListener('idle', () => {
          const bounds = mobileMap.getBounds()
          if (bounds) {
            onMobileBoundsChange(bounds)
            const sw = bounds.getSouthWest()
            const ne = bounds.getNorthEast()
            const cachedCount = propertyCacheRef.current.size
            if (cachedCount === 0) {
              getOrCreateFetchController().schedule(
                sw.lat(), sw.lng(), ne.lat(), ne.lng(),
                propertyTypeFilterRef.current as MapPropertyTypeFilter,
                { immediate: true }
              )
            } else {
              getOrCreateFetchController().schedule(
                sw.lat(), sw.lng(), ne.lat(), ne.lng(),
                propertyTypeFilterRef.current as MapPropertyTypeFilter
              )
            }
          }
        })
        
      } catch (e) {
        console.error("Error initializing mobile map:", e)
      }
    }
    
    initMobileMap()
  }, [])
  
  // Track previous properties length to detect changes
  const prevPropertiesLengthRef = useRef(0)
  const prevPropertyIdsRef = useRef<Set<string>>(new Set())
  
  // Update markers when properties change
  useEffect(() => {
    const hasDesktopMap = typeof window !== 'undefined' && window.innerWidth >= 1024 && googleMapRef.current
    const hasMobileMap = typeof window !== 'undefined' && window.innerWidth < 1024 && mobileGoogleMapRef.current
    
    if (!hasDesktopMap && !hasMobileMap) return
    
    const availableMaps: google.maps.Map[] = []
    if (hasDesktopMap) availableMaps.push(googleMapRef.current!)
    if (hasMobileMap) availableMaps.push(mobileGoogleMapRef.current!)
    
    // Detect if properties have actually changed (not just selection/hover)
    const currentPropertyIds = new Set(filteredProperties.map(p => p.id))
    const propertiesChanged = 
      filteredProperties.length !== prevPropertiesLengthRef.current ||
      [...currentPropertyIds].some(id => !prevPropertyIdsRef.current.has(id)) ||
      [...prevPropertyIdsRef.current].some(id => !currentPropertyIds.has(id))
    
    prevPropertiesLengthRef.current = filteredProperties.length
    prevPropertyIdsRef.current = currentPropertyIds
    
    // Always update or create marker manager, even with empty properties
    if (!markerManagerRef.current) {
      markerManagerRef.current = new MarkerManager({
        maps: availableMaps,
        properties: filteredProperties,
        onPropertySelect: (id) => {
          onPropertySelect(id)
          if (id) {
            const property = filteredProperties.find(p => p.id === id)
            if (property) setCardPosition(calculateCardPosition(property))
          }
        },
        onPropertyHover: (id) => setDebouncedHover(id, 50),
        onAriaAnnouncement: () => {},
        selectedPropertyId,
        hoveredPropertyId,
      })
      // First render
      markerManagerRef.current.renderMarkers(true)
    } else {
      // Update config with new state
      markerManagerRef.current.updateConfig({
        maps: availableMaps,
        properties: filteredProperties,
        selectedPropertyId,
        hoveredPropertyId,
      })
      
      if (propertiesChanged) {
        // Use incremental update - shows/hides markers without clearing all
        markerManagerRef.current.updateProperties(filteredProperties)
      } else {
        // Just update hover/selection visual states
        markerManagerRef.current.updateMarkerStates()
      }
    }
  }, [filteredProperties, desktopMapReady, mobileMapReady, selectedPropertyId, hoveredPropertyId])
  
  // Pan map when city changes and trigger immediate fetch
  useEffect(() => {
    const coords = CITY_COORDINATES[selectedCity]
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024
    
    if (googleMapRef.current) {
      googleMapRef.current.panTo({ lat: coords.lat, lng: coords.lng })
      googleMapRef.current.setZoom(coords.zoom)
    }
    if (mobileGoogleMapRef.current) {
      mobileGoogleMapRef.current.panTo({ lat: coords.lat, lng: coords.lng })
      mobileGoogleMapRef.current.setZoom(coords.zoom)
    }
    
    // Trigger immediate fetch for the new city bounds
    // The idle event may not fire fast enough on city switch
    const cityBoundsMultiplier = 0.15 // ~15km radius approximation
    const sw_lat = coords.lat - cityBoundsMultiplier
    const sw_lng = coords.lng - cityBoundsMultiplier
    const ne_lat = coords.lat + cityBoundsMultiplier
    const ne_lng = coords.lng + cityBoundsMultiplier
    
    getOrCreateFetchController().schedule(
      sw_lat, sw_lng, ne_lat, ne_lng,
      propertyTypeFilterRef.current as MapPropertyTypeFilter,
      { immediate: true }
    )
  }, [selectedCity, getOrCreateFetchController])
  
  // Re-fetch when property type filter changes
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024
    const map = isMobile ? mobileGoogleMapRef.current : googleMapRef.current
    
    if (!map) return
    
    const bounds = map.getBounds()
    if (bounds) {
      const sw = bounds.getSouthWest()
      const ne = bounds.getNorthEast()
      getOrCreateFetchController().schedule(
        sw.lat(), sw.lng(), ne.lat(), ne.lng(),
        propertyTypeFilter as MapPropertyTypeFilter,
        { immediate: true }
      )
    }
  }, [propertyTypeFilter, getOrCreateFetchController])
  
  // Escape key to close expanded map
  useEffect(() => {
    if (!isMapExpanded) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMapExpanded(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMapExpanded])
  
  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  
  return (
    <>
      {/* Debug panel */}
      <MapDebugPanel fetchController={getOrCreateFetchController()} show={false} />
      
      {/* Mobile Layout */}
      <div className="xl:hidden fixed inset-0 z-10">
        {/* Full screen map */}
        <div ref={mobileMapRef} className="w-full h-full" />
        
        {/* Mobile header */}
        <div id="mobile-map-header" className="absolute top-4 left-4 right-4 z-40">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex-shrink-0">
              <div className="relative w-14 h-14 flex items-center justify-center rounded-full bg-white/95 backdrop-blur-md border border-white/30 shadow-lg">
                <Image src="/images/mr-imot-logo-no-background.png" alt="Logo" width={56} height={56} className="object-contain" priority />
              </div>
            </Link>
            
            <button
              ref={searchButtonRef}
              onClick={() => setIsSearchOpen(true)}
              className="flex-1 flex items-center gap-3 px-5 py-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg"
            >
              <Search className="w-5 h-5 text-gray-500" />
              <span className="text-base text-gray-600 truncate">
                {lang === 'bg' ? 'Търси София, Пловдив...' : 'Search Sofia, Plovdiv...'}
              </span>
            </button>
            
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="w-14 h-14 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg flex items-center justify-center"
            >
              <SlidersHorizontal className="w-6 h-6 text-gray-700" />
            </button>
            
            <div className="md:hidden flex-shrink-0">
              <MobileNav />
            </div>
          </div>
        </div>
        
        {/* Search overlay */}
        {isSearchOpen && (
          <div className="absolute inset-0 z-50 bg-white">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 px-3 py-3 border-b">
                <button onClick={() => setIsSearchOpen(false)} className="w-10 h-10 hover:bg-gray-100 rounded-full flex items-center justify-center">
                  <X className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold">{lang === 'bg' ? 'Търси локация' : 'Search location'}</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <AirbnbSearch
                  defaultExpanded
                  onPlaceSelected={({ lat, lng, zoom, name }) => {
                    const normalized = name.toLowerCase()
                    if (normalized.includes('sofia') || normalized.includes('софия')) handleCityChange('Sofia')
                    else if (normalized.includes('plovdiv') || normalized.includes('пловдив')) handleCityChange('Plovdiv')
                    else if (normalized.includes('varna') || normalized.includes('варна')) handleCityChange('Varna')
                    
                    if (mobileGoogleMapRef.current) {
                      mobileGoogleMapRef.current.panTo({ lat, lng })
                      mobileGoogleMapRef.current.setZoom(zoom)
                    }
                    setIsSearchOpen(false)
                  }}
                  onFilterClick={() => { setIsSearchOpen(false); setIsFilterModalOpen(true) }}
                  placeholder={lang === 'bg' ? 'Търси София, Пловдив, Варна...' : 'Search Sofia, Plovdiv, Varna...'}
                  locale={lang === 'bg' ? 'bg' : 'en'}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Filter modal */}
        {isFilterModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
            <div className="w-full bg-white rounded-t-3xl p-6 animate-slide-up">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">{lang === 'bg' ? 'Филтри' : 'Filters'}</h2>
                <button onClick={() => setIsFilterModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-full">
                  <X className="w-7 h-7" />
                </button>
              </div>
              
              <div className="mb-8">
                <h3 className="text-base font-bold mb-4">{dict.listings.filters.propertyTypeLabel}</h3>
                <div className="grid grid-cols-3 gap-3">
                  {(['all', 'apartments', 'houses'] as PropertyTypeFilter[]).map(type => (
                    <button
                      key={type}
                      onClick={() => { handlePropertyTypeFilter(type); setIsFilterModalOpen(false) }}
                      className={`py-5 px-4 rounded-2xl font-semibold border-2 flex flex-col items-center gap-2 ${
                        propertyTypeFilter === type
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-700 border-gray-200'
                      }`}
                    >
                      {type === 'apartments' && <Building className="w-6 h-6" />}
                      {type === 'houses' && <Home className="w-6 h-6" />}
                      <span className="text-xs">{dict.listings.filters[type]}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="w-full py-5 bg-gray-900 text-white font-bold rounded-2xl"
              >
                {lang === 'bg' ? 'Приложи филтри' : 'Apply filters'}
              </button>
            </div>
          </div>
        )}
        
        {/* Draggable sheet */}
        {!isSearchOpen && !isFilterModalOpen && (
          <DraggableSheet snapPoints={[16, 40, headerSnapPct]} initialSnap={0} onSnapChange={setMobileSheetSnap}>
            <div className="px-5 py-4">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">
                  {filteredProperties.length} {lang === 'bg' ? 'имота' : 'properties'}
                </h2>
              </div>
              
              {shouldShowLoading ? (
                <ListingCardSkeletonGrid count={6} />
              ) : showEmpty ? (
                <div className="py-16 text-center">
                  <Building className="w-20 h-20 mx-auto text-gray-300 mb-6" />
                  <h3 className="text-xl font-semibold mb-3">{dict.listings.noPropertiesAvailable}</h3>
                  <p className="text-gray-600">{dict.listings.tryDifferentLocation}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 pb-24">
                  {filteredProperties.map((property, index) => (
                    <MemoizedListingCard
                      key={property.id}
                      listing={propertyToListing(property)}
                      isActive={selectedPropertyId === property.id}
                      onCardClick={() => { onPropertySelect(property.id); setMobileSheetSnap(2) }}
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
        
        {/* Selected property card (mobile) */}
        {selectedProperty && (
          <div className="absolute bottom-0 left-0 right-0 h-[50vh] z-50">
            <PropertyMapCard
              property={transformToPropertyMapData(selectedProperty)}
              onClose={() => onPropertySelect(null)}
              position={{ bottom: 0, left: 0, right: 0 }}
              floating
              forceMobile
              priceTranslations={dict.price}
            />
          </div>
        )}
      </div>
      
      {/* Desktop Layout */}
      <div className={`hidden xl:flex ${isMapExpanded ? 'gap-0' : 'gap-8'}`}>
        {/* Left: Listings */}
        <section className={`min-w-0 ${isMapExpanded ? 'hidden' : ''}`} style={isMapExpanded ? { display: 'none' } : { width: 'calc(100% - max(600px, 40vw) - 2rem)' }}>
          <div className="mt-4 mb-4">
            <Card className="shadow-lg border">
              <CardContent className="p-4 xl:p-6">
                <DesktopSearch
                  onPlaceSelected={({ lat, lng, zoom, name }) => {
                    const normalized = name.toLowerCase()
                    if (normalized.includes('sofia') || normalized.includes('софия')) handleCityChange('Sofia')
                    else if (normalized.includes('plovdiv') || normalized.includes('пловдив')) handleCityChange('Plovdiv')
                    else if (normalized.includes('varna') || normalized.includes('варна')) handleCityChange('Varna')
                    
                    if (googleMapRef.current) {
                      googleMapRef.current.panTo({ lat, lng })
                      googleMapRef.current.setZoom(zoom)
                    }
                  }}
                  onPropertyTypeChange={(type) => handlePropertyTypeFilter(type as PropertyTypeFilter)}
                  propertyTypeFilter={propertyTypeFilter}
                  placeholder={dict.listings.filters.chooseCity}
                  locale={lang}
                  dict={dict.listings}
                />
              </CardContent>
            </Card>
          </div>
          
          <div className="listings-map-container overflow-y-auto pr-4 scrollbar-thin">
            {shouldShowLoading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-6">
                <Loader2 className="h-12 w-12 animate-spin text-brand" />
                <p className="text-lg font-semibold">{dict.listings.loadingProperties}</p>
              </div>
            ) : showError ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-12 text-center">
                <Building className="w-10 h-10 text-red-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-red-800 mb-3">Unable to Load Properties</h3>
                <p className="text-red-600 mb-8">{error}</p>
                <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
                  Refresh Page
                </Button>
              </div>
            ) : showEmpty ? (
              <div className="bg-gray-50 rounded-2xl border p-12 text-center">
                <Building className="w-10 h-10 text-gray-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-3">{dict.listings.noPropertiesAvailable}</h3>
                <p className="text-gray-600">{dict.listings.tryDifferentLocation}</p>
              </div>
            ) : (
              <div ref={listContainerRef} className="grid grid-cols-3 gap-6 pt-3">
                {filteredProperties.map((property, index) => (
                  <div key={property.id} data-prop-id={property.id} className="w-full">
                    <MemoizedListingCard
                      listing={propertyToListing(property)}
                      isActive={selectedPropertyId === property.id}
                      onCardClick={() => onPropertySelect(property.id)}
                      onCardHover={(id) => setDebouncedHover(id, 100)}
                      priority={index < 6}
                      priceTranslations={dict.price}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
        
        {/* Right: Map */}
        <aside className={isMapExpanded ? 'flex-1 w-full' : 'flex-shrink-0'} style={{ width: isMapExpanded ? '100%' : 'max(600px, 40vw)' }}>
          <div className="sticky top-4 listings-map-container rounded-2xl overflow-hidden border shadow-lg">
            <div ref={mapRef} className="w-full h-full bg-muted" />
            
            <button
              onClick={() => setIsMapExpanded(!isMapExpanded)}
              className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-white/95 border shadow-lg flex items-center justify-center"
              aria-label={isMapExpanded ? 'Collapse' : 'Expand'}
            >
              {isMapExpanded ? <X className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>
            
            {isMapLoading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
          </div>
        </aside>
      </div>
      
      {/* Desktop property card */}
      {selectedProperty && typeof window !== 'undefined' && window.innerWidth >= 1024 && (
        <PropertyMapCard
          property={transformToPropertyMapData(selectedProperty)}
          onClose={() => onPropertySelect(null)}
          position={cardPosition}
          priceTranslations={dict.price}
        />
      )}
    </>
  )
}

