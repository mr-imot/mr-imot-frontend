'use client'

import React, { useEffect, useMemo, useState, useRef } from 'react'
import "@/styles/components/map.css"
import { ensureGoogleMapsBasic, createSvgMarkerIcon } from '@/lib/google-maps'
import { PropertyMapCard } from './property-map-card'
import { PropertyData } from '@/lib/marker-manager'
import { PropertyMapCardData, toPropertyMapCardData } from '@/lib/types'

// API Response structure (matching actual API)
interface ApiProject {
  name: string
  description: string
  formatted_address: string
  city: string
  neighborhood: string | null
  latitude: number
  longitude: number
  project_type: string
  completion_note: string
  price_label: string
  id: string
  images: Array<{
    id: string
    image_url: string
    is_cover: boolean
    urls: {
      card: string
      gallery: string
      fullscreen: string
      original: string
    }
  }>
}

// Transform API Project to PropertyData for map display
function transformProjectToPropertyData(project: ApiProject): PropertyData | null {
  if (!project.latitude || !project.longitude) return null

  const location = [project.neighborhood, project.city].filter(Boolean).join(', ') || project.formatted_address
  const coverImage = project.images?.find(img => img.is_cover)
  const image = coverImage?.urls?.card || project.images?.[0]?.urls?.card || ''
  // Build ordered images array (cover first)
  const gallery: string[] = (project.images || [])
    .map(img => img?.urls?.card || img?.image_url)
    .filter(Boolean) as string[]
  const images = coverImage ? [coverImage.urls?.card || coverImage.image_url, ...gallery.filter(u => u !== (coverImage.urls?.card || coverImage.image_url))] : gallery

  const projectType = project.project_type?.toLowerCase().includes('house') ||
    project.project_type?.toLowerCase().includes('villa')
    ? 'Residential Houses'
    : 'Apartment Complex'

  return {
    id: String(project.id),
    title: project.name,
    priceRange: project.price_label || 'Price on request',
    location,
    image,
    images,
    description: project.description || '',
    lat: project.latitude,
    lng: project.longitude,
    type: projectType as "Apartment Complex" | "Residential Houses",
    status: 'Under Construction',
    shortPrice: project.price_label || 'Request price',
  }
}

interface PropertyMapWithCardsProps {
  properties?: PropertyData[]
  className?: string
  defaultCenter?: { lat: number; lng: number }
  defaultZoom?: number
  height?: string
  useRealData?: boolean
}

