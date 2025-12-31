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

  const updateLayout = (force = false) => {
    if (typeof window === 'undefined') return

    const currentWidth = window.innerWidth
    const currentHeight = window.innerHeight
    const isMobile = currentWidth < 1024 // Treat tablets/phones as mobile context

    // 1. HEADER CALCULATION
    if (!headerRef.current) {
      headerRef.current = document.querySelector('header')
    }
    
    let currentHeaderHeight = 0
    if (headerRef.current) {
      currentHeaderHeight = headerRef.current.getBoundingClientRect().height
      if (headerHeightRef.current !== currentHeaderHeight) {
        headerHeightRef.current = currentHeaderHeight
        document.documentElement.style.setProperty('--header-height', `${Math.round(currentHeaderHeight)}px`)
      }
    }

    // 2. VIEWPORT LOCKING LOGIC
    // We only update the VH if:
    // A) It's forced (initial load/navigation)
    // B) We are on Desktop (where resizing vertical window is normal)
    // C) We are on Mobile BUT the WIDTH changed (orientation change)
    // WE IGNORE: Mobile vertical resize events (address bar scrolling)
    
    const widthChanged = Math.abs(currentWidth - lastWidth.current) > 20 // Buffer for scrollbar changes

    if (force || !isMobile || (isMobile && widthChanged)) {
      // Set the lock
      document.documentElement.style.setProperty('--fixed-vh', `${currentHeight}px`)
      document.documentElement.classList.add('hero-height-locked')
      lastWidth.current = currentWidth
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

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', () => {
      // Delay slightly to let the browser finish rotating
      setTimeout(() => updateLayout(true), 200)
    })

    // 3. Header Observer (Optional but good for dynamic headers)
    let resizeObserver: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      const header = document.querySelector('header')
      if (header) {
        resizeObserver = new ResizeObserver(() => handleResize())
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
    // Re-lock on navigation to ensure consistency
    const timeoutId = setTimeout(() => updateLayout(true), 150)
    return () => clearTimeout(timeoutId)
  }, [pathname])

  return null
}
