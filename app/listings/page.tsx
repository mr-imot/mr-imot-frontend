"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"

import { ensureGoogleMaps } from "@/lib/google-maps"
import { MarkerManager, PropertyData } from "@/lib/marker-manager"

import { Card, CardContent } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import { MapPin, Building, Home, Loader2, Star, Heart, ExternalLink, Maximize2, X } from "lucide-react"
import { useProjects } from "@/hooks/use-projects"

type CityType = "Sofia" | "Plovdiv" | "Varna"
 type PropertyTypeFilter = "all" | "apartments" | "houses"



const CITY_COORDINATES: Record<CityType, { lat: number; lng: number; zoom: number }> = {
  Sofia: { lat: 42.6977, lng: 23.3219, zoom: 11 },
  Plovdiv: { lat: 42.1354, lng: 24.7453, zoom: 11 },
  Varna: { lat: 43.2141, lng: 27.9147, zoom: 11 },
}

export default function ListingsPage() {
  const searchParams = useSearchParams()
  const urlCity = searchParams.get("city") as CityType | null
  const urlType = searchParams.get("type") as PropertyTypeFilter | null

  const [selectedCity, setSelectedCity] = useState<CityType>(
    urlCity && ["Sofia", "Plovdiv", "Varna"].includes(urlCity) ? urlCity : "Plovdiv",
  )
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<PropertyTypeFilter>(urlType || "all")
  const [isMapLoading, setIsMapLoading] = useState(false)
  const [hoveredPropertyId, setHoveredPropertyId] = useState<number | null>(null)
  const [isMapExpanded, setIsMapExpanded] = useState(false)
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null)
  const [ariaLiveMessage, setAriaLiveMessage] = useState<string>("")
  const [isMobileMapView, setIsMobileMapView] = useState(false)
  
  // Debounce hover updates
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const setDebouncedHover = (propertyId: number | null, delay: number = 150) => {
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

  // Cleanup marker manager on unmount
  useEffect(() => {
    return () => {
      if (markerManagerRef.current) {
        markerManagerRef.current.cleanup()
      }
    }
  }, [])

  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<google.maps.Map | null>(null)
  // Fullscreen map refs
  const fullscreenMapRef = useRef<HTMLDivElement>(null)
  const fullscreenGoogleMapRef = useRef<google.maps.Map | null>(null)
  const markerManagerRef = useRef<MarkerManager | null>(null)
  const fullscreenMarkersRef = useRef<Record<number, google.maps.Marker>>({})
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const listContainerRef = useRef<HTMLDivElement>(null)
  const [mapBounds, setMapBounds] = useState<google.maps.LatLngBounds | null>(null)

  // Fetch projects from API (client filters city/bounds)
  const { projects: apiProjects, loading, error } = useProjects({ per_page: 50 })
  
  // Debug API data
  useEffect(() => {
    console.log('🔍 API Data Debug:', { 
      loading, 
      error, 
      projectsCount: apiProjects?.length || 0,
      firstProject: apiProjects?.[0]
    })
  }, [apiProjects, loading, error])

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
        })
        googleMapRef.current = map
        google.maps.event.addListener(map, "idle", () => {
          setMapBounds(map.getBounds() || null)
        })
        
        // Listen for zoom changes to re-cluster
        google.maps.event.addListener(map, "zoom_changed", () => {
          // Debounce zoom change to avoid excessive re-clustering
          setTimeout(() => {
            if (googleMapRef.current) {
              console.log('🔍 Zoom changed, re-clustering markers')
              // This will trigger the markers useEffect to re-run
              setMapBounds(googleMapRef.current.getBounds() || null)
            }
          }, 300)
        })
        
        setMapBounds(map.getBounds() || null)
      } catch (e) {
        console.error("Error initializing Google Maps:", e)
      }
    }
    initMap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Recenter when city changes
  useEffect(() => {
    if (!googleMapRef.current) return
    googleMapRef.current.panTo(CITY_COORDINATES[selectedCity])
    googleMapRef.current.setZoom(CITY_COORDINATES[selectedCity].zoom)
    setMapBounds(googleMapRef.current.getBounds() || null)
  }, [selectedCity])

  // Render markers when data changes with clustering
  useEffect(() => {
    if (!googleMapRef.current || !apiProjects) return
    
    const list = apiProjects as unknown as PropertyData[]
    console.log('🗺️ Creating markers for', list.length, 'projects')

    // Initialize or update marker manager
    if (!markerManagerRef.current) {
      markerManagerRef.current = new MarkerManager({
        map: googleMapRef.current,
        properties: list,
        onPropertySelect: (propertyId) => {
          setSelectedPropertyId(propertyId)
          if (propertyId) {
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
    } else {
      // Update the configuration
      markerManagerRef.current = new MarkerManager({
        map: googleMapRef.current,
        properties: list,
        onPropertySelect: (propertyId) => {
          setSelectedPropertyId(propertyId)
          if (propertyId) {
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
    }

    markerManagerRef.current.renderMarkers()
  }, [apiProjects, mapBounds, selectedPropertyId, hoveredPropertyId])



  // Update marker states when hover/selection changes
  useEffect(() => {
    if (markerManagerRef.current) {
      markerManagerRef.current.updateMarkerStates()
    }
    
    // Update fullscreen map markers (if any) - keeping old logic for now
    Object.entries(fullscreenMarkersRef.current).forEach(([id, marker]) => {
      const propertyId = Number(id)
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

  const handleCardClick = (property: PropertyData) => {
    setHoveredPropertyId(property.id)
    setSelectedPropertyId(property.id)
    const marker = markerManagerRef.current?.getMarker(property.id)
    if (googleMapRef.current && marker) {
      googleMapRef.current.panTo({ lat: property.lat, lng: property.lng })
    }
  }

  // Apply city and property type filters to the fetched projects
  const filteredProperties = (apiProjects as unknown as PropertyData[] | undefined)?.filter((p) => {
    // Apply city filter - handle both English and Bulgarian city names
    if (p.location) {
      const locationLower = p.location.toLowerCase();
      const cityLower = selectedCity.toLowerCase();
      
      // Map Bulgarian city names to English equivalents
      const cityMap: Record<string, string[]> = {
        'sofia': ['sofia', 'софия'],
        'plovdiv': ['plovdiv', 'пловдив'],
        'varna': ['varna', 'варна']
      };
      
      const cityVariants = cityMap[cityLower] || [cityLower];
      const cityMatch = cityVariants.some(variant => locationLower.includes(variant));
      
      if (!cityMatch) {
        return false;
      }
    }
    // Apply property type filter
    if (propertyTypeFilter === "houses") return p.type === "Residential Houses"
    if (propertyTypeFilter === "apartments") return p.type !== "Residential Houses"
    return true
  }) || []

  const showEmpty = !loading && filteredProperties.length === 0

  // Get selected property data for info popup
  const selectedProperty = selectedPropertyId 
    ? filteredProperties.find(p => p.id === selectedPropertyId)
    : null

  // Open/close a Google Maps InfoWindow anchored to the selected marker
  useEffect(() => {
    if (!googleMapRef.current) return
    if (!infoWindowRef.current) {
      infoWindowRef.current = new google.maps.InfoWindow()
    }

    const id = selectedPropertyId
    const selected = id ? filteredProperties.find((p) => p.id === id) : null
    const marker = markerManagerRef.current?.getMarker(id!)
    if (id && selected && marker) {
      const m = marker
      
      // Get all images for carousel
      const images = selected.images || [selected.image || "/placeholder.svg"]
      const hasMultipleImages = images.length > 1
      
      // Create carousel HTML
      const carouselImages = images.map((img: string, index: number) => 
        `<img src="${img}" alt="${selected.title}" style="width:100%;height:100%;object-fit:cover;display:${index === 0 ? 'block' : 'none'};" data-carousel-img="${index}" />`
      ).join('')
      
      const carouselDots = hasMultipleImages ? images.map((_: string, index: number) => 
        `<div style="width:6px;height:6px;border-radius:50%;background:${index === 0 ? '#fff' : 'rgba(255,255,255,0.5)'};cursor:pointer;" data-carousel-dot="${index}"></div>`
      ).join('') : ''
      
      const content = `
        <div style="width:320px;border-radius:12px;overflow:hidden;box-shadow:0 10px 24px rgba(0,0,0,0.15);font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif">
          <div style="position:relative;width:100%;height:180px;background:#f2f2f2;overflow:hidden">
            ${carouselImages}
            ${hasMultipleImages ? `
              <button style="position:absolute;left:8px;top:50%;transform:translateY(-50%);width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,0.9);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:bold;color:#222;box-shadow:0 2px 8px rgba(0,0,0,0.1)" data-carousel-prev>‹</button>
              <button style="position:absolute;right:8px;top:50%;transform:translateY(-50%);width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,0.9);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:bold;color:#222;box-shadow:0 2px 8px rgba(0,0,0,0.1)" data-carousel-next>›</button>
              <div style="position:absolute;bottom:12px;left:50%;transform:translateX(-50%);display:flex;gap:4px;">
                ${carouselDots}
              </div>
            ` : ''}
          </div>
          <div style="padding:12px;background:#fff">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
              <div style="font-weight:600;font-size:14px;line-height:1.3;max-width:220px;color:#222">${selected.title}</div>
              <div style="font-size:13px;color:#222;font-weight:600">${selected.shortPrice || ""}</div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;color:#666;font-size:12px;margin-bottom:8px">
              <span>📍 ${selected.location || ""}</span>
              <span>⭐ ${selected.rating || "4.9"} (${selected.reviews || 0})</span>
            </div>
            <button style="width:100%;padding:8px;background:#FF385C;color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:12px" data-listing-link="${id}">View Details</button>
          </div>
        </div>`
      
      infoWindowRef.current.setContent(content)
      infoWindowRef.current.open({ map: googleMapRef.current, anchor: m, shouldFocus: false })
      
      // Add carousel functionality
      if (hasMultipleImages) {
        let currentImageIndex = 0
        
        // Add event listeners for carousel
        setTimeout(() => {
          const infoWindow = document.querySelector('[data-carousel-prev]')?.closest('[role="dialog"]')
          if (!infoWindow) return
          
          const prevBtn = infoWindow.querySelector('[data-carousel-prev]')
          const nextBtn = infoWindow.querySelector('[data-carousel-next]')
          const imgs = infoWindow.querySelectorAll('[data-carousel-img]')
          const dots = infoWindow.querySelectorAll('[data-carousel-dot]')
          
          const updateCarousel = (newIndex: number) => {
            // Hide all images
            imgs.forEach((img, i) => {
              (img as HTMLElement).style.display = i === newIndex ? 'block' : 'none'
            })
            // Update dots
            dots.forEach((dot, i) => {
              (dot as HTMLElement).style.background = i === newIndex ? '#fff' : 'rgba(255,255,255,0.5)'
            })
            currentImageIndex = newIndex
          }
          
          prevBtn?.addEventListener('click', (e) => {
            e.stopPropagation()
            const newIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1
            updateCarousel(newIndex)
          })
          
          nextBtn?.addEventListener('click', (e) => {
            e.stopPropagation()
            const newIndex = currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1
            updateCarousel(newIndex)
          })
          
          dots.forEach((dot, index) => {
            dot.addEventListener('click', (e) => {
              e.stopPropagation()
              updateCarousel(index)
            })
          })
        }, 100)
      }
      
      // Add click-through functionality for "View Details" button
      setTimeout(() => {
        const viewDetailsBtn = document.querySelector(`[data-listing-link="${id}"]`)
        viewDetailsBtn?.addEventListener('click', (e) => {
          e.stopPropagation()
          // Open listing page in new tab
          window.open(`/listing/${id}`, '_blank')
        })
      }, 100)
    } else {
      infoWindowRef.current?.close()
    }
  }, [selectedPropertyId, filteredProperties])

  const handleCityChange = (city: string) => {
    if (!city || city === selectedCity) return
    const newCity = city as CityType
    setSelectedCity(newCity)
    setIsMapLoading(true)
    setTimeout(() => setIsMapLoading(false), 800)
  }

  const handlePropertyTypeFilter = (type: PropertyTypeFilter) => {
    setPropertyTypeFilter(type)
  }


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
      {/* Filters - same style as homepage */}
      <section className="py-6 bg-card/50 backdrop-blur-sm border-y">
        <div className="container mx-auto px-4">
          <Card>
            <CardContent className="p-6">
              {/* Mobile Map/List Toggle */}
              <div className="md:hidden mb-6 flex justify-center">
                <Button 
                  variant={isMobileMapView ? "default" : "outline"}
                  onClick={() => setIsMobileMapView(!isMobileMapView)}
                  className="flex items-center gap-2 px-6 py-3"
                  size="lg"
                >
                  <span>{isMobileMapView ? "📋" : "🗺️"}</span>
                  {isMobileMapView ? "List View" : "Map View"}
                </Button>
              </div>
              <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
                {/* City Selector */}
                <div className="flex flex-col items-center space-y-4 w-full lg:w-auto">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Choose Your City
                  </h3>
                  <ToggleGroup
                    type="single"
                    value={selectedCity}
                    onValueChange={handleCityChange}
                    className="bg-muted rounded-lg p-1.5 w-full lg:w-auto flex gap-1"
                  >
                    <ToggleGroupItem value="Sofia" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md transition-all duration-200 min-w-[80px] min-h-[44px] hover:scale-105 active:scale-95">Sofia</ToggleGroupItem>
                    <ToggleGroupItem value="Plovdiv" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md transition-all duration-200 min-w-[80px] min-h-[44px] hover:scale-105 active:scale-95">Plovdiv</ToggleGroupItem>
                    <ToggleGroupItem value="Varna" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md transition-all duration-200 min-w-[80px] min-h-[44px] hover:scale-105 active:scale-95">Varna</ToggleGroupItem>
                  </ToggleGroup>
            </div>

                {/* Divider */}
                <Separator orientation="vertical" className="hidden lg:block h-16" />
                <Separator className="lg:hidden w-full" />

            {/* Property Type Filter */}
                <div className="flex flex-col items-center space-y-4 w-full lg:w-auto">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Building className="w-4 h-4 text-primary" />
                    Property Type
                  </h3>
              <ToggleGroup
                type="single"
                value={propertyTypeFilter}
                    onValueChange={handlePropertyTypeFilter}
                    className="bg-muted rounded-lg p-1.5 w-full lg:w-auto flex flex-wrap lg:flex-nowrap gap-1"
                  >
                    <ToggleGroupItem value="all" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md transition-all duration-200 px-6 min-h-[44px] hover:scale-105 active:scale-95">All</ToggleGroupItem>
                    <ToggleGroupItem value="apartments" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md transition-all duration-200 px-4 min-h-[44px] hover:scale-105 active:scale-95">
                      <Building className="w-4 h-4 mr-2" /> Apartments
                </ToggleGroupItem>
                    <ToggleGroupItem value="houses" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md transition-all duration-200 px-4 min-h-[44px] hover:scale-105 active:scale-95">
                      <Home className="w-4 h-4 mr-2" /> Houses
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* List + Map layout (match Airbnb proportions) */}
      <div className="mx-auto w-full max-w-[1600px] px-4 lg:px-6 py-8">
        {/* Mobile: Full-screen Map or List View */}
        <div className="md:hidden">
          {isMobileMapView ? (
            <div className="h-[calc(100vh-300px)] min-h-[500px] w-full rounded-lg overflow-hidden">
              <div ref={mapRef} className="w-full h-full bg-muted" />
            </div>
          ) : (
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2 text-muted-foreground">Loading properties...</span>
                </div>
              ) : error ? (
                <div className="flex justify-center items-center py-12">
                  <p className="text-red-600">Error: {error}</p>
                </div>
              ) : !filteredProperties || filteredProperties.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                  <p className="text-muted-foreground">No properties found matching your criteria.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredProperties.map((property) => (
                    <div
                      key={property.id}
                      data-prop-id={property.id}
                      className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.01] border rounded-lg"
                      onMouseEnter={() => setDebouncedHover(property.id, 100)}
                      onMouseLeave={() => setDebouncedHover(null, 150)}
                      onClick={() => handleCardClick(property)}
                    >
                      <Card className="border-0 shadow-none">
                        <CardContent className="p-0">
                          <div className="flex flex-col">
                            <div className="relative w-full h-48">
                              <Image
                                src={property.image}
                                alt={property.title}
                                fill
                                className="object-cover rounded-t-lg"
                                sizes="(max-width: 768px) 100vw, 50vw"
                              />
                              <div className="absolute top-2 right-2">
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-white/20 hover:bg-white/30">
                                  <Heart className="h-4 w-4 text-white" />
                                </Button>
                              </div>
                            </div>
                            <div className="p-3">
                              <div className="flex justify-between items-start mb-1">
                                <h3 className="font-semibold text-sm line-clamp-1">{property.title}</h3>
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-current" />
                                  <span className="text-sm">{property.rating}</span>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">{property.location}</p>
                              <p className="font-semibold text-sm">{property.shortPrice}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Desktop: Side-by-side layout */}
        <div className="hidden md:flex gap-6">
          {/* Left: Listing grid */}
          <div className="w-full lg:w-[62%] min-h-[calc(100vh-200px)]">
                {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : showEmpty ? (
              <div className="bg-card rounded-xl border p-6">
                <h3 className="text-xl font-bold mb-2">No exact matches</h3>
                <p className="text-muted-foreground mb-4">Try changing or removing some of your filters, or adjust the search area.</p>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => setSelectedCity("Sofia")}>Show closest results</Button>
                  <Button variant="outline" onClick={() => setPropertyTypeFilter("all")}>Clear filters</Button>
                    </div>
                  </div>
                ) : (
              <div ref={listContainerRef} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                    <div
                      key={property.id}
                    data-prop-id={property.id}
                    className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.01] border rounded-lg"
                    onMouseEnter={() => setDebouncedHover(property.id, 100)}
                    onMouseLeave={() => setDebouncedHover(null, 150)}
                    onClick={() => handleCardClick(property)}
                    >
                      <Card className="border-0 shadow-none">
                        <CardContent className="p-0">
                          <div className="flex flex-col">
                          <div className="relative w-full h-48">
                            <Image src={property.image || "/placeholder.svg"} alt={property.title} fill className="object-cover rounded-t-lg" />
                            <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md">
                              <Heart className="h-4 w-4" />
                              </button>
                            <div className="absolute bottom-3 left-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                                {property.status}
                              </div>
                            </div>
                          <div className="p-4 space-y-2">
                            <h3 className="text-base font-semibold leading-tight line-clamp-1 group-hover:text-primary transition-colors">{property.title}</h3>
                            <p className="text-sm text-muted-foreground flex items-center">
                              <MapPin className="h-3 w-3 mr-1" /> {property.location}
                            </p>
                              <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                                <span className="font-medium">{property.rating}</span>
                                <span className="text-muted-foreground">({property.reviews})</span>
                              </div>
                              <span className="text-primary font-bold">{property.priceRange.split(" - ")[0]}</span>
                              </div>
                            <Button asChild className="w-full mt-2">
                              <Link href={`/listing/${property.id}`} target="_blank" rel="noopener noreferrer">
                                View Details
                                <ExternalLink className="ml-2 h-4 w-4" />
                              </Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Map */}
          <div className="hidden lg:block lg:w-[38%]">
            <div className="sticky top-24 h-[calc(100vh-128px)] bg-muted rounded-xl border relative overflow-hidden">
              <div ref={mapRef} className="absolute inset-0" />
              
              {/* Expand control */}
              <button
                type="button"
                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-card/95 border shadow flex items-center justify-center hover:bg-muted"
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
                <Maximize2 className="h-4 w-4" />
                      </button>
              {isMapLoading && (
                <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded map overlay */}
      {isMapExpanded && (
        <div className="fixed left-6 right-6 bottom-6 top-20 z-50">
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
    </div>
  )
}
