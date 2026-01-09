"use client"

import { useEffect, useState } from "react"

/**
 * useIsDesktop - Hook to detect desktop viewport (≥ 1280px / xl breakpoint)
 * 
 * This hook:
 * - Returns false on server (SSR) to avoid hydration mismatch
 * - Returns false before mount (initial render)
 * - Only returns true if matchMedia('(min-width: 1280px)') is true AFTER mount
 * - Prevents hydration mismatches from render-time window checks
 * 
 * Usage:
 * const isDesktop = useIsDesktop()
 * {isDesktop && <DesktopComponent />}
 */
export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState<boolean>(false) // Start with false for SSR consistency

  useEffect(() => {
    // Only run on client after mount
    if (typeof window === 'undefined') return

    // Check if desktop (min-width: 1280px matches xl breakpoint)
    const mediaQuery = window.matchMedia('(min-width: 1280px)')
    
    // Set initial state
    setIsDesktop(mediaQuery.matches)

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches)
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

  return isDesktop
}
