"use client"

import { useEffect, useState } from "react"

/**
 * MobileOnlyWrapper - Conditionally renders children only on mobile devices
 * 
 * This component:
 * - Returns null on server (SSR) to avoid hydration mismatch
 * - Returns null before mount (initial render)
 * - Only renders children if matchMedia('(max-width: 1279px)') is true AFTER mount
 * - Prevents desktop from hydrating mobile-only components
 * 
 * Usage:
 * <MobileOnlyWrapper>
 *   <PublicMobileNav ... />
 * </MobileOnlyWrapper>
 */
interface MobileOnlyWrapperProps {
  children: React.ReactNode
}

export function MobileOnlyWrapper({ children }: MobileOnlyWrapperProps) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null) // null = not determined yet

  useEffect(() => {
    // Only run on client after mount
    if (typeof window === 'undefined') return

    // Check if mobile (max-width: 1279px matches xl breakpoint)
    const mediaQuery = window.matchMedia('(max-width: 1279px)')
    
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

  // Return null on server or before mount
  if (isMobile === null) {
    return null
  }

  // Only render children on mobile
  if (!isMobile) {
    return null
  }

  return <>{children}</>
}
