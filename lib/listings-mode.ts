/**
 * Shared utility for listings mode detection
 * 
 * Centralizes mode detection logic to prevent duplication across:
 * - page.tsx (server component)
 * - listings-client-content.tsx (client component)
 * - listings-client-wrapper.tsx (client wrapper)
 */

export interface ListingsMode {
  isMapMode: boolean
  seoCityMode: boolean
  defaultLanding: boolean
  hasAllBounds: boolean
  cityParam: string | null
}

/**
 * Determines the current listings mode from URL search params
 * 
 * Modes:
 * - mapMode: search_by_map=true OR all 4 bounds params exist
 * - seoCityMode: city param exists AND not mapMode
 * - defaultLanding: neither city param nor mapMode
 */
export function getListingsMode(searchParams: URLSearchParams): ListingsMode {
  const hasAllBounds = !!(
    searchParams.get('sw_lat') && 
    searchParams.get('sw_lng') && 
    searchParams.get('ne_lat') && 
    searchParams.get('ne_lng')
  )
  const isMapMode = searchParams.get('search_by_map') === 'true' || hasAllBounds
  const cityParam = searchParams.get('city') || searchParams.get('city_key')
  const seoCityMode = !!cityParam && !isMapMode
  const defaultLanding = !cityParam && !isMapMode
  
  return { isMapMode, seoCityMode, defaultLanding, hasAllBounds, cityParam }
}
