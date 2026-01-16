'use client'

import { useEffect } from 'react'
import { applyPalette } from '../theme/applyPalette'

/**
 * Lightweight component that initializes theme palette CSS variables.
 * Extracted from ViewportLock to separate concerns.
 */
export default function ThemeInit(): null {
  useEffect(() => {
    applyPalette()
  }, [])

  return null
}
