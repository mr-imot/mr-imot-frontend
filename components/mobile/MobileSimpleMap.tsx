"use client"

import { useEffect, useRef, useState } from "react"
import { ensureGoogleMapsBasic } from "@/lib/google-maps"
import { PropertyData } from "@/lib/marker-manager"
import { Loader2, MapPin } from "lucide-react"

interface MobileSimpleMapProps {
  properties: PropertyData[]
  selectedPropertyId: string | null
  hoveredPropertyId: string | null
  onPropertySelect: (propertyId: string | null) => void
  onPropertyHover: (propertyId: string | null) => void
  center: { lat: number; lng: number }
  zoom: number
  className?: string
}

export function MobileSimpleMap({
  properties,
  selectedPropertyId,
  hoveredPropertyId,
  onPropertySelect,
  onPropertyHover,
  center,
  zoom,
  className = ""
}: MobileSimpleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<Record<string, google.maps.marker.AdvancedMarkerElement>>({})
  const markerElementsRef = useRef<Record<string, HTMLElement>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize simple Google Maps optimized for mobile
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return
      
      try {
        setIsLoading(true)
        await ensureGoogleMapsBasic()
        
        // Create mobile-optimized map with Airbnb-style styling
        const map = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          zoomControl: true,
          scrollwheel: true,
          gestureHandling: 'greedy', // 1-finger scrolling on mobile
          disableDefaultUI: false,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapId: 'e1ea25ce333a0b0deb34ff54', // Required for AdvancedMarkerElement
          // Note: styles are ignored when mapId is present - must be configured in Google Cloud Console
        })
        
        googleMapRef.current = map
        setIsLoading(false)
        
                 // Add map click handler to deselect properties
         map.addListener('click', () => {
           // Deselect when clicking on empty space
           onPropertySelect(null)
         })
        
      } catch (err) {
        console.error("Failed to initialize mobile map:", err)
        setError("Failed to load map")
        setIsLoading(false)
      }
    }

    initMap()
  }, [center, zoom, onPropertySelect])

  // Update map center when city changes
  useEffect(() => {
    if (googleMapRef.current) {
      googleMapRef.current.setCenter(center)
      googleMapRef.current.setZoom(zoom)
    }
  }, [center, zoom])

  // Render simple, performance-optimized markers
  useEffect(() => {
    if (!googleMapRef.current || !properties.length) return

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.map = null)
    markersRef.current = {}
    markerElementsRef.current = {}

    // Create simple markers for each property
    properties.forEach(property => {
      if (typeof property.lat !== 'number' || typeof property.lng !== 'number') {

        return
      }

      // Create circle marker element with SVG
      const circleElement = document.createElement('div')
      circleElement.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="6" fill="#FF385C" fill-opacity="0.9" 
                  stroke="#FFFFFF" stroke-width="2"/>
        </svg>
      `
      circleElement.style.cursor = 'pointer'
      circleElement.style.display = 'flex'
      circleElement.style.alignItems = 'center'
      circleElement.style.justifyContent = 'center'
      circleElement.setAttribute('title', property.title)

      // Use AdvancedMarkerElement for better mobile performance
      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: { lat: property.lat, lng: property.lng },
        map: googleMapRef.current,
        content: circleElement,
        title: property.title,
        zIndex: 1,
      })

      markersRef.current[property.id] = marker
      markerElementsRef.current[property.id] = circleElement

      // Add click handler
      marker.addEventListener('click', () => {
        console.log('🔴 MOBILE MARKER CLICKED:', property.id, property.title)
        onPropertySelect(property.id)
      })

      // Add touch-friendly hover handlers (with debouncing for mobile)
      let hoverTimeout: NodeJS.Timeout | null = null
      
      marker.addEventListener('mouseover', () => {
        if (hoverTimeout) clearTimeout(hoverTimeout)
        hoverTimeout = setTimeout(() => {
          onPropertyHover(property.id)
        }, 150) // Slightly longer delay for mobile
      })
      
      marker.addEventListener('mouseout', () => {
        if (hoverTimeout) {
          clearTimeout(hoverTimeout)
          hoverTimeout = null
        }
        setTimeout(() => onPropertyHover(null), 150)
      })
    })
  }, [properties, onPropertySelect, onPropertyHover])

  // Update marker appearance based on selection/hover state
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const propertyId = id
      const circleElement = markerElementsRef.current[propertyId]
      
      if (!circleElement) return
      
      if (selectedPropertyId === propertyId) {
        // Selected state - larger, darker red
        circleElement.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="9" fill="#E00B41" fill-opacity="1" 
                    stroke="#FFFFFF" stroke-width="3"/>
          </svg>
        `
        marker.zIndex = 999
      } else if (hoveredPropertyId === propertyId) {
        // Hovered state - slightly larger, bright red
        circleElement.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="7.5" fill="#FF385C" fill-opacity="1" 
                    stroke="#FFFFFF" stroke-width="2"/>
          </svg>
        `
        marker.zIndex = 500
      } else {
        // Default state
        circleElement.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8" r="6" fill="#FF385C" fill-opacity="0.9" 
                    stroke="#FFFFFF" stroke-width="2"/>
          </svg>
        `
        marker.zIndex = 1
      }
    })
  }, [selectedPropertyId, hoveredPropertyId])

  // Pan to selected property smoothly
  useEffect(() => {
    if (!googleMapRef.current || !selectedPropertyId) return
    
    const property = properties.find(p => p.id === selectedPropertyId)
    if (property && typeof property.lat === 'number' && typeof property.lng === 'number') {
      googleMapRef.current.panTo({ lat: property.lat, lng: property.lng })
      
      // Zoom in slightly if needed
      const currentZoom = googleMapRef.current.getZoom()
      if (currentZoom && currentZoom < 13) {
        googleMapRef.current.setZoom(13)
      }
    }
  }, [selectedPropertyId, properties])

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center p-6">
          <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Map unavailable</p>
          <p className="text-xs text-gray-500 mt-1">Try refreshing the page</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full bg-gray-100 rounded-lg" />
      
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin text-brand mx-auto mb-2" />
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      {/* Property count indicator */}
      {!isLoading && !error && properties.length > 0 && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
          <p className="text-xs font-medium text-gray-700">
            {properties.length} propert{properties.length === 1 ? 'y' : 'ies'}
          </p>
        </div>
      )}
    </div>
  )
}
