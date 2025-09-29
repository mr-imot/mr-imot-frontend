"use client"

import { Badge } from "@/components/ui/badge"

type FeatureCategory = 'building_infrastructure' | 'security_access' | 'amenities' | 'modern_features'

interface Feature {
  id: string
  name: string
  display_name: string
  category: FeatureCategory
  icon?: string
}

interface FeaturesDisplayProps {
  features: Feature[]
  title?: string
  compact?: boolean
  showCategories?: boolean
}

const categoryColors: Record<FeatureCategory, string> = {
  building_infrastructure: "bg-blue-100 text-blue-800 border-blue-300",
  security_access: "bg-green-100 text-green-800 border-green-300", 
  amenities: "bg-purple-100 text-purple-800 border-purple-300",
  modern_features: "bg-orange-100 text-orange-800 border-orange-300"
}

const categoryLabels: Record<FeatureCategory, string> = {
  building_infrastructure: "Building & Infrastructure",
  security_access: "Security & Access",
  amenities: "Amenities", 
  modern_features: "Modern Features"
}

// Helper function to get vibrant dot colors
const getCategoryDotColor = (category: FeatureCategory): string => {
  switch (category) {
    case 'building_infrastructure':
      return 'bg-blue-500'
    case 'security_access':
      return 'bg-green-500'
    case 'amenities':
      return 'bg-purple-500'
    case 'modern_features':
      return 'bg-orange-500'
    default:
      return 'bg-gray-500'
  }
}

// Helper function to get category box styles
const getCategoryBoxStyle = (category: FeatureCategory): string => {
  switch (category) {
    case 'building_infrastructure':
      return 'bg-blue-50 border-blue-200 hover:bg-blue-100'
    case 'security_access':
      return 'bg-green-50 border-green-200 hover:bg-green-100'
    case 'amenities':
      return 'bg-purple-50 border-purple-200 hover:bg-purple-100'
    case 'modern_features':
      return 'bg-orange-50 border-orange-200 hover:bg-orange-100'
    default:
      return 'bg-gray-50 border-gray-200 hover:bg-gray-100'
  }
}

export function FeaturesDisplay({ features, title, compact = false, showCategories = false }: FeaturesDisplayProps) {
  if (!features || features.length === 0) {
    return null
  }

  if (compact) {
    return (
      <div className="space-y-3">
        {title && <h4 className="font-semibold text-gray-900">{title}</h4>}
        <div className="flex flex-wrap gap-2">
          {features.map((feature, index) => (
            <Badge
              key={feature.id || `feature-${index}`}
              variant="outline"
              className={showCategories ? categoryColors[feature.category] : undefined}
            >
              {feature.display_name}
            </Badge>
          ))}
        </div>
      </div>
    )
  }

  // Group by category for detailed view
  const groupedFeatures = features.reduce((acc, feature) => {
    const category = feature.category as FeatureCategory
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(feature)
    return acc
  }, {} as Record<FeatureCategory, Feature[]>)

  return (
    <div className="space-y-6">
      {title && <h3 className="text-xl font-bold text-gray-900">{title}</h3>}
      
      {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => {
        const categoryKey = category as FeatureCategory
        return (
          <div key={category} className="space-y-3">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${getCategoryDotColor(categoryKey)}`}></span>
              {categoryLabels[categoryKey] || category}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {categoryFeatures.map((feature, index) => (
                <div
                  key={feature.id || `feature-${index}`}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${getCategoryBoxStyle(categoryKey)}`}
                >
                  <div className={`w-2 h-2 rounded-full ${getCategoryDotColor(categoryKey)}`}></div>
                  <span className="font-medium text-gray-900">{feature.display_name}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}