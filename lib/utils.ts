import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { listingHref, asLocale } from "@/lib/routes"

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
  return listingHref(asLocale(lang), identifier)
}