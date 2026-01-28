import Link from "next/link"
import Image from "next/image"
import { listingHref, developerHref } from "@/lib/routes"
import { Home, Building } from "lucide-react"
import type { Project } from "@/lib/api"
import type { SupportedLocale } from "@/lib/routes"

interface MoreFromDeveloperProps {
  developerId: number | string
  excludeId: string | number
  lang: SupportedLocale
  dict?: { listingDetail?: Record<string, string> }
  developerSlug?: string | null
  developerName?: string | null // kept for backwards compatibility, not used for CTA
}

function summarize(text: string | null | undefined, max = 60): string | null {
  if (!text) return null
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (normalized.length <= max) return normalized
  return normalized.slice(0, max - 1) + '…'
}

/** Parse projects list from API; backend may return { projects }, { items }, or { results }. */
function parseProjectsFromResponse(body: unknown): Project[] {
  if (body && typeof body === 'object') {
    const o = body as Record<string, unknown>
    const arr = (o.projects ?? o.items ?? o.results) as unknown
    if (Array.isArray(arr)) return arr as Project[]
  }
  if (process.env.NODE_ENV === 'development') {
    const keys = body && typeof body === 'object' ? Object.keys(body as object).join(',') : 'non-object'
    console.warn('[MoreFromDeveloper] Unexpected API shape. Top-level keys:', keys)
  }
  return []
}

/**
 * Server-rendered "More from this developer" block for listing detail (SEO internal links).
 * Fetches 3–6 other projects by developer_id, excludes current, renders link cards.
 */
export async function MoreFromDeveloper({
  developerId,
  excludeId,
  lang,
  dict,
  developerSlug,
  developerName,
}: MoreFromDeveloperProps) {
  const excludeStr = String(excludeId)
  let data: Project[] = []
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const baseUrl = apiUrl.replace(/\/$/, '')
    const params = new URLSearchParams({
      developer_id: String(developerId),
      per_page: '7',
    })
    const requestUrl = `${baseUrl}/api/v1/projects?${params.toString()}`
    const res = await fetch(requestUrl, {
      next: { revalidate: 300 },
      headers: { 'Content-Type': 'application/json' },
    })
    const body = await res.json()
    const raw = parseProjectsFromResponse(body)
    if (process.env.NODE_ENV === 'development') {
      console.log('[MoreFromDeveloper]', {
        developerId,
        requestUrl,
        status: res.status,
        rawLength: raw.length,
        afterExcludeLength: raw.filter((p) => String(p.id) !== excludeStr && String(p.slug ?? p.id) !== excludeStr).length,
      })
    }
    if (!res.ok) return null
    data = raw
      .filter((p) => String(p.id) !== excludeStr && String(p.slug ?? p.id) !== excludeStr)
      .slice(0, 6)
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[MoreFromDeveloper] fetch error:', e)
    }
    return null
  }

  if (data.length === 0) return null

  const titleKey = dict?.listingDetail?.moreFromDeveloper
  const sectionTitle = titleKey ?? 'More from this developer'
  const viewAllLabel =
    dict?.listingDetail?.viewAllProjectsByDeveloper ?? 'View all projects by this developer'
  const priceFallback = 'Request price'

  return (
    <section aria-label="More from this developer" className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-foreground">{sectionTitle}</h2>
        {developerSlug && (
          <Link
            href={developerHref(lang, developerSlug)}
            className="text-sm font-medium text-primary hover:underline"
          >
            {viewAllLabel}
          </Link>
        )}
      </div>
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
              aria-labelledby={`more-title-${project.id}`}
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
                      id={`more-title-${project.id}`}
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
