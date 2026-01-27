import Link from "next/link"
import { developerHref, developersHref } from "@/lib/routes"
import type { SupportedLocale } from "@/lib/routes"
import type { DevelopersListResponse } from "@/lib/api"

interface FeaturedDevelopersProps {
  lang: SupportedLocale
  dict?: {
    developers?: { viewAll?: string }
    home?: { featuredDevelopers?: string }
  }
}

export async function FeaturedDevelopers({ lang, dict }: FeaturedDevelopersProps) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  const baseUrl = apiUrl.replace(/\/$/, "")

  let data: DevelopersListResponse | null = null
  try {
    const response = await fetch(
      `${baseUrl}/api/v1/developers?per_page=6&page=1`,
      {
        next: { revalidate: 300 },
        headers: { "Content-Type": "application/json" },
      }
    )
    if (!response.ok) return null
    data = (await response.json()) as DevelopersListResponse
  } catch {
    return null
  }

  const developers = data?.developers ?? []
  if (developers.length === 0) return null

  const heading = dict?.home?.featuredDevelopers ?? "Featured developers"
  const viewAllLabel = dict?.developers?.viewAll ?? "View all developers"

  return (
    <section
      aria-label="Featured developers"
      className="py-8 sm:py-12 md:py-16"
      style={{
        background: "linear-gradient(180deg, #e4ecf4 0%, #dae4ef 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 font-serif">
          {heading}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {developers.map((dev) => {
            const slug = dev.slug ?? String(dev.id)
            return (
              <Link
                key={dev.id}
                href={developerHref(lang, slug)}
                className="block rounded-xl bg-white/80 hover:bg-white px-4 py-3 font-medium text-gray-800 hover:text-charcoal-600 shadow-sm hover:shadow-md transition-all"
              >
                {dev.company_name}
              </Link>
            )
          })}
        </div>
        <p className="mt-6">
          <Link
            href={developersHref(lang)}
            className="font-medium text-charcoal-600 hover:text-charcoal-700 underline"
          >
            {viewAllLabel}
          </Link>
        </p>
      </div>
    </section>
  )
}
