"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Loader } from "lucide-react"
import { getFeaturesByCategory } from "@/lib/api"

interface Feature {
  id: string
  name: string
  display_name: string
  category: string
  icon?: string
}

interface FeaturesByCategory {
  building_infrastructure: Feature[]
  security_access: Feature[]
  amenities: Feature[]
  modern_features: Feature[]
}

interface FeaturesSelectorProps {
  selectedFeatureIds?: string[]
  onSelectionChange: (featureIds: string[]) => void
  title?: string
  description?: string
  disabled?: boolean
  lang?: 'en' | 'bg'
  dict?: any
}

const categoryLabels = {
  en: {
    building_infrastructure: "Building & Infrastructure",
    security_access: "Security & Access", 
    amenities: "Amenities",
    modern_features: "Modern Features"
  },
  bg: {
    building_infrastructure: "Сграда & Инфраструктура",
    security_access: "Сигурност & Достъп", 
    amenities: "Удобства",
    modern_features: "Съвременни Функции"
  }
}

const categoryIcons = {
  building_infrastructure: "🏗️",
  security_access: "🔒",
  amenities: "🏊",
  modern_features: "⚡"
}

export function FeaturesSelector({ 
  selectedFeatureIds = [], 
  onSelectionChange, 
  title = "Property Features",
  description = "Select the features and amenities available in your property",
  disabled = false,
  lang = 'en',
  dict
}: FeaturesSelectorProps) {
  const [features, setFeatures] = useState<FeaturesByCategory | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadFeatures = async () => {
      try {
        setLoading(true)
        const data = await getFeaturesByCategory(lang)
        setFeatures(data)
      } catch (err) {
        console.error('Failed to load features:', err)
        setError('Failed to load features. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadFeatures()
  }, [lang]) // Reload when language changes

  const handleFeatureToggle = (featureId: string, checked: boolean) => {
    const currentIds = selectedFeatureIds || []
    const newSelection = checked
      ? [...currentIds, featureId]
      : currentIds.filter(id => id !== featureId)
    
    onSelectionChange(newSelection)
  }

  // Get translated feature name
  const getFeatureName = (feature: Feature): string => {
    if (!dict?.features?.features) {
      return feature.display_name || feature.name
    }
    
    // Try multiple key formats to find the translation
    const nameLower = feature.name?.toLowerCase() || ''
    const displayNameLower = feature.display_name?.toLowerCase() || ''
    
    // Try with feature.name (e.g., "intercom_system" -> "intercomsystem")
    let featureKey = nameLower.replace(/[^a-z0-9]/g, '')
    let translatedName = dict.features.features[featureKey]
    
    // If not found, try with display_name (e.g., "Intercom System" -> "intercomsystem")
    if (!translatedName && displayNameLower) {
      featureKey = displayNameLower.replace(/[^a-z0-9]/g, '')
      translatedName = dict.features.features[featureKey]
    }
    
    // If still not found, try with underscores removed (e.g., "intercom_system" -> "intercomsystem")
    if (!translatedName && nameLower.includes('_')) {
      featureKey = nameLower.replace(/_/g, '').replace(/[^a-z0-9]/g, '')
      translatedName = dict.features.features[featureKey]
    }
    
    if (translatedName) {
      return translatedName
    }
    
    // Fallback to display_name from API
    return feature.display_name || feature.name
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading features...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 text-center py-8">{error}</div>
        </CardContent>
      </Card>
    )
  }

  if (!features) {
    return null
  }

  const totalSelected = selectedFeatureIds?.length || 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {totalSelected > 0 && (
            <Badge variant="secondary">
              {totalSelected} selected
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mt-2">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(features).map(([category, categoryFeatures]) => (
          <div key={category} className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <span>{categoryIcons[category]}</span>
              {dict?.developer?.properties?.features?.categories?.[category] || categoryLabels[lang]?.[category] || categoryLabels.en[category]}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {categoryFeatures.map((feature, index) => {
                const isSelected = selectedFeatureIds?.includes(feature.id) || false
                
                return (
                  <div
                    key={feature.id || `feature-${index}`}
                    onClick={() => {
                      if (!disabled) {
                        handleFeatureToggle(feature.id, !isSelected)
                      }
                    }}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg border transition-colors
                      ${isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white hover:bg-gray-50'}
                      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        id={feature.id}
                        checked={isSelected}
                        disabled={disabled}
                        onCheckedChange={() => {}}
                      />
                    </div>
                    <div className="flex-1">
                      <label htmlFor={feature.id} className="font-medium cursor-pointer">
                        {getFeatureName(feature)}
                      </label>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
