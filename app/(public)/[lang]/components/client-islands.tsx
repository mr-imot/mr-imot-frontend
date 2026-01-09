"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

// Client component wrapper for components that need ssr: false
export const EtchedGlassBackground = dynamic(
  () => import("@/components/etched-glass-background").then((mod) => ({ default: mod.EtchedGlassBackground })),
  { ssr: false }
)

export const LazyPricingSection = dynamic(
  () => import("@/components/pricing/LazyPricingSection").then((mod) => ({ default: mod.LazyPricingSection })),
  { ssr: false }
)

// Render EtchedGlassBackground only on non-coarse pointers and after idle
export function EtchedGlassBackgroundClient() {
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    // Skip on coarse pointers (mobile) to save JS work
    if (window.matchMedia?.("(pointer: coarse)").matches) return

    const start = () => setShouldRender(true)
    if ("requestIdleCallback" in window) {
      const id = (requestIdleCallback as any)(start, { timeout: 2000 })
      return () => (cancelIdleCallback as any)?.(id)
    }
    const t = setTimeout(start, 500)
    return () => clearTimeout(t)
  }, [])

  if (!shouldRender) return null
  return <EtchedGlassBackground />
}


