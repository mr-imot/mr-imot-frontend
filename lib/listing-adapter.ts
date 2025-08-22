// Adapter to transform PropertyData to Airbnb-style Listing interface
import { PropertyData } from '@/lib/marker-manager'
import { Listing } from '@/components/ListingCard'

export function propertyToListing(property: PropertyData): Listing {
  return {
    id: property.id,
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
    images: (property as any).images || property.images || [property.image],
  }
}

export function propertiesToListings(properties: PropertyData[]): Listing[] {
  return properties.map(propertyToListing)
}
