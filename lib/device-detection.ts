// Device detection utility for mobile optimizations
// Provides reliable mobile device detection and screen size helpers

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  
  // Check user agent for mobile indicators
  const userAgent = navigator.userAgent.toLowerCase()
  const mobileKeywords = [
    'android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone',
    'mobile', 'opera mini', 'iemobile'
  ]
  
  const isMobileUserAgent = mobileKeywords.some(keyword => userAgent.includes(keyword))
  
  // Check screen size (mobile-first breakpoint)
  const isSmallScreen = window.innerWidth < 64 // lg breakpoint (1024px converted to em)
  
  // Check for touch capability
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  
  return isMobileUserAgent || (isSmallScreen && isTouchDevice)
}

// Detects touch-pointer devices reliably (phones/tablets) regardless of width/orientation
export function isTouchPointerDevice(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return (
      window.matchMedia('(pointer: coarse)').matches ||
      // any-pointer is supported by some browsers when multiple inputs exist
      window.matchMedia('(any-pointer: coarse)').matches ||
      // Fallbacks
      'ontouchstart' in window ||
      (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0)
    )
  } catch {
    return (
      'ontouchstart' in (typeof window !== 'undefined' ? window : ({} as any)) ||
      (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0)
    )
  }
}

export function isTabletDevice(): boolean {
  if (typeof window === 'undefined') return false
  
  const userAgent = navigator.userAgent.toLowerCase()
  const isIpad = userAgent.includes('ipad')
  const isTabletAndroid = userAgent.includes('android') && !userAgent.includes('mobile')
  
  const isTabletScreen = window.innerWidth >= 768 && window.innerWidth < 1024
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  
  return isIpad || isTabletAndroid || (isTabletScreen && isTouchDevice)
}

export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop'
  
  if (isMobileDevice()) return 'mobile'
  if (isTabletDevice()) return 'tablet'
  return 'desktop'
}

export function shouldUseMobileOptimizations(): boolean {
  const deviceType = getDeviceType()
  return deviceType === 'mobile' || deviceType === 'tablet'
}

// Screen size helpers
export function getScreenSize(): { width: number; height: number } {
  if (typeof window === 'undefined') return { width: 1920, height: 1080 }
  
  return {
    width: window.innerWidth,
    height: window.innerHeight
  }
}

export function isSmallScreen(): boolean {
  return getScreenSize().width < 768
}

export function isMediumScreen(): boolean {
  const width = getScreenSize().width
  return width >= 768 && width < 1024
}

export function isLargeScreen(): boolean {
  return getScreenSize().width >= 1024
}

// Performance detection
export function hasLowMemory(): boolean {
  if (typeof navigator === 'undefined') return false
  
  // Check for device memory API (Chrome/Edge)
  const deviceMemory = (navigator as any).deviceMemory
  if (deviceMemory && deviceMemory < 4) return true
  
  // Check for hardware concurrency (CPU cores)
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return true
  
  return false
}

export function shouldUseSimplifiedMap(): boolean {
  return shouldUseMobileOptimizations() || hasLowMemory()
}