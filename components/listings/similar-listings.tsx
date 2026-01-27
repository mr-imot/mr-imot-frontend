import Link from "next/link"
import Image from "next/image"
import { listingHref } from "@/lib/routes"
import { Home, Building } from "lucide-react"
import type { Project } from "@/lib/api"
import type { SupportedLocale } from "@/lib/routes"

interface SimilarListingsProps {
  cityKey: string
  excludeId: string | number
  lang: SupportedLocale
  dict?: { listingDetail?: Record<string, string> }
}

function summarize(text: string | null | undefined, max = 60): string | null {
  if (!text) return null
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (normalized.length <= max) return normalized
  return normalized.slice(0, max - 1) + '…'
}

/**
 * Server-rendered "Similar listings in this city" block for listing detail (SEO internal links).
 * Fetches 6–12 projects by city_key, excludes current, renders only if ≥2 others.
 */
export async function SimilarListings({
  cityKey,
  excludeId,
  lang,
  dict,
}: SimilarListingsProps) {
  const excludeStr = String(excludeId)
  let data: Project[] = []
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const baseUrl = apiUrl.replace(/\/$/, '')
    const params = new URLSearchParams({
      city_key: cityKey,
      per_page: '13',
    })
    const res = await fetch(`${baseUrl}/api/v1/projects?${params.toString()}`, {
      next: { revalidate: 300 },
      headers: { 'Content-Type': 'application/json' },
    })
    if (!res.ok) return null
    const body = (await res.json()) as { projects?: Project[] }
    const raw = body.projects ?? []
    data = raw
      .filter((p) => String(p.id) !== excludeStr && String(p.slug ?? p.id) !== excludeStr)
      .slice(0, 12)
  } catch {
    return null
  }

  if (data.length < 2) return null

  const titleKey = dict?.listingDetail?.similarListingsInCity
  const sectionTitle = titleKey ?? 'Similar listings in this city'
  const priceFallback = 'Request price'

  return (
    <section aria-label="Similar listings in this city" className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-xl font-semibold text-foreground mb-4">{sectionTitle}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((project) => {
          const listingUrl = listingHref(lang, project.slug ?? project.id)
          const firstImage =
            project.images?.[0]?.image_url ??
            project.cover_image_url ??
            project.gallery_urls?.[0] ??
            '/placeholder.svg'
          const title = project.name ?? project.title ?? 'Project'
          const city = project.city ?? project.neighborhood ?? 'Unknown'
          const priceLabel = project.price_label ?? priceFallback
          const description = project.description ?? null
          const isResidential = project.project_type === 'house_complex'

          return (
            <Link
              key={project.id}
              href={listingUrl}
              className="block clickable cursor-pointer relative group"
              aria-labelledby={`similar-title-${project.id}`}
            >
              <article
                data-id={project.id}
                className="cursor-pointer transition-[filter] duration-300 ease-out"
                style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))' }}
              >
                <div
                  className="relative overflow-hidden h-[240px] w-full rounded-[20px]"
                  style={{ WebkitBorderRadius: '20px' }}
                >
                  <Image
                    src={firstImage}
                    alt={title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 40em) 100vw, (max-width: 64em) 50vw, 33vw"
                    loading="lazy"
                  />
                </div>
                <div className="pt-3 flex flex-col gap-1">
                  <div className="h-12 flex items-start justify-between gap-2">
                    <h3
                      id={`similar-title-${project.id}`}
                      className="font-semibold text-gray-900 text-[16px] leading-tight line-clamp-2 flex-1 text-left"
                    >
                      {title}
                    </h3>
                  </div>
                  <div className="h-5 flex items-center">
                    {summarize(description, 60) && (
                      <p className="text-gray-600 text-[14px] font-normal leading-relaxed line-clamp-1 text-left">
                        {summarize(description, 60)}
                      </p>
                    )}
                  </div>
                  <div className="h-5 flex items-center gap-2">
                    {isResidential ? (
                      <Home className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    ) : (
                      <Building className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    )}
                    <span className="text-gray-600 text-[14px] font-medium text-left truncate">
                      {city}
                    </span>
                  </div>
                  <div className="h-6 flex items-center">
                    <span className="text-gray-900 font-semibold text-[15px] text-left">
                      {priceLabel}
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
