'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { GoogleMap, Marker, OverlayView, useJsApiLoader } from '@react-google-maps/api'
import { createSvgMarkerIcon } from '@/lib/google-maps'
import { PropertyMapCard } from './property-map-card'

interface PropertyData {
  id: string | number
  title: string
  location: string
  image: string
  images?: string[]
  rating: number
  reviewCount: number
  price: number
  currency: string
  dates: string
  host: string
  type?: 'house' | 'apartment'
  lat: number
  lng: number
  priceLabel?: string
}

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

  const requestPrice = /request/i.test(project.price_label || '')
  const priceMatch = project.price_label?.match(/(\d[\d\s.,]*)/)
  const normalized = priceMatch ? parseInt(priceMatch[1].replace(/[^\d]/g, ''), 10) : 0

  const location = [project.neighborhood, project.city].filter(Boolean).join(', ') || project.formatted_address
  const coverImage = project.images?.find(img => img.is_cover)
  const image = coverImage?.urls?.card || project.images?.[0]?.urls?.card || ''
  // Build ordered images array (cover first)
  const gallery: string[] = (project.images || [])
    .map(img => img?.urls?.card || img?.image_url)
    .filter(Boolean) as string[]
  const images = coverImage ? [coverImage.urls?.card || coverImage.image_url, ...gallery.filter(u => u !== (coverImage.urls?.card || coverImage.image_url))] : gallery

  return {
    id: project.id,
    title: project.name,
    location,
    image,
    images,
    rating: 0,
    reviewCount: 0,
    price: requestPrice ? 0 : normalized,
    priceLabel: project.price_label,
    currency: 'BGN',
    dates: project.completion_note || 'Available now',
    host: '',
    type: project.project_type?.toLowerCase().includes('house') ||
      project.project_type?.toLowerCase().includes('villa') ? 'house' : 'apartment',
    lat: project.latitude,
    lng: project.longitude
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
  className = 'w-full h-[600px]',
  defaultCenter = { lat: 42.6977, lng: 23.3219 },
  defaultZoom = 12,
  height = '600px',
  useRealData = true
}: PropertyMapWithCardsProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ['places']
  })

  const [mapProperties, setMapProperties] = useState<PropertyData[]>(properties || [])
  const [selected, setSelected] = useState<PropertyData | null>(null)
  const [hoveredId, setHoveredId] = useState<string | number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadingData, setLoadingData] = useState(false)
  const [cardPosition, setCardPosition] = useState<{
    top?: number
    left?: number
    right?: number
    bottom?: number
  }>({})

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

  // Calculate Airbnb-style card position relative to map container
  const calculateCardPosition = () => {
    const mapContainer = document.querySelector('.property-map-container')
    if (!mapContainer) return {}
    
    const mapBounds = mapContainer.getBoundingClientRect()
    
    // Card dimensions
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

  return (
    <div className="relative">
      {isLoaded && (
        <GoogleMap
          mapContainerStyle={containerStyle}
          mapContainerClassName={`property-map-container ${className}`}
          center={defaultCenter}
          zoom={defaultZoom}
          options={{
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: true,
            gestureHandling: 'greedy',
            clickableIcons: false
          }}
          onClick={() => setSelected(null)}
        >
          {mapProperties.map((p) => {
            const label = /request/i.test(p.priceLabel || '')
              ? 'Request price'
              : (p.price > 0 ? `${p.price.toLocaleString()} ${p.currency}` : 'Request price')
            const state = selected?.id === p.id ? 'selected' : hoveredId === p.id ? 'hovered' : 'default'
            const icon = isLoaded ? createSvgMarkerIcon(label, state as any) : undefined
            return (
              <Marker
                key={p.id}
                position={{ lat: p.lat, lng: p.lng }}
                onClick={() => {
                  setSelected(p)
                  setCardPosition(calculateCardPosition())
                }}
                onMouseOver={() => setHoveredId(p.id)}
                onMouseOut={() => setHoveredId(prev => (prev === p.id ? null : prev))}
                options={{ icon }}
              />
            )
          })}

          {/* No OverlayView - card will be positioned outside GoogleMap */}
        </GoogleMap>
      )}

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
          property={selected}
          onClose={() => setSelected(null)}
          position={cardPosition}
        />
      )}
    </div>
  )
}