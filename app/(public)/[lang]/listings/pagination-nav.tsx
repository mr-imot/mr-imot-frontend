/**
 * PaginationNav - Pure Server Component for SEO pagination
 * 
 * This component renders crawlable <Link> elements for pagination.
 * It must be a Server Component (no "use client") to appear in SSR HTML.
 */

import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { listingsHref } from "@/lib/routes"

interface PaginationNavProps {
  lang: 'en' | 'bg' | 'ru' | 'gr'
  cityKey: string | undefined  // city_key from URL (e.g., "sofia-bg")
  cityType: string  // CityType for fallback
  propertyType: string  // PropertyTypeFilter
  currentPage: number
  totalPages: number
  // MapMode pagination support
  isMapMode?: boolean
  bounds?: {
    sw_lat: number
    sw_lng: number
    ne_lat: number
    ne_lng: number
  }
}

export function PaginationNav({
  lang,
  cityKey,
  cityType,
  propertyType,
  currentPage,
  totalPages,
  isMapMode = false,
  bounds,
}: PaginationNavProps) {
  // Don't render if only one page or invalid data
  if (!totalPages || totalPages <= 1 || !currentPage) {
    return null
  }

  // Build pagination URL
  const buildPageUrl = (pageNum: number) => {
    const params = new URLSearchParams()
    
    if (isMapMode && bounds) {
      // MapMode pagination: include bounds params and preserve propertyType
      params.set('search_by_map', 'true')
      params.set('sw_lat', String(bounds.sw_lat))
      params.set('sw_lng', String(bounds.sw_lng))
      params.set('ne_lat', String(bounds.ne_lat))
      params.set('ne_lng', String(bounds.ne_lng))
      if (propertyType && propertyType !== 'all') {
        params.set('type', propertyType)
      }
      if (pageNum > 1) {
        params.set('page', String(pageNum))
      }
    } else {
      // City mode pagination
      // Use city_key from URL if available, otherwise map from CityType
      if (cityKey) {
        params.set('city', cityKey)  // Use 'city' param name for backward compatibility
      } else if (cityType && cityType !== 'Sofia') {
        const cityKeyMap: Record<string, string> = {
          'Sofia': 'sofia-bg',
          'Plovdiv': 'plovdiv-bg',
          'Varna': 'varna-bg',
        }
        const mappedKey = cityKeyMap[cityType] || cityType.toLowerCase() + '-bg'
        params.set('city', mappedKey)
      }
      
      if (propertyType && propertyType !== 'all') {
        params.set('type', propertyType)
      }
      
      if (pageNum > 1) {
        params.set('page', String(pageNum))
      }
    }
    
    const queryString = params.toString()
    return `${listingsHref(lang)}${queryString ? '?' + queryString : ''}`
  }

  return (
    <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Listings pagination">
      {currentPage > 1 && (
        <Link
          href={buildPageUrl(currentPage - 1)}
          className="inline-flex items-center gap-1 px-4 py-2 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </Link>
      )}
      {currentPage < totalPages && (
        <Link
          href={buildPageUrl(currentPage + 1)}
          className="inline-flex items-center gap-1 px-4 py-2 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </nav>
  )
}
