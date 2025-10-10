'use client'

import { useEffect } from 'react'
import { isTouchPointerDevice } from '@/lib/device-detection'

export function ViewportLock() {
  useEffect(() => {
    const setVhUnit = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }

    const setHeaderHeight = () => {
      const header = document.querySelector('header') as HTMLElement | null
      if (header) {
        document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`)
      }
    }

    const lockViewportHeight = () => {
      if (!isTouchPointerDevice()) return
      const h = window.innerHeight
      document.documentElement.style.setProperty('--fixed-vh', `${h}px`)
      document.documentElement.classList.add('hero-height-locked')
    }

    // Initial
    setVhUnit()
    setHeaderHeight()
    lockViewportHeight()

    // Re-apply on orientation change (and as a safety, debounced resize for touch devices)
    let resizeTimeout: number | undefined
    const onResize = () => {
      if (!isTouchPointerDevice()) return
      if (resizeTimeout) window.clearTimeout(resizeTimeout)
      resizeTimeout = window.setTimeout(() => {
        lockViewportHeight()
      }, 120)
    }

    const onOrientation = () => {
      window.setTimeout(() => {
        lockViewportHeight()
      }, 100)
    }

    window.addEventListener('orientationchange', onOrientation)
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('orientationchange', onOrientation)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return null
}


