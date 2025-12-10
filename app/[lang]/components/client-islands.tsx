"use client"

import dynamic from "next/dynamic"

// Client component wrapper for components that need ssr: false
export const EtchedGlassBackground = dynamic(
  () => import("@/components/etched-glass-background").then((mod) => ({ default: mod.EtchedGlassBackground })),
  { ssr: false }
)

export const LazyPricingSection = dynamic(
  () => import("@/components/pricing/LazyPricingSection").then((mod) => ({ default: mod.LazyPricingSection })),
  { ssr: false }
)


