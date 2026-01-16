'use client'

import { useEffect, useRef } from 'react'

/**
 * Lightweight component that tracks header height using ResizeObserver.
 * Only sets --header-height CSS variable, no viewport locking.
 * Extracted from ViewportLock to separate concerns.
 */
export default function HeaderHeight(): null {
  const headerHeightRef = useRef<number>(0)

  useEffect(() => {
    // Use ResizeObserver with borderBoxSize to avoid getBoundingClientRect forced reflow
    let resizeObserver: ResizeObserver | null = null
    
    if (typeof ResizeObserver !== 'undefined') {
      const header = document.querySelector('header')
      if (header) {
        // Initial measurement
        const initialHeight = header.getBoundingClientRect().height
        headerHeightRef.current = initialHeight
        document.documentElement.style.setProperty('--header-height', `${Math.round(initialHeight)}px`)

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
      if (resizeObserver) resizeObserver.disconnect()
    }
  }, [])

  return null
}
