"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"

import { ensureGoogleMaps } from "@/lib/google-maps"

import { Card, CardContent } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import { MapPin, Building, Home, Loader2, Star, Heart, ExternalLink, Maximize2, X } from "lucide-react"
import { useProjects } from "@/hooks/use-projects"

type CityType = "Sofia" | "Plovdiv" | "Varna"
 type PropertyTypeFilter = "all" | "apartments" | "houses"

interface PropertyData {
  id: number
  title: string
  priceRange: string
  location: string
  image: string
  description: string
  lat: number
  lng: number
  type: "Apartment Complex" | "Residential Houses" | "Mixed-Use Building"
  status: string
  rating: number
  reviews: number
  shortPrice: string
}

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
    urlCity && ["Sofia", "Plovdiv", "Varna"].includes(urlCity) ? urlCity : "Sofia",
  )
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<PropertyTypeFilter>(urlType || "all")
  const [isMapLoading, setIsMapLoading] = useState(false)
  const [hoveredPropertyId, setHoveredPropertyId] = useState<number | null>(null)
  const [isMapExpanded, setIsMapExpanded] = useState(false)

  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<google.maps.Map | null>(null)
  // Fullscreen map refs
  const fullscreenMapRef = useRef<HTMLDivElement>(null)
  const fullscreenGoogleMapRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<Record<number, google.maps.Marker>>({})
  const fullscreenMarkersRef = useRef<Record<number, google.maps.Marker>>({})
  const listContainerRef = useRef<HTMLDivElement>(null)

  // Fetch projects from API
  const { projects: apiProjects, loading } = useProjects({ city: selectedCity, per_page: 50 })

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
        })
        googleMapRef.current = map
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
  }, [selectedCity])

  // Render markers when data changes
  useEffect(() => {
    if (!googleMapRef.current) return
    // Clear old markers
    Object.values(markersRef.current).forEach((m) => m.setMap(null))
    markersRef.current = {}

    const list = (apiProjects || []) as unknown as PropertyData[]
    list.forEach((property) => {
      if (typeof property.lat !== "number" || typeof property.lng !== "number") return
      const marker = new google.maps.Marker({
        position: { lat: property.lat, lng: property.lng },
        map: googleMapRef.current!,
        label: {
          text: property.shortPrice || "",
          color: "#111111",
          fontSize: "12px",
          fontWeight: "700",
        },
        zIndex: 1,
      })
      markersRef.current[property.id] = marker

      // Scroll corresponding card into view on marker click
      marker.addListener("click", () => {
        const card = listContainerRef.current?.querySelector(
          `[data-prop-id="${property.id}"]`
        ) as HTMLElement | null
        if (card) {
          card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" })
          setHoveredPropertyId(property.id)
        }
      })
    })
  }, [apiProjects])

  // Hover highlight on both sidebar and fullscreen maps
  useEffect(() => {
    // Reset all
    Object.values(markersRef.current).forEach((m) => {
      m.setAnimation(null)
      m.setZIndex(1)
    })
    Object.values(fullscreenMarkersRef.current).forEach((m) => {
      m.setAnimation(null)
      m.setZIndex(1)
    })
    if (hoveredPropertyId && markersRef.current[hoveredPropertyId]) {
      const m = markersRef.current[hoveredPropertyId]
      m.setZIndex(999)
      try {
        m.setAnimation(google.maps.Animation.BOUNCE)
        setTimeout(() => m.setAnimation(null), 1200)
      } catch {}
    }
    if (hoveredPropertyId && fullscreenMarkersRef.current[hoveredPropertyId]) {
      const m = fullscreenMarkersRef.current[hoveredPropertyId]
      m.setZIndex(999)
      try {
        m.setAnimation(google.maps.Animation.BOUNCE)
        setTimeout(() => m.setAnimation(null), 1200)
      } catch {}
    }
  }, [hoveredPropertyId])

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
          label: { text: p.shortPrice || "", color: "#111", fontSize: "12px", fontWeight: "700" },
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
    if (googleMapRef.current && markersRef.current[property.id]) {
      googleMapRef.current.panTo({ lat: property.lat, lng: property.lng })
      try {
        const m = markersRef.current[property.id]
        m.setZIndex(999)
        m.setAnimation(google.maps.Animation.BOUNCE)
        setTimeout(() => m.setAnimation(null), 1200)
      } catch {}
    }
  }

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

  const filteredProperties = (apiProjects as unknown as PropertyData[] | undefined)?.filter((p) => {
    if (propertyTypeFilter === "houses") return p.type === "Residential Houses"
    if (propertyTypeFilter === "apartments") return p.type !== "Residential Houses"
    return true
  }) || []

  const showEmpty = !loading && filteredProperties.length === 0

  return (
    <div className="min-h-screen bg-background">
      {/* Filters - same style as homepage */}
      <section className="py-6 bg-card/50 backdrop-blur-sm border-y">
        <div className="container mx-auto px-4">
          <Card>
            <CardContent className="p-6">
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
                    className="bg-muted rounded-lg p-1.5 w-full lg:w-auto grid grid-cols-3 lg:flex gap-1"
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
        <div className="flex gap-6">
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
                    onMouseEnter={() => setHoveredPropertyId(property.id)}
                    onMouseLeave={() => setHoveredPropertyId(null)}
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
