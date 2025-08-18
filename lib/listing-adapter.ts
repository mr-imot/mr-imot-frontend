// Adapter to transform PropertyData to Airbnb-style Listing interface
import { PropertyData } from '@/lib/marker-manager'
import { Listing } from '@/components/ListingCard'

export function propertyToListing(property: PropertyData): Listing {
  // Parse price from shortPrice string (e.g., "€1,200" -> { amount: 1200, currency: "EUR" })
  const parsePrice = (priceStr: string): { amount: number; currency: string } | null => {
    if (!priceStr || priceStr === 'Request price' || priceStr === '€0k') {
      return null
    }
    
    // Simple regex to extract currency and amount
    const match = priceStr.match(/([€$£¥])?([0-9,]+(?:\.[0-9]+)?)(k|K)?/)
    if (!match) return null
    
    const [, currencySymbol, amountStr, multiplier] = match
    let amount = parseFloat(amountStr.replace(/,/g, ''))
    
    // Handle 'k' multiplier (e.g., "€1.2k" = 1200)
    if (multiplier?.toLowerCase() === 'k') {
      amount = amount * 1000
    }
    
    // Map currency symbols to ISO codes
    const currencyMap: Record<string, string> = {
      '€': 'EUR',
      '$': 'USD',
      '£': 'GBP',
      '¥': 'JPY',
    }
    
    const currency = currencySymbol ? currencyMap[currencySymbol] || 'EUR' : 'EUR'
    
    return { amount: Math.round(amount), currency }
  }

  return {
    id: property.id,
    title: property.title,
    city: property.location.split(',')[0].trim(), // Extract city from location
    coordinates: { lat: property.lat, lng: property.lng },
    price: parsePrice(property.shortPrice),
    rating: property.rating || 4.5, // Default rating if not provided
    reviewCount: property.reviews || 0,
    status: property.status,
    images: property.images || [property.image],
  }
}

export function propertiesToListings(properties: PropertyData[]): Listing[] {
  return properties.map(propertyToListing)
}
