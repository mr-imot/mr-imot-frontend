// Server Component - Static layout, headers, and initial data display
// No "use client" - runs on server only

import { ReactNode } from "react"

// Inline SVG icons (server-compatible, no lucide-react)
const BuildingIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
    <path d="M10 6h4" />
    <path d="M10 10h4" />
    <path d="M10 14h4" />
    <path d="M10 18h4" />
  </svg>
)

export interface ListingsLayoutServerProps {
  dict: any
  lang: 'en' | 'bg' | 'ru'
  children: ReactNode
}

// Loading skeleton - Server rendered (no animation, pure CSS)
export function ListingCardSkeletonServer() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
        <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
      </div>
    </div>
  )
}

export function ListingGridSkeletonServer({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeletonServer key={i} />
      ))}
    </div>
  )
}

// Empty state - Server rendered
export function EmptyStateServer({ 
  title, 
  description, 
  suggestion 
}: { 
  title: string
  description: string
  suggestion?: string
}) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
        <BuildingIcon className="w-10 h-10 text-gray-500" />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      {suggestion && (
        <p className="text-gray-500 text-sm max-w-md mx-auto">{suggestion}</p>
      )}
    </div>
  )
}

// Error state - Server rendered
export function ErrorStateServer({
  title,
  description
}: {
  title: string
  description: string
}) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-12 text-center shadow-sm">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <BuildingIcon className="w-10 h-10 text-red-500" />
      </div>
      <h3 className="text-2xl font-bold text-red-800 mb-3">{title}</h3>
      <p className="text-red-600 mb-8 max-w-md mx-auto">{description}</p>
    </div>
  )
}

// Main server layout wrapper
export function ListingsLayoutServer({ 
  dict, 
  lang, 
  children 
}: ListingsLayoutServerProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Accessibility: Screen reader announcements placeholder */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="listings-aria-live"
      />
      
      {/* Main content wrapper */}
      <div className="mx-auto w-full max-w-[1905px] px-3 sm:px-6 md:px-8 py-4">
        {children}
      </div>
    </div>
  )
}

// City coordinates (shared constant)
export const CITY_COORDINATES = {
  Sofia: { lat: 42.6977, lng: 23.3219, zoom: 11 },
  Plovdiv: { lat: 42.1354, lng: 24.7453, zoom: 11 },
  Varna: { lat: 43.2141, lng: 27.9147, zoom: 11 },
} as const

export const CITY_BOUNDS = {
  Sofia: { sw_lat: 42.5977, sw_lng: 23.2219, ne_lat: 42.7977, ne_lng: 23.4219 },
  Plovdiv: { sw_lat: 42.0354, sw_lng: 24.6453, ne_lat: 42.2354, ne_lng: 24.8453 },
  Varna: { sw_lat: 43.1141, sw_lng: 27.8147, ne_lat: 43.3141, ne_lng: 28.0147 }
} as const

export type CityType = keyof typeof CITY_COORDINATES
export type PropertyTypeFilter = "all" | "apartments" | "houses"

