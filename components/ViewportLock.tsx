'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { applyPalette } from '../theme/applyPalette'

export default function ViewportLock(): null {
  const headerHeightRef = useRef<number | null>(null)
  const headerRef = useRef<HTMLElement | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const pathname = usePathname()

  // Prefer innerHeight for stability on mobile; visualViewport can fluctuate during scroll
  const measureHeight = () => Math.round(window.innerHeight)

  // Batch layout reads to avoid forced reflows
  const updateHeaderHeight = () => {
    if (!headerRef.current) {
      headerRef.current = document.querySelector('header')
    }
    
    if (headerRef.current) {
      // Use requestAnimationFrame to batch layout reads
      requestAnimationFrame(() => {
        if (headerRef.current) {
          const hh = Math.round(headerRef.current.getBoundingClientRect().height)
          // Only update if changed to avoid unnecessary style updates
          if (headerHeightRef.current !== hh) {
            headerHeightRef.current = hh
            document.documentElement.style.setProperty('--header-height', `${hh}px`)
          }
        }
      })
    }
  }

  const lockViewportHeight = () => {
    const isMobile = (typeof window !== 'undefined') && (window.matchMedia?.('(pointer: coarse)').matches || window.innerWidth < 900)

    // Desktop: remove locks to avoid PaperShaders glitches on maximize/restore
    if (!isMobile) {
      document.documentElement.classList.remove('hero-height-locked')
      document.documentElement.style.removeProperty('--fixed-vh')
      // Update header height (batched)
      updateHeaderHeight()
      return
    }
    const h = measureHeight()

    document.documentElement.style.setProperty('--fixed-vh', `${h}px`)
    document.documentElement.classList.add('hero-height-locked')

    // Update header height (batched)
    updateHeaderHeight()
  }

  useEffect(() => {
    let cleanup: (() => void) | null = null

    // Defer initialization until after first paint
    const init = () => {
      // Ensure Oxford Blue / Orange palette is applied
      applyPalette()
      
      // Initial lock (batched)
      requestAnimationFrame(() => {
        lockViewportHeight()
      })

      // Use ResizeObserver for header height changes (more efficient than resize events)
      if (typeof ResizeObserver !== 'undefined') {
        const header = document.querySelector('header')
        if (header) {
          headerRef.current = header as HTMLElement
          resizeObserverRef.current = new ResizeObserver(() => {
            updateHeaderHeight()
          })
          resizeObserverRef.current.observe(header)
        }
      }

      const onOrientation = () => {
        // Batch orientation change handling
        requestAnimationFrame(() => {
          setTimeout(() => lockViewportHeight(), 200)
        })
      }

      window.addEventListener('orientationchange', onOrientation)

      cleanup = () => {
        window.removeEventListener('orientationchange', onOrientation)
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect()
        }
      }
    }

    // Defer initialization after first paint
    let idleCallbackId: number | null = null
    if ('requestIdleCallback' in window) {
      idleCallbackId = requestIdleCallback(init, { timeout: 1000 }) as unknown as number
    } else {
      // Fallback: use requestAnimationFrame with delay
      requestAnimationFrame(() => {
        setTimeout(init, 100)
      })
    }

    return () => {
      if (idleCallbackId && 'cancelIdleCallback' in window) {
        cancelIdleCallback(idleCallbackId)
      }
      if (cleanup) cleanup()
    }
  }, [])

  // Re-lock height when pathname changes (handles navigation back to homepage)
  useEffect(() => {
    // Add a small delay to ensure page transition is complete (batched)
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(() => {
        lockViewportHeight()
      })
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [pathname])

  return null
}
