"use client"

import { ListingCard } from "@/components/ListingCard"
import { propertyToListing } from "@/lib/listing-adapter"
import { PropertyData } from "@/lib/marker-manager"
import { Button } from "@/components/ui/button"
import { Building, Loader2 } from "lucide-react"

type CityType = "Sofia" | "Plovdiv" | "Varna"
type PropertyTypeFilter = "all" | "apartments" | "houses"

interface MobilePropertyListProps {
  properties: PropertyData[]
  loading: boolean
  error: string | null
  selectedPropertyId: number | null
  hoveredPropertyId: number | null
  onPropertySelect: (propertyId: number | null) => void
  onPropertyHover: (propertyId: number | null) => void
  selectedCity: CityType
  propertyTypeFilter: PropertyTypeFilter
  onClearFilters: () => void
}

export function MobilePropertyList({
  properties,
  loading,
  error,
  selectedPropertyId,
  hoveredPropertyId,
  onPropertySelect,
  onPropertyHover,
  selectedCity,
  propertyTypeFilter,
  onClearFilters
}: MobilePropertyListProps) {
  const showEmpty = !loading && !error && properties.length === 0
  const showError = !loading && error
  const hasData = !loading && !error && properties.length > 0

  const handleCardClick = (property: PropertyData) => {
    onPropertySelect(property.id)
    onPropertyHover(property.id)
  }

  const handleCardHover = (propertyId: number | null) => {
    onPropertyHover(propertyId)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="relative">
          <Loader2 className="h-10 w-10 animate-spin text-brand" />
          <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700 mb-1">Loading Properties</p>
          <p className="text-gray-500 text-sm">Finding the perfect properties for you in {selectedCity}...</p>
        </div>
      </div>
    )
  }

  if (showError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Properties</h3>
        <p className="text-red-600 mb-6 text-sm">We're having trouble connecting to our servers. Please check your internet connection and try again.</p>
        <Button 
          onClick={() => window.location.reload()} 
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Try Again
        </Button>
      </div>
    )
  }

  if (showEmpty) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Properties Found</h3>
        <p className="text-gray-600 mb-6 text-sm">
          No properties found in {selectedCity} with the current filters. 
          {propertyTypeFilter !== "all" ? " Try clearing your filters or " : " Try "}
          exploring other cities.
        </p>
        <div className="flex flex-col gap-3">
          {propertyTypeFilter !== "all" && (
            <Button 
              variant="outline" 
              onClick={onClearFilters}
              className="w-full"
            >
              Clear Property Type Filter
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (hasData) {
    return (
      <div className="space-y-4">
        {/* Results summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {properties.length} propert{properties.length === 1 ? 'y' : 'ies'} in {selectedCity}
            {propertyTypeFilter !== "all" && (
              <span className="ml-1">
                • {propertyTypeFilter === "apartments" ? "Apartments" : "Houses"}
              </span>
            )}
          </p>
        </div>

        {/* Property grid - mobile optimized */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {properties.map((property) => (
            <div key={property.id} className="w-full">
              <ListingCard
                listing={propertyToListing(property)}
                isActive={selectedPropertyId === property.id}
                onCardClick={() => handleCardClick(property)}
                onCardHover={handleCardHover}
              />
            </div>
          ))}
        </div>

        {/* Load more hint for future implementation */}
        {properties.length >= 30 && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">
              Showing first {properties.length} properties
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Building className="w-8 h-8 text-yellow-600" />
      </div>
      <h3 className="text-lg font-semibold text-yellow-800 mb-2">Something Went Wrong</h3>
      <p className="text-yellow-700 text-sm">We encountered an unexpected issue. Please try refreshing the page.</p>
    </div>
  )
}