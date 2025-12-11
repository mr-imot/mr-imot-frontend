import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate a listing URL with proper locale-aware routing
 * @param listing - Listing object with id and optional slug
 * @param lang - Language code ('en', 'bg', 'ru', 'gr')
 * @returns URL string with proper route structure
 */
export function getListingUrl(listing: { id: string | number; slug?: string }, lang: 'en' | 'bg' | 'ru' | 'gr'): string {
  const identifier = listing.slug || String(listing.id)
  
  // Debug: Log slug to identify truncation issues
  if (process.env.NODE_ENV === 'development' && listing.slug) {
    console.log(`[getListingUrl] Listing ${listing.id}: slug="${listing.slug}", identifier="${identifier}"`)
  }
  
  const url = lang === 'bg' 
    ? `/bg/obiavi/${identifier}`
    : lang === 'ru'
      ? `/ru/obyavleniya/${identifier}`
      : lang === 'gr'
        ? `/gr/listings/${identifier}`
        : `/listings/${identifier}`
  
  // Debug: Log final URL
  if (process.env.NODE_ENV === 'development' && listing.slug) {
    console.log(`[getListingUrl] Generated URL: "${url}"`)
  }
  
  return url
}