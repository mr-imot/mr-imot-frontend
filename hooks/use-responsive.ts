import { useState, useEffect } from 'react'

export interface ResponsiveState {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  width: number
  height: number
}

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    width: 1920,
    height: 1080
  })

  useEffect(() => {
    const updateState = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setState({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        width,
        height
      })
    }

    // Initial check
    updateState()

    // Listen for resize events
    window.addEventListener('resize', updateState)
    
    // Cleanup
    return () => window.removeEventListener('resize', updateState)
  }, [])

  return state
}

// Helper hook for mobile-specific optimizations
export function useMobileOptimizations() {
  const { isMobile, isTablet } = useResponsive()
  
  return {
    shouldUseMobileMap: isMobile || isTablet,
    shouldStackFilters: isMobile,
    shouldUseSimpleMarkers: isMobile || isTablet,
    maxItemsPerLoad: isMobile ? 10 : isTablet ? 20 : 50
  }
}