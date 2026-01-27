import Link from "next/link"
import { getCityInfo } from "@/lib/city-registry"
import { cityListingsHref } from "@/lib/routes"
import type { SupportedLocale } from "@/lib/routes"

const TOP_CITY_KEYS = ["sofia-bg", "plovdiv-bg", "varna-bg"] as const

interface TopCitiesProps {
  lang: SupportedLocale
  dict?: { home?: { exploreByCity?: string } }
}

export async function TopCities({ lang, dict }: TopCitiesProps) {
  const infos = await Promise.all(
    TOP_CITY_KEYS.map((key) => getCityInfo(key))
  )

  const heading =
    dict?.home?.exploreByCity ?? "Explore by city"

  return (
    <section
      aria-label="Top cities"
      className="py-8 sm:py-12 md:py-16"
      style={{
        background: "linear-gradient(180deg, #e4ecf4 0%, #dae4ef 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 font-serif">
          {heading}
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {TOP_CITY_KEYS.map((cityKey, i) => {
            const info = infos[i]
            const label =
              info?.displayNames[lang as keyof typeof info.displayNames] ??
              cityKey
            return (
              <li key={cityKey}>
                <Link
                  href={cityListingsHref(lang, cityKey)}
                  className="block rounded-xl bg-white/80 hover:bg-white px-4 py-3 font-medium text-gray-800 hover:text-charcoal-600 shadow-sm hover:shadow-md transition-all"
                >
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
