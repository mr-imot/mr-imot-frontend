"use client"

import { useEffect, useRef, useState } from "react"
import { ensureGoogleMapsBasic } from "@/lib/google-maps"

interface OptimizedPropertyMapProps {
  latitude: number
  longitude: number
  title: string
}

export const OptimizedPropertyMap = ({ latitude, longitude, title }: OptimizedPropertyMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const isInitializedRef = useRef(false)

  useEffect(() => {
    let isMounted = true

    const waitForMapsReady = async (maxAttempts = 8, baseDelayMs = 75) => {
      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        if (window.google?.maps?.Map) {
          return true
        }
        const delay = baseDelayMs * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
      return false
    }

    const initMap = async () => {
      if (!mapRef.current || isInitializedRef.current) return

      try {
        setIsLoading(true)
        setHasError(false)
        await ensureGoogleMapsBasic()
        
        if (!isMounted || !mapRef.current || !window.google) return

        const isReady = await waitForMapsReady()
        if (!isReady) {
          throw new Error('Google Maps Map constructor is not available')
        }

        // Prevent double initialization
        if (isInitializedRef.current) return
        isInitializedRef.current = true

        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: latitude, lng: longitude },
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          draggableCursor: "grab",
          draggingCursor: "grabbing",
          scrollwheel: true,
          gestureHandling: "greedy",
          mapId: 'e1ea25ce333a0b0deb34ff54',
        })

        mapInstanceRef.current = map

        const pinElement = document.createElement('div')
        pinElement.innerHTML = '📍'
        pinElement.style.cursor = 'pointer'
        pinElement.style.fontSize = '24px'
        pinElement.style.textAlign = 'center'

        const marker = new window.google.maps.marker.AdvancedMarkerElement({
          position: { lat: latitude, lng: longitude },
          map,
          content: pinElement,
          title: title,
        })

        markerRef.current = marker

        if (isMounted) {
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Failed to load Google Maps:', error)
        if (isMounted) {
          setHasError(true)
          setIsLoading(false)
        }
      }
    }

    // Use Intersection Observer to only load when map is about to be visible
    if (mapRef.current && typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !isInitializedRef.current) {
            initMap()
            if (observerRef.current) {
              observerRef.current.disconnect()
            }
          }
        },
        { rootMargin: '100px' } // Start loading 100px before it's visible
      )

      observerRef.current.observe(mapRef.current)
    } else {
      // Fallback for browsers without IntersectionObserver
      initMap()
    }

    return () => {
      isMounted = false
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      // Clean up map instance if needed
      if (mapInstanceRef.current) {
        // Google Maps handles cleanup automatically when the div is removed
        mapInstanceRef.current = null
      }
      if (markerRef.current) {
        markerRef.current.map = null
        markerRef.current = null
      }
    }
  }, [latitude, longitude, title])

  return (
    <div className="mt-4 h-64 bg-gray-100 rounded-lg overflow-hidden relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="animate-pulse text-gray-600">Loading map...</div>
        </div>
      )}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-gray-600">Failed to load map</div>
        </div>
      )}
      <div 
        ref={mapRef} 
        className="w-full h-full" 
        style={{ minHeight: '256px', opacity: isLoading ? 0 : 1, transition: 'opacity 0.3s' }} 
      />
    </div>
  )
}
