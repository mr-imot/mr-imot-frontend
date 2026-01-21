/**
 * City Registry - Scalable city data source with API + fallback
 * 
 * Provides city information for routing, display names, and map coordinates.
 * Gracefully falls back to hardcoded registry if API is unavailable.
 */

export interface CityInfo {
  city_key: string
  displayNames: Record<'bg' | 'en' | 'ru' | 'gr', string>
  coordinates: { lat: number; lng: number; zoom: number }
  bounds: { sw_lat: number; sw_lng: number; ne_lat: number; ne_lng: number }
}

// Fallback registry (always available, even if API fails)
const FALLBACK_CITIES: Record<string, CityInfo> = {
  'sofia-bg': {
    city_key: 'sofia-bg',
    displayNames: { bg: 'София', en: 'Sofia', ru: 'София', gr: 'Σόφια' },
    coordinates: { lat: 42.6977, lng: 23.3219, zoom: 11 },
    bounds: { sw_lat: 42.5977, sw_lng: 23.2219, ne_lat: 42.7977, ne_lng: 23.4219 }
  },
  'plovdiv-bg': {
    city_key: 'plovdiv-bg',
    displayNames: { bg: 'Пловдив', en: 'Plovdiv', ru: 'Пловдив', gr: 'Πλόβντιβ' },
    coordinates: { lat: 42.1354, lng: 24.7453, zoom: 11 },
    bounds: { sw_lat: 42.0354, sw_lng: 24.6453, ne_lat: 42.2354, ne_lng: 24.8453 }
  },
  'varna-bg': {
    city_key: 'varna-bg',
    displayNames: { bg: 'Варна', en: 'Varna', ru: 'Варна', gr: 'Βάρνα' },
    coordinates: { lat: 43.2141, lng: 27.9147, zoom: 11 },
    bounds: { sw_lat: 43.1141, sw_lng: 27.8147, ne_lat: 43.3141, ne_lng: 28.0147 }
  },
}

// Cached API fetch (24h revalidate, graceful fallback)
async function fetchCitiesFromAPI(): Promise<Record<string, CityInfo> | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const response = await fetch(`${apiUrl}/api/v1/cities?min_projects=1`, {
      next: { revalidate: 86400 }, // 24 hours cache
    })
    if (!response.ok) return null
    const data = await response.json()
    // Transform API response to CityInfo format (if API provides full details)
    // For now, return null to use fallback
    return null
  } catch (error) {
    console.warn('[city-registry] API fetch failed, using fallback:', error)
    return null // Graceful fallback - don't throw
  }
}

/**
 * Get city information by city_key
 * Tries API first (cached), falls back to hardcoded registry
 */
export async function getCityInfo(cityKey: string): Promise<CityInfo | null> {
  // Try API first (cached), fallback to hardcoded registry
  const apiCities = await fetchCitiesFromAPI()
  const registry = apiCities || FALLBACK_CITIES
  return registry[cityKey] || null
}

/**
 * Get city_key from CityType
 */
export function getCityKeyFromCityType(city: 'Sofia' | 'Plovdiv' | 'Varna'): string {
  const map: Record<'Sofia' | 'Plovdiv' | 'Varna', string> = {
    'Sofia': 'sofia-bg',
    'Plovdiv': 'plovdiv-bg',
    'Varna': 'varna-bg',
  }
  return map[city] || city.toLowerCase() + '-bg'
}

/**
 * Get CityType from city_key
 */
export function getCityTypeFromKey(cityKey: string): 'Sofia' | 'Plovdiv' | 'Varna' | null {
  const map: Record<string, 'Sofia' | 'Plovdiv' | 'Varna'> = {
    'sofia-bg': 'Sofia',
    'plovdiv-bg': 'Plovdiv',
    'varna-bg': 'Varna',
  }
  return map[cityKey] || null
}
