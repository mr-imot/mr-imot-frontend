import Image from "next/image"
import Link from "next/link"
import { developerHref, developersHref } from "@/lib/routes"
import type { SupportedLocale } from "@/lib/routes"
import type { DevelopersListResponse } from "@/lib/api"

function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase().slice(0, 2)
  }
  return name.trim().slice(0, 2).toUpperCase() || "?"
}

interface FeaturedDevelopersProps {
  lang: SupportedLocale
  dict?: {
    developers?: { viewAll?: string }
    home?: { featuredDevelopers?: string }
  }
  /** When provided (e.g. on register page), use this as the section heading instead of dict.home.featuredDevelopers */
  headingOverride?: string
}

export async function FeaturedDevelopers({ lang, dict, headingOverride }: FeaturedDevelopersProps) {
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

  const heading = headingOverride ?? dict?.home?.featuredDevelopers ?? "Featured developers"
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
            const logoSrc =
              dev.profile_image_url?.startsWith("http")
                ? dev.profile_image_url
                : dev.profile_image_url
                  ? `${baseUrl}${dev.profile_image_url.startsWith("/") ? "" : "/"}${dev.profile_image_url}`
                  : null
            return (
              <Link
                key={dev.id}
                href={developerHref(lang, slug)}
                className="group flex items-center gap-4 rounded-xl bg-white/90 hover:bg-white px-4 py-4 font-medium text-gray-800 hover:text-charcoal-600 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div
                  className="relative shrink-0 size-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center"
                  aria-hidden
                >
                  {logoSrc ? (
                    /^https:\/\/ik\.imagekit\.io\//i.test(logoSrc) ? (
                      <Image
                        src={logoSrc}
                        alt=""
                        width={48}
                        height={48}
                        className="object-cover size-full"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logoSrc}
                        alt=""
                        width={48}
                        height={48}
                        className="object-cover size-full"
                      />
                    )
                  ) : (
                    <span className="text-sm font-semibold text-charcoal-600">
                      {initials(dev.company_name)}
                    </span>
                  )}
                </div>
                <span className="min-w-0 truncate">{dev.company_name}</span>
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
