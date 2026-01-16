'use client'

import { useEffect, useRef } from 'react'

/**
 * Lightweight component that tracks header height using ResizeObserver.
 * Only sets --header-height CSS variable, no viewport locking.
 * Extracted from ViewportLock to separate concerns.
 * 
 * FIXED: Removed initial getBoundingClientRect() call to eliminate forced reflow on mount.
 * ResizeObserver will deliver the initial size via its callback.
 */
export default function HeaderHeight(): null {
  const headerHeightRef = useRef<number>(0)

  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return

    const header = document.querySelector('header')
    if (!header) return

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      let newHeight = 0

      // Prefer borderBoxSize when available (no layout read)
      const box = entry.borderBoxSize?.[0]
      if (box?.blockSize) {
        newHeight = box.blockSize
      } else {
        // Fallback: avoid getBoundingClientRect if possible
        newHeight = (entry.target as HTMLElement).offsetHeight
      }

      const rounded = Math.round(newHeight)
      if (rounded && headerHeightRef.current !== rounded) {
        headerHeightRef.current = rounded
        document.documentElement.style.setProperty('--header-height', `${rounded}px`)
      }
    })

    ro.observe(header)

    return () => ro.disconnect()
  }, [])

  return null
}
