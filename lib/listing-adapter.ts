// Adapter to transform PropertyData to Airbnb-style Listing interface
import { PropertyData } from '@/lib/marker-manager'
import { Listing } from '@/components/ListingCard'

export function propertyToListing(property: PropertyData): Listing {
  const rawImages =
    (property as any).images ??
    property.images ??
    (property.image ? [property.image] : [])
  const normalizedImages = Array.isArray(rawImages) ? rawImages : [rawImages]
  const limitedImages = normalizedImages.filter(Boolean).slice(0, 2)

  return {
    id: property.id,
    slug: property.slug, // Pass through slug for SEO-friendly URLs
    title: property.title,
    city: property.location.split(',')[0].trim(), // Extract city from location
    coordinates: { lat: property.lat, lng: property.lng },
    // Do not infer/parse price; pass label through for exact display
    price: null,
    priceLabel: property.shortPrice || null,
    description: (property as any).description || null,
    rating: 0,
    reviewCount: 0,
    status: property.status,
    propertyType: property.type, // Add property type for icon display
    images: limitedImages.length > 0 ? limitedImages : [property.image].filter(Boolean),
  }
}

export function propertiesToListings(properties: PropertyData[]): Listing[] {
  return properties.map(propertyToListing)
}
