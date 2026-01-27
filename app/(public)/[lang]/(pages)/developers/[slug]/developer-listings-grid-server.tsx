import Link from "next/link"
import Image from "next/image"
import { listingHref, asLocale } from "@/lib/routes"
import { Home, Building } from "lucide-react"
import type { Project } from "@/lib/api"

interface DeveloperListingsGridServerProps {
  projects: Project[]
  lang: 'en' | 'bg' | 'ru' | 'gr'
  dict?: { listingDetail?: Record<string, unknown>; developersDetail?: Record<string, unknown> } | Record<string, unknown>
}

function summarize(text: string | null | undefined, max = 60): string | null {
  if (!text) return null
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (normalized.length <= max) return normalized
  return normalized.slice(0, max - 1) + '…'
}

/**
 * Server-rendered listing links for SEO crawlability on developer detail pages.
 * Matches the grid layout and card structure of ListingCard (image, title, city, price).
 */
export function DeveloperListingsGridServer({ projects, lang, dict }: DeveloperListingsGridServerProps) {
  if (!projects || projects.length === 0) {
    return null
  }

  const locale = asLocale(lang)
  const priceLabelFallback = dict?.listingDetail?.viewProperty ? 'Request price' : 'Request price'

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => {
        const listingUrl = listingHref(locale, project.slug ?? project.id)
        const firstImage = project.images?.[0]?.image_url ?? project.cover_image_url ?? project.gallery_urls?.[0] ?? '/placeholder.svg'
        const title = project.name ?? project.title ?? 'Project'
        const city = project.city ?? project.neighborhood ?? 'Unknown'
        const priceLabel = project.price_label ?? priceLabelFallback
        const description = project.description ?? null
        const isResidential = project.project_type === 'house_complex'

        return (
          <Link
            key={project.id}
            href={listingUrl}
            className="block clickable cursor-pointer relative group"
            aria-labelledby={`title_${project.id}`}
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
                    id={`title_${project.id}`}
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
  )
}
