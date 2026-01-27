import Link from "next/link"
import { getCityInfo } from "@/lib/city-registry"
import { cityListingsHref } from "@/lib/routes"
import type { SupportedLocale } from "@/lib/routes"

const TOP_CITY_KEYS = ["sofia-bg", "plovdiv-bg", "varna-bg"] as const

interface ExploreByCityStripProps {
  lang: SupportedLocale
  /** Full dict from getDictionary; component reads dict?.home?.exploreByCity */
  dict?: Record<string, unknown>
}

/**
 * Server-rendered "Explore by city" strip for listings index (SEO internal links to city hubs).
 * Renders a compact row: "Explore by city: Sofia | Plovdiv | Varna" with links to /listings/c/[cityKey].
 */
export async function ExploreByCityStrip({ lang, dict }: ExploreByCityStripProps) {
  const infos = await Promise.all(
    TOP_CITY_KEYS.map((key) => getCityInfo(key))
  )

  const home = dict && typeof dict === 'object' && 'home' in dict ? (dict.home as { exploreByCity?: string } | undefined) : undefined
  const heading = home?.exploreByCity ?? "Explore by city"

  return (
    <nav
      aria-label={heading}
      className="flex flex-wrap items-center gap-x-2 gap-y-2 py-4 text-sm"
    >
      <span className="font-medium text-muted-foreground">{heading}:</span>
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {TOP_CITY_KEYS.map((cityKey, i) => {
          const info = infos[i]
          const label =
            info?.displayNames[lang as keyof typeof info.displayNames] ??
            cityKey
          const isLast = i === TOP_CITY_KEYS.length - 1
          return (
            <span key={cityKey} className="inline-flex items-center gap-x-2">
              <Link
                href={cityListingsHref(lang, cityKey)}
                className="font-medium text-primary hover:underline"
              >
                {label}
              </Link>
              {!isLast && (
                <span aria-hidden className="text-muted-foreground/60">
                  |
                </span>
              )}
            </span>
          )
        })}
      </span>
    </nav>
  )
}
