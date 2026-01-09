/**
 * Shared types for property/listing data structures
 * 
 * This file contains shared type definitions to avoid duplication
 * across components and ensure type consistency.
 */

import { PropertyData as MarkerManagerPropertyData } from './marker-manager'

/**
 * PropertyData - Main type for property data used throughout the app
 * Re-export from marker-manager for convenience
 */
export type PropertyData = MarkerManagerPropertyData

/**
 * PropertyMapCardData - Minimal data structure for PropertyMapCard component
 * This is a subset of PropertyData that PropertyMapCard actually needs
 */
export interface PropertyMapCardData {
  id: string | number
  slug?: string
  title: string
  location: string
  image?: string | null
  images?: string[]
  price?: string | number | null
  priceLabel?: string
  type?: 'house' | 'apartment' | "Apartment Complex" | "Residential Houses"
  developer?: {
    company_name?: string
    phone?: string
    website?: string
  }
}

/**
 * Helper function to convert PropertyData to PropertyMapCardData
 */
export function toPropertyMapCardData(property: PropertyData): PropertyMapCardData {
  const image = property.image || (Array.isArray(property.images) ? property.images[0] : undefined)
  return {
    id: property.id,
    slug: property.slug,
    title: property.title,
    location: property.location,
    image,
    images: property.images || (image ? [image] : undefined),
    priceLabel: property.shortPrice || undefined,
    type: property.type === 'Residential Houses' ? 'house' : 'apartment',
  }
}
