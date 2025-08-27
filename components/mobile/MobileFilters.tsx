"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MapPin, Building, Home } from "lucide-react"

type CityType = "Sofia" | "Plovdiv" | "Varna"
type PropertyTypeFilter = "all" | "apartments" | "houses"
type ViewMode = 'list' | 'map'

interface MobileFiltersProps {
  selectedCity: CityType
  propertyTypeFilter: PropertyTypeFilter
  viewMode: ViewMode
  onCityChange: (city: CityType) => void
  onPropertyTypeChange: (type: PropertyTypeFilter) => void
  onViewModeChange: (mode: ViewMode) => void
}

export function MobileFilters({
  selectedCity,
  propertyTypeFilter,
  viewMode,
  onCityChange,
  onPropertyTypeChange,
  onViewModeChange
}: MobileFiltersProps) {
  const handleCityChange = (city: string) => {
    if (!city || city === selectedCity) return
    onCityChange(city as CityType)
  }

  const handlePropertyTypeChange = (type: string) => {
    if (!type) return
    onPropertyTypeChange(type as PropertyTypeFilter)
  }

  return (
    <section className="py-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            {/* Map/List Toggle */}
            <div className="mb-6 flex justify-center">
              <Button 
                variant={viewMode === 'map' ? "default" : "outline"}
                onClick={() => onViewModeChange(viewMode === 'map' ? 'list' : 'map')}
                className="h-12 px-8 rounded-full border-2 border-brand/20 text-ink bg-brand text-white border-brand hover:bg-brand/90 shadow-lg hover:shadow-xl transition-all duration-300 ease-out font-semibold text-base"
                size="lg"
              >
                <span className="mr-2">{viewMode === 'map' ? "📋" : "🗺️"}</span>
                {viewMode === 'map' ? "List View" : "Map View"}
              </Button>
            </div>

            <div className="flex flex-col items-center justify-center gap-6">
              {/* City Selector */}
              <div className="flex flex-col items-center space-y-4 w-full">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-brand" />
                  Choose Your City
                </h3>
                <ToggleGroup
                  type="single"
                  value={selectedCity}
                  onValueChange={handleCityChange}
                  className="grid grid-cols-3 gap-3 w-full"
                >
                  <ToggleGroupItem 
                    value="Sofia" 
                    className="h-12 px-4 rounded-full border-2 border-brand/20 text-gray-700 data-[state=on]:bg-brand data-[state=on]:text-white data-[state=on]:border-brand hover:bg-brand/10 hover:border-brand/40 transition-all duration-300 ease-out font-semibold text-base shadow-sm hover:shadow-md"
                  >
                    Sofia
                  </ToggleGroupItem>
                  <ToggleGroupItem 
                    value="Plovdiv" 
                    className="h-12 px-4 rounded-full border-2 border-brand/20 text-gray-700 data-[state=on]:bg-brand data-[state=on]:text-white data-[state=on]:border-brand hover:bg-brand/10 hover:border-brand/40 transition-all duration-300 ease-out font-semibold text-base shadow-sm hover:shadow-md"
                  >
                    Plovdiv
                  </ToggleGroupItem>
                  <ToggleGroupItem 
                    value="Varna" 
                    className="h-12 px-4 rounded-full border-2 border-brand/20 text-gray-700 data-[state=on]:bg-brand data-[state=on]:text-white data-[state=on]:border-brand hover:bg-brand/10 hover:border-brand/40 transition-all duration-300 ease-out font-semibold text-base shadow-sm hover:shadow-md"
                  >
                    Varna
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* Divider */}
              <Separator className="w-full bg-gray-200" />

              {/* Property Type Filter */}
              <div className="flex flex-col items-center space-y-4 w-full">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-3">
                  <Building className="w-5 h-5 text-brand" />
                  Property Type
                </h3>
                <ToggleGroup
                  type="single"
                  value={propertyTypeFilter}
                  onValueChange={handlePropertyTypeChange}
                  className="grid grid-cols-1 gap-3 w-full sm:grid-cols-3"
                >
                  <ToggleGroupItem 
                    value="all" 
                    className="h-12 px-4 rounded-full border-2 border-brand/20 text-gray-700 data-[state=on]:bg-brand data-[state=on]:text-white data-[state=on]:border-brand hover:bg-brand/10 hover:border-brand/40 transition-all duration-300 ease-out font-semibold text-base shadow-sm hover:shadow-md"
                  >
                    All Properties
                  </ToggleGroupItem>
                  <ToggleGroupItem 
                    value="apartments" 
                    className="h-12 px-3 rounded-full border-2 border-brand/20 text-gray-700 data-[state=on]:bg-brand data-[state=on]:text-white data-[state=on]:border-brand hover:bg-brand/10 hover:border-brand/40 transition-all duration-300 ease-out font-semibold text-base shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                  >
                    <Building className="w-4 h-4" /> Apartments
                  </ToggleGroupItem>
                  <ToggleGroupItem 
                    value="houses" 
                    className="h-12 px-3 rounded-full border-2 border-brand/20 text-gray-700 data-[state=on]:bg-brand data-[state=on]:text-white data-[state=on]:border-brand hover:bg-brand/10 hover:border-brand/40 transition-all duration-300 ease-out font-semibold text-base shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                  >
                    <Home className="w-4 h-4" /> Houses
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}