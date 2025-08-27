"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { MobileSimpleMap } from "./MobileSimpleMap"
import { MobileFilters } from "./MobileFilters"
import { MobilePropertyList } from "./MobilePropertyList"
import { PropertyData } from "@/lib/marker-manager"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useProjects } from "@/hooks/use-projects"

type CityType = "Sofia" | "Plovdiv" | "Varna"
type PropertyTypeFilter = "all" | "apartments" | "houses"

const CITY_COORDINATES: Record<CityType, { lat: number; lng: number; zoom: number }> = {
  Sofia: { lat: 42.6977, lng: 23.3219, zoom: 11 },
  Plovdiv: { lat: 42.1354, lng: 24.7453, zoom: 11 },
  Varna: { lat: 43.2141, lng: 27.9147, zoom: 11 },
}

const CITY_BOUNDS: Record<CityType, { sw_lat: number; sw_lng: number; ne_lat: number; ne_lng: number }> = {
  Sofia: { sw_lat: 42.5977, sw_lng: 23.2219, ne_lat: 42.7977, ne_lng: 23.4219 },
  Plovdiv: { sw_lat: 42.0354, sw_lng: 24.6453, ne_lat: 42.2354, ne_lng: 24.8453 },
  Varna: { sw_lat: 43.1141, sw_lng: 27.8147, ne_lat: 43.3141, ne_lng: 28.0147 }
}

export function MobileListingsLayout() {
  const searchParams = useSearchParams()
  const urlCity = searchParams.get("city") as CityType | null
  const urlType = searchParams.get("type") as PropertyTypeFilter | null

  const [selectedCity, setSelectedCity] = useState<CityType>(
    urlCity && ["Sofia", "Plovdiv", "Varna"].includes(urlCity) ? urlCity : "Sofia"
  )
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<PropertyTypeFilter>(urlType || "all")
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null)
  const [hoveredPropertyId, setHoveredPropertyId] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')

  // Fetch projects with city bounds
  const { projects: apiProjects, loading, error } = useProjects({
    per_page: 30, // Reduced for mobile performance
    ...CITY_BOUNDS[selectedCity]
  })

  // Filter properties
  const filteredProperties = (apiProjects as unknown as PropertyData[] | undefined)?.filter((p) => {
    if (propertyTypeFilter === "all") return true
    if (propertyTypeFilter === "apartments") return p.type === "Apartment Complex"
    if (propertyTypeFilter === "houses") return p.type === "Residential Houses"
    return true
  }) || []

  const handleCityChange = (city: CityType) => {
    setSelectedCity(city)
    setSelectedPropertyId(null)
  }

  const handlePropertyTypeFilter = (type: PropertyTypeFilter) => {
    setPropertyTypeFilter(type)
    setSelectedPropertyId(null)
  }

  const handlePropertySelect = (propertyId: number | null) => {
    setSelectedPropertyId(propertyId)
    if (propertyId && viewMode === 'list') {
      // Switch to map view when property is selected from list
      setViewMode('map')
    }
  }

  const handlePropertyHover = (propertyId: number | null) => {
    setHoveredPropertyId(propertyId)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Filters */}
      <MobileFilters
        selectedCity={selectedCity}
        propertyTypeFilter={propertyTypeFilter}
        onCityChange={handleCityChange}
        onPropertyTypeChange={handlePropertyTypeFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {viewMode === 'map' ? (
          <div className="h-[60vh] min-h-[400px] rounded-lg overflow-hidden">
            <MobileSimpleMap
              properties={filteredProperties}
              selectedPropertyId={selectedPropertyId}
              hoveredPropertyId={hoveredPropertyId}
              onPropertySelect={handlePropertySelect}
              onPropertyHover={handlePropertyHover}
              center={CITY_COORDINATES[selectedCity]}
              zoom={CITY_COORDINATES[selectedCity].zoom}
              className="w-full h-full"
            />
          </div>
        ) : (
          <MobilePropertyList
            properties={filteredProperties}
            loading={loading}
            error={error}
            selectedPropertyId={selectedPropertyId}
            hoveredPropertyId={hoveredPropertyId}
            onPropertySelect={handlePropertySelect}
            onPropertyHover={handlePropertyHover}
            selectedCity={selectedCity}
            propertyTypeFilter={propertyTypeFilter}
            onClearFilters={() => setPropertyTypeFilter("all")}
          />
        )}
      </div>
    </div>
  )
}