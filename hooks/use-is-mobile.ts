"use client"

import { useEffect, useState } from "react"

/**
 * useIsMobile - Hook to detect mobile viewport (< 1024px)
 * 
 * This hook:
 * - Returns false on server (SSR) to avoid hydration mismatch
 * - Returns false before mount (initial render)
 * - Only returns true if matchMedia('(max-width: 1023px)') is true AFTER mount
 * - Prevents hydration mismatches from render-time window checks
 * 
 * Usage:
 * const isMobile = useIsMobile()
 * {isMobile && <MobileComponent />}
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false) // Start with false for SSR consistency

  useEffect(() => {
    // Only run on client after mount
    if (typeof window === 'undefined') return

    // Check if mobile (max-width: 1023px matches < 1024px breakpoint)
    const mediaQuery = window.matchMedia('(max-width: 1023px)')
    
    // Set initial state
    setIsMobile(mediaQuery.matches)

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
    }

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } 
    // Fallback for older browsers
    else {
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [])

  return isMobile
}
