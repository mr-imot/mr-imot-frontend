'use client'

import { useEffect, useRef } from 'react'
import { applyPalette } from '../theme/applyPalette'

export default function ViewportLock(): null {
  const lockedHeightRef = useRef<number | null>(null)
  const lockedOrientationRef = useRef<number | null>(null)

  const getOrientation = () => {
    const so = (window.screen as any)?.orientation
    if (so && typeof so.angle === 'number') return so.angle
    return window.innerWidth > window.innerHeight ? 90 : 0
  }

  // Prefer innerHeight for stability on mobile; visualViewport can fluctuate during scroll
  const measureHeight = () => Math.round(window.innerHeight)

  const lockViewportHeight = (force = false) => {
    const isMobile = (typeof window !== 'undefined') && (window.matchMedia?.('(pointer: coarse)').matches || window.innerWidth < 900)

    // Desktop: remove locks to avoid PaperShaders glitches on maximize/restore
    if (!isMobile) {
      document.documentElement.classList.remove('hero-height-locked')
      document.documentElement.style.removeProperty('--fixed-vh')
      // Still keep header height updated for layout consistency
      const header = document.querySelector('header')
      if (header) {
        const hh = Math.round((header as HTMLElement).getBoundingClientRect().height)
        document.documentElement.style.setProperty('--header-height', `${hh}px`)
      }
      lockedHeightRef.current = null
      lockedOrientationRef.current = null
      return
    }
    const orientation = getOrientation()
    const h = measureHeight()

    if (!force && lockedOrientationRef.current === orientation && lockedHeightRef.current != null) {
      if (Math.abs((lockedHeightRef.current || 0) - h) < 120) return
    }

    lockedHeightRef.current = h
    lockedOrientationRef.current = orientation
    document.documentElement.style.setProperty('--fixed-vh', `${h}px`)
    document.documentElement.classList.add('hero-height-locked')

    const header = document.querySelector('header')
    if (header) {
      const hh = Math.round((header as HTMLElement).getBoundingClientRect().height)
      document.documentElement.style.setProperty('--header-height', `${hh}px`)
    }
  }

  useEffect(() => {
    // Ensure Oxford Blue / Orange palette is applied
    applyPalette()
    lockViewportHeight(true)

    const onOrientation = () => {
      setTimeout(() => lockViewportHeight(true), 200)
    }

    const onVisibility = () => {
      if (!document.hidden) lockViewportHeight(true)
    }

    const onPageShow = () => {
      // Safari back-forward cache restoration
      lockViewportHeight(true)
    }

    window.addEventListener('orientationchange', onOrientation)
    window.addEventListener('resize', () => lockViewportHeight(false))
    window.addEventListener('pageshow', onPageShow)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.removeEventListener('orientationchange', onOrientation)
      window.removeEventListener('resize', () => lockViewportHeight(false))
      window.removeEventListener('pageshow', onPageShow)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return null
}


