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

  const measureHeight = () => {
    const vv = (window as any).visualViewport
    return vv && typeof vv.height === 'number'
      ? Math.round(vv.height)
      : window.innerHeight
  }

  const lockViewportHeight = (force = false) => {
    const orientation = getOrientation()
    const h = measureHeight()

    if (!force && lockedOrientationRef.current === orientation && lockedHeightRef.current != null) {
      if (Math.abs((lockedHeightRef.current || 0) - h) < 120) return
    }

    lockedHeightRef.current = h
    lockedOrientationRef.current = orientation
    document.documentElement.style.setProperty('--fixed-vh', `${h}px`)

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
      setTimeout(() => lockViewportHeight(true), 180)
    }

    const onVisibility = () => {
      if (!document.hidden) lockViewportHeight(true)
    }

    window.addEventListener('orientationchange', onOrientation)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.removeEventListener('orientationchange', onOrientation)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return null
}


