"use client"

import dynamic from "next/dynamic"

export const RecentListingsLazy = dynamic(
  () =>
    import("./recent-listings-section").then((mod) => ({
      default: mod.RecentListingsSection,
    })),
  {
    ssr: false,
    loading: () => null, // No loading state to avoid layout shift
  }
)
