'use client'

import { useEffect } from 'react'

/**
 * GoogleMapsPreconnect - Injects resource hints for Google Maps into the document head
 * 
 * This component adds preconnect and dns-prefetch links to optimize Google Maps loading:
 * - Preconnect to maps.googleapis.com (Maps API)
 * - Preconnect to maps.gstatic.com (Map resources and tiles)
 * - DNS-prefetch for mapsresources-pa.googleapis.com (region-specific tile domain)
 * 
 * Used only on pages that display maps (e.g., listings page) to avoid unnecessary
 * connections on other pages.
 */
export function GoogleMapsPreconnect() {
  useEffect(() => {
    // Check if links already exist to avoid duplicates
    const existingLinks = document.querySelectorAll('link[rel="preconnect"][href*="maps"], link[rel="dns-prefetch"][href*="maps"]')
    if (existingLinks.length > 0) {
      return // Links already exist, skip
    }

    const head = document.head

    // Preconnect to Google Maps API
    const mapsApiLink = document.createElement('link')
    mapsApiLink.rel = 'preconnect'
    mapsApiLink.href = 'https://maps.googleapis.com'
    mapsApiLink.crossOrigin = 'anonymous'
    head.appendChild(mapsApiLink)

    // Preconnect to Google Maps static resources (covers tiles)
    const mapsStaticLink = document.createElement('link')
    mapsStaticLink.rel = 'preconnect'
    mapsStaticLink.href = 'https://maps.gstatic.com'
    mapsStaticLink.crossOrigin = 'anonymous'
    head.appendChild(mapsStaticLink)

    // DNS-prefetch for region-specific tile domain (mapsresources-pa.googleapis.com)
    // Note: The 'pa' suffix may vary by region, but maps.gstatic.com covers most cases
    const tileDomainLink = document.createElement('link')
    tileDomainLink.rel = 'dns-prefetch'
    tileDomainLink.href = 'https://mapsresources-pa.googleapis.com'
    head.appendChild(tileDomainLink)

    // Cleanup function (though these links are safe to keep)
    return () => {
      // Note: We don't remove these links on unmount as they're beneficial to keep
      // and removing them could cause issues if the component remounts
    }
  }, [])

  // This component doesn't render anything
  return null
}
