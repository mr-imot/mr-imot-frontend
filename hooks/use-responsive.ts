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
    width: 120, // 1920px converted to em (1920/16)
    height: 67.5 // 1080px converted to em (1080/16)
  })

  useEffect(() => {
    const updateState = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setState({
        isMobile: width < 48, // 768px converted to em
        isTablet: width >= 48 && width < 64, // 768px-1024px converted to em
        isDesktop: width >= 64, // 1024px converted to em
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