export function PropertyMapWithCards({
  properties,
  className = 'w-full h-[37.5rem]',
  defaultCenter = { lat: 42.6977, lng: 23.3219 },
  defaultZoom = 12,
  height = '37.5rem',
  useRealData = true
}: PropertyMapWithCardsProps) {
  const [mapProperties, setMapProperties] = useState<PropertyData[]>(properties || [])
  const [selected, setSelected] = useState<PropertyData | null>(null)
  const [hoveredId, setHoveredId] = useState<string | number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadingData, setLoadingData] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [cardPosition, setCardPosition] = useState<{
    x?: number
    y?: number
  }>({})
  const mapRef = useRef<google.maps.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const markersRef = useRef<Record<string | number, google.maps.marker.AdvancedMarkerElement>>({})
  const mapMetricsRef = useRef<{
    bounds: google.maps.LatLngBounds | null
    projection: google.maps.Projection | null
    containerRect: DOMRect | null
  }>({ bounds: null, projection: null, containerRect: null })

  useEffect(() => {
    if (!useRealData) {
      setMapProperties(properties || [])
      return
    }
    const load = async () => {
      setLoadingData(true)
      setError(null)
      try {
        const res = await fetch('/api/v1/projects/')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const apiProjects = data.projects || []
        const transformed = (apiProjects as ApiProject[])
          .map(p => transformProjectToPropertyData(p))
          .filter((prop: PropertyData | null): prop is PropertyData => prop !== null)
        setMapProperties(transformed)
      } catch (e) {
        console.error(e)
        setError('Failed to load property data')
        setMapProperties(properties || [])
      } finally {
        setLoadingData(false)
      }
    }
    load()
  }, [useRealData, properties])

  const containerStyle = useMemo(() => ({ width: '100%', height }), [height])

  // Calculate Airbnb-style intelligent card position based on marker location
  const calculateCardPosition = useMemo(() => {
    return (property: PropertyData) => {
      const { bounds, projection, containerRect } = mapMetricsRef.current
      if (!containerRect) return {}
      
      const mapBounds = containerRect
      const cardWidth = 327
      const cardHeight = 321
      const padding = 20
      
      // Convert property lat/lng to screen coordinates
      if (!projection) {
        // Fallback to center positioning
        return {
          x: mapBounds.left + mapBounds.width * 0.6 - cardWidth / 2,
          y: mapBounds.top + mapBounds.height * 0.3,
        }
      }
      
      const markerLatLng = new google.maps.LatLng(property.lat, property.lng)
      const markerPoint = projection.fromLatLngToPoint(markerLatLng)
      
      if (!markerPoint || !bounds) {
        return {
          x: mapBounds.left + mapBounds.width * 0.6 - cardWidth / 2,
          y: mapBounds.top + mapBounds.height * 0.3,
        }
      }
      
      // Calculate marker's position within viewport
      const sw = projection.fromLatLngToPoint(bounds.getSouthWest())
      const ne = projection.fromLatLngToPoint(bounds.getNorthEast())
      
      if (!sw || !ne) return { x: mapBounds.left + 100, y: mapBounds.top + 100 }
      
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
        left = markerScreenX + 60
      } else {
        // Marker on right side → place card on left  
        left = markerScreenX - cardWidth - 60
      }
      
      // Vertical positioning: prefer above marker, adapt if needed
      if (markerScreenY > mapBounds.top + cardHeight + 60) {
        // Enough space above → place above marker
        top = markerScreenY - cardHeight - 40
      } else {
        // Not enough space above → place below
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
      
      return { x: left, y: top }
    }
  }, [])

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      if (!mapContainerRef.current) return
      
      try {
        await ensureGoogleMapsBasic()
        
        const map = new google.maps.Map(mapContainerRef.current, {
          center: defaultCenter,
          zoom: defaultZoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          gestureHandling: 'greedy',
          clickableIcons: false,
          mapId: 'e1ea25ce333a0b0deb34ff54', // Required for AdvancedMarkerElement
        })
        
        mapRef.current = map
        setIsLoaded(true)
        
        // Handle map click to deselect
        map.addListener('click', () => {
          setSelected(null)
        })
        
        const updateMapMetrics = () => {
          if (!mapContainerRef.current) return
          mapMetricsRef.current = {
            bounds: map.getBounds() ?? null,
            projection: map.getProjection() ?? null,
            containerRect: mapContainerRef.current.getBoundingClientRect(),
          }
        }
        
        map.addListener('idle', updateMapMetrics)
        map.addListener('zoom_changed', updateMapMetrics)
      } catch (err) {
        console.error('Failed to initialize map:', err)
        setError('Failed to load map')
      }
    }
    
    initMap()
  }, [defaultCenter, defaultZoom])

  // Create/update markers when properties or map state changes
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !mapProperties.length) return

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => {
      marker.map = null
    })
    markersRef.current = {}

    // Create new markers
    mapProperties.forEach((p) => {
      const label = /request/i.test(p.priceLabel || '')
        ? 'Request price'
        : (p.price > 0 ? `${p.price.toLocaleString()} ${p.currency}` : 'Request price')
      const state = selected?.id === p.id ? 'selected' : hoveredId === p.id ? 'hovered' : 'default'
      
      // Convert SVG icon to HTML element
      const iconData = createSvgMarkerIcon(label, state as any)
      const markerElement = document.createElement('div')
      markerElement.innerHTML = `<img src="${iconData.url}" alt="${label}" style="width: ${iconData.scaledSize.width}px; height: ${iconData.scaledSize.height}px;" />`
      markerElement.style.cursor = 'pointer'
      
      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: { lat: p.lat, lng: p.lng },
        map: mapRef.current!,
        content: markerElement,
        title: p.title,
        zIndex: state === 'selected' ? 999 : state === 'hovered' ? 500 : 1,
      })
      
      markersRef.current[p.id] = marker
      
      // Add event listeners
      marker.addEventListener('click', () => {
        setSelected(p)
        setCardPosition(calculateCardPosition(p))
      })
      
      marker.addEventListener('mouseover', () => {
        setHoveredId(p.id)
      })
      
      marker.addEventListener('mouseout', () => {
        setHoveredId(prev => (prev === p.id ? null : prev))
      })
    })
    
    // Cleanup function
    return () => {
      Object.values(markersRef.current).forEach(marker => {
        marker.map = null
      })
      markersRef.current = {}
    }
  }, [isLoaded, mapProperties, selected, hoveredId, calculateCardPosition])

  return (
    <div className="relative">
      <div
        ref={mapContainerRef}
        className={`property-map-container ${className}`}
        style={containerStyle}
      />

      {(!isLoaded || loadingData) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="text-gray-500">{!isLoaded ? 'Loading map...' : 'Loading properties...'}</div>
        </div>
      )}

      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Airbnb-style Property Card - positioned relative to map container */}
      {selected && (
        <PropertyMapCard
          property={toPropertyMapCardData(selected)}
          onClose={() => setSelected(null)}
          position={cardPosition}
        />
      )}
    </div>
  )
}
