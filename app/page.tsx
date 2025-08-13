"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ensureGoogleMaps } from "@/lib/google-maps"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  MapPin,
  Building,
  Home,
  Shield,
  UserX,
  Clock,
  ExternalLink,
  Loader2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface PropertyData {
  id: string
  name: string
  price_label: string
  city: string
  neighborhood?: string
  formatted_address?: string
  latitude: number
  longitude: number
  project_type: "apartment_building" | "house"
  completion_note?: string
  description?: string
  image?: string
}

type CityType = "Sofia" | "Plovdiv" | "Varna"
type PropertyTypeFilter = "all" | "apartment_building" | "house"

const CITY_COORDINATES = {
  Sofia: { lat: 42.6977, lng: 23.3219, zoom: 11 },
  Plovdiv: { lat: 42.1354, lng: 24.7453, zoom: 11 },
  Varna: { lat: 43.2141, lng: 27.9147, zoom: 11 },
}

export default function HomePage() {
  const [selectedCity, setSelectedCity] = useState<CityType>("Sofia")
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<PropertyTypeFilter>("all")
  const [selectedProperty, setSelectedProperty] = useState<PropertyData | null>(null)
  const [properties, setProperties] = useState<PropertyData[]>([])
  const [isMapLoading, setIsMapLoading] = useState(false)
  
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<google.maps.Map | null>(null)

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return
      try {
        await ensureGoogleMaps()
        const map = new google.maps.Map(mapRef.current, {
          center: CITY_COORDINATES[selectedCity],
          zoom: CITY_COORDINATES[selectedCity].zoom,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ],
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          zoomControl: true,
        })

        googleMapRef.current = map
      } catch (error) {
        console.error("Error loading Google Maps:", error)
      }
    }

    initMap()
  }, [])

  // Handle city change with smooth map panning
  const handleCityChange = (city: string) => {
    if (!city || city === selectedCity) return
    
    const newCity = city as CityType
    setSelectedCity(newCity)
    setSelectedProperty(null)
    setIsMapLoading(true)

    // Animate map to new city
    if (googleMapRef.current) {
      googleMapRef.current.panTo(CITY_COORDINATES[newCity])
      googleMapRef.current.setZoom(CITY_COORDINATES[newCity].zoom)
    }

    // Simulate loading new properties for the city
    setTimeout(() => {
      setProperties([])
      setIsMapLoading(false)
    }, 800)
  }

  // Handle property type filter
  const handlePropertyTypeFilter = (type: PropertyTypeFilter) => {
    setPropertyTypeFilter(type)
    setSelectedProperty(null)
  }

  // Filter properties based on current selections
  const filteredProperties = properties.filter((property) => {
    if (propertyTypeFilter === "all") return true
    return property.project_type === propertyTypeFilter
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-blue-50/30 to-purple-50/20"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-50/10 via-transparent to-blue-50/20"></div>
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-64 h-64 bg-gradient-to-r from-purple-400/20 to-emerald-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="relative z-10">
        <div className="container mx-auto px-4 text-center">
          {/* Hero Content */}
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
                Find Your Way{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Home
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                Connect directly with developers. No brokers, no commissions. Discover new construction properties in Bulgaria's top cities.
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <Badge variant="secondary" className="gap-2">
                <Shield className="w-3.5 h-3.5" /> 100% Verified Listings
              </Badge>
              <Badge variant="secondary" className="gap-2">
                <Building className="w-3.5 h-3.5" /> Direct Developer Contact
              </Badge>
              <Badge variant="secondary" className="gap-2">
                <UserX className="w-3.5 h-3.5" /> Zero Commission
              </Badge>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Search & Filter Section */}
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
                  <ToggleGroupItem 
                    value="Sofia" 
                    className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md transition-all duration-200 min-w-[80px] min-h-[44px] hover:scale-105 active:scale-95"
                  >
                    Sofia
                  </ToggleGroupItem>
                  <ToggleGroupItem 
                    value="Plovdiv" 
                    className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md transition-all duration-200 min-w-[80px] min-h-[44px] hover:scale-105 active:scale-95"
                  >
                    Plovdiv
                  </ToggleGroupItem>
                  <ToggleGroupItem 
                    value="Varna" 
                    className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md transition-all duration-200 min-w-[80px] min-h-[44px] hover:scale-105 active:scale-95"
                  >
                    Varna
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* Divider */}
              <Separator orientation="vertical" className="hidden lg:block h-16" />
              <Separator className="lg:hidden w-full" />

              {/* Property Type Filter */}
              <div className="w-full lg:w-auto">
                {/* Mobile: Accordion */}
                <div className="lg:hidden">
                  <Accordion type="single" collapsible defaultValue="type">
                    <AccordionItem value="type">
                      <AccordionTrigger className="text-sm font-semibold">
                        <span className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-primary" />
                          Property Type
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="mt-4 flex justify-center">
                          <ToggleGroup
                            type="single"
                            value={propertyTypeFilter}
                            onValueChange={handlePropertyTypeFilter}
                            className="bg-muted rounded-lg p-1.5 w-full lg:w-auto flex flex-wrap gap-1"
                          >
                            <ToggleGroupItem 
                              value="all" 
                              className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md transition-all duration-200 px-6 min-h-[44px] hover:scale-105 active:scale-95 flex-1"
                            >
                              All
                            </ToggleGroupItem>
                            <ToggleGroupItem 
                              value="apartment_building" 
                              className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md transition-all duration-200 px-4 min-h-[44px] hover:scale-105 active:scale-95 flex-1"
                            >
                              <Building className="w-4 h-4 mr-2" />
                              Apartments
                            </ToggleGroupItem>
                            <ToggleGroupItem 
                              value="house" 
                              className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md transition-all duration-200 px-4 min-h-[44px] hover:scale-105 active:scale-95 flex-1"
                            >
                              <Home className="w-4 h-4 mr-2" />
                              Houses
                            </ToggleGroupItem>
                          </ToggleGroup>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>

                {/* Desktop: static controls */}
                <div className="hidden lg:flex flex-col items-center space-y-4">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Building className="w-4 h-4 text-primary" />
                    Property Type
                  </h3>
                  <ToggleGroup
                    type="single"
                    value={propertyTypeFilter}
                    onValueChange={handlePropertyTypeFilter}
                    className="bg-muted rounded-lg p-1.5 w-full lg:w-auto flex flex-nowrap gap-1"
                  >
                    <ToggleGroupItem 
                      value="all" 
                      className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md transition-all duration-200 px-6 min-h-[44px] hover:scale-105 active:scale-95"
                    >
                      All
                    </ToggleGroupItem>
                    <ToggleGroupItem 
                      value="apartment_building" 
                      className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md transition-all duration-200 px-4 min-h-[44px] hover:scale-105 active:scale-95"
                    >
                      <Building className="w-4 h-4 mr-2" />
                      Apartments
                    </ToggleGroupItem>
                    <ToggleGroupItem 
                      value="house" 
                      className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md transition-all duration-200 px-4 min-h-[44px] hover:scale-105 active:scale-95"
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Houses
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Map Section */}
      <section className="relative">
        <div className="h-[70vh] relative">
          {/* Google Map */}
          <div
            ref={mapRef}
            className="w-full h-full"
          />

          {/* Loading Overlay */}
          {isMapLoading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium">Loading {selectedCity} projects...</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isMapLoading && filteredProperties.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
              <div className="text-center p-8 bg-card rounded-lg shadow-lg border max-w-md mx-4">
                <div className="mb-6">
                  <Building className="w-16 h-16 mx-auto text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-3">
                  No properties found in {selectedCity}
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  We don't have any {propertyTypeFilter === "all" ? "" : propertyTypeFilter === "apartment_building" ? "apartment building" : "house"} projects in {selectedCity} yet.
                </p>
                <div className="space-y-4">
                  <Button
                    onClick={() => {
                      setPropertyTypeFilter("all")
                      setSelectedCity("Sofia")
                    }}
                    className="w-full"
                    size="lg"
                  >
                    Browse Sofia Properties
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Developers:{" "}
                    <Button variant="link" className="p-0 h-auto font-normal" asChild>
                      <Link href="/register?type=developer">
                        List your project
                      </Link>
                    </Button>{" "}
                    to be the first in {selectedCity}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Results Counter - move to top-right for better contrast over map */}
          <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs md:text-sm font-medium shadow-lg">
            {filteredProperties.length} projects in {selectedCity}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Mr. Imot
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Direct access to new construction projects. No brokers, no commissions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center group">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <UserX className="w-10 h-10 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">Skip the Middleman</h3>
              <p className="text-muted-foreground leading-relaxed">
                Connect directly with developers. Save 3-5% in broker fees on every purchase.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-10 h-10 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">100% Verified</h3>
              <p className="text-muted-foreground leading-relaxed">
                Every listing is personally verified. Zero risk of scams or misleading listings.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-10 h-10 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">Get There First</h3>
              <p className="text-muted-foreground leading-relaxed">
                Access new projects before the market. Up to 15% better prices than launch.
              </p>
            </div>
          </div>

          {/* Single CTA */}
          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link href="/listings">
                Browse All Properties
                <ExternalLink className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}