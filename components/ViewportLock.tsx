'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { applyPalette } from '../theme/applyPalette'

export default function ViewportLock(): null {
  const pathname = usePathname()
  
  // Store the last known width to detect orientation changes/desktop resizing
  const lastWidth = useRef<number>(0)
  const headerRef = useRef<HTMLElement | null>(null)
  const headerHeightRef = useRef<number>(0)
  const isLockedRef = useRef<boolean>(false)

  const updateLayout = (force = false) => {
    if (typeof window === 'undefined') return

    const currentWidth = window.innerWidth
    const currentHeight = window.innerHeight
    const isMobile = currentWidth < 1024 // Treat tablets/phones as mobile context

    // 1. HEADER CALCULATION
    // Optimize header height calculation to reduce forced reflows
    // Use ResizeObserver for ongoing updates (handled separately below)
    // Only calculate here if header ref is not set yet
    if (!headerRef.current) {
      headerRef.current = document.querySelector('header')
      // Initial header height - defer to avoid blocking initial render
      if (headerRef.current && headerHeightRef.current === 0) {
        requestAnimationFrame(() => {
          if (headerRef.current) {
            const currentHeaderHeight = headerRef.current.getBoundingClientRect().height
            headerHeightRef.current = currentHeaderHeight
            document.documentElement.style.setProperty('--header-height', `${Math.round(currentHeaderHeight)}px`)
          }
        })
      }
    }

    // 2. VIEWPORT LOCKING LOGIC
    // We only update the VH if:
    // A) It's forced (initial load/navigation)
    // B) We are on Desktop (where resizing vertical window is normal)
    // C) We are on Mobile BUT the WIDTH changed (orientation change)
    // WE IGNORE: Mobile vertical resize events (address bar scrolling)
    
    const widthChanged = Math.abs(currentWidth - lastWidth.current) > 30 // Increased buffer for Chrome scrollbar fluctuations

    // HARD GUARD: On mobile, once locked, never update unless orientation changes
    if (isMobile && isLockedRef.current && !widthChanged && !force) {
      return // Chrome can't win
    }

    if (force || !isMobile || (isMobile && widthChanged)) {
      // Set the lock
      document.documentElement.style.setProperty('--fixed-vh', `${currentHeight}px`)
      document.documentElement.classList.add('hero-height-locked')
      lastWidth.current = currentWidth
      isLockedRef.current = true
    }
  }

  useEffect(() => {
    // 1. Initial Setup
    applyPalette()
    
    // Immediate measurement
    updateLayout(true)

    // Double check slightly later (for iOS Safari bottom bar settlement)
    const timeoutId = setTimeout(() => updateLayout(true), 100)

    // 2. Resize Handler
    const handleResize = () => {
      // Use requestAnimationFrame for performance
      requestAnimationFrame(() => updateLayout(false))
    }

    window.addEventListener('resize', handleResize, { passive: true })
    window.addEventListener('orientationchange', () => {
      // Reset lock flag on orientation change
      isLockedRef.current = false
      // Delay slightly to let the browser finish rotating
      setTimeout(() => updateLayout(true), 200)
    })

    // 3. Header Observer (Only for header height, not viewport lock)
    // Use ResizeObserver with borderBoxSize to avoid getBoundingClientRect forced reflow
    let resizeObserver: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      const header = document.querySelector('header')
      if (header) {
        resizeObserver = new ResizeObserver((entries) => {
          // Use ResizeObserver's borderBoxSize to avoid forced reflow
          // Fallback to getBoundingClientRect only if borderBoxSize is unavailable
          const entry = entries[0]
          let newHeight = 0
          
          if (entry.borderBoxSize && entry.borderBoxSize.length > 0) {
            // Modern browsers: use borderBoxSize (no forced reflow)
            newHeight = entry.borderBoxSize[0].blockSize
          } else {
            // Fallback for older browsers
            newHeight = entry.target.getBoundingClientRect().height
          }
          
          if (headerHeightRef.current !== newHeight) {
            headerHeightRef.current = newHeight
            document.documentElement.style.setProperty('--header-height', `${Math.round(newHeight)}px`)
          }
        })
        resizeObserver.observe(header)
      }
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timeoutId)
      if (resizeObserver) resizeObserver.disconnect()
    }
  }, []) // Run once on mount

  // Handle Route Changes
  useEffect(() => {
    // Reset lock on navigation to allow fresh lock
    isLockedRef.current = false
    // Re-lock on navigation to ensure consistency
    const timeoutId = setTimeout(() => updateLayout(true), 150)
    return () => clearTimeout(timeoutId)
  }, [pathname])

  return null
}
