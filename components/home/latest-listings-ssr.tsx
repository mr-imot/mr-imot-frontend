import Link from "next/link"
import Image from "next/image"
import { listingHref } from "@/lib/routes"
import type { Project } from "@/lib/api"
import type { SupportedLocale } from "@/lib/routes"

interface LatestListingsSSRProps {
  lang: SupportedLocale
  dict?: { home?: { latestListings?: string } }
}

export async function LatestListingsSSR({ lang, dict }: LatestListingsSSRProps) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  const baseUrl = apiUrl.replace(/\/$/, "")

  let projects: Project[] = []
  try {
    const params = new URLSearchParams({
      sort_by: "created_at",
      per_page: "6",
    })
    const res = await fetch(`${baseUrl}/api/v1/projects?${params.toString()}`, {
      next: { revalidate: 60 },
      headers: { "Content-Type": "application/json" },
    })
    if (!res.ok) return null
    const body = (await res.json()) as { projects?: Project[] }
    projects = body.projects ?? []
  } catch {
    return null
  }

  if (projects.length === 0) return null

  const heading = dict?.home?.latestListings ?? "Latest listings"

  return (
    <section
      aria-label="Latest listings"
      className="py-8 sm:py-12 md:py-16"
      style={{
        background: "linear-gradient(180deg, #e4ecf4 0%, #dae4ef 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 font-serif">
          {heading}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const listingUrl = listingHref(lang, project.slug ?? project.id)
            const firstImage =
              project.images?.[0]?.image_url ??
              project.cover_image_url ??
              project.gallery_urls?.[0] ??
              "/placeholder.svg"
            const title = project.name ?? project.title ?? "Project"

            return (
              <Link
                key={project.id}
                href={listingUrl}
                className="block rounded-xl overflow-hidden bg-white/80 hover:bg-white shadow-sm hover:shadow-md transition-all"
                aria-labelledby={`latest-listing-title-${project.id}`}
              >
                <div className="relative h-[200px] w-full">
                  <Image
                    src={firstImage}
                    alt={title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 40em) 100vw, (max-width: 64em) 50vw, 33vw"
                    loading="lazy"
                  />
                </div>
                <div className="p-3">
                  <h3
                    id={`latest-listing-title-${project.id}`}
                    className="font-semibold text-gray-900 text-base leading-tight line-clamp-2"
                  >
                    {title}
                  </h3>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
