import { MetadataRoute } from 'next'
import { getProjects, ProjectListResponse } from '@/lib/api'

// Get base URL from environment variable or use localhost for development
function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  // Fallback for development
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000'
  }
  // Production fallback (should be set via env var)
  return 'https://mrimot.com'
}

// Fetch all projects from the API with pagination
async function getAllProjects(): Promise<{ id: number }[]> {
  try {
    const allProjects: { id: number }[] = []
    let page = 1
    const perPage = 100 // Maximum allowed by API
    let hasMore = true

    while (hasMore) {
      const response: ProjectListResponse = await getProjects({
        page,
        per_page: perPage,
      })

      if (response.projects && response.projects.length > 0) {
        allProjects.push(...response.projects.map((p) => ({ id: p.id })))
      }

      // Check if there are more pages
      hasMore = page < (response.total_pages || 1)
      page++
    }

    return allProjects
  } catch (error) {
    console.error('Error fetching projects for sitemap:', error)
    // Return empty array on error - sitemap will still include static pages
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl()
  const languages = ['en', 'bg']

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    // Homepage (root redirects to /en)
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    // Language-specific homepages
    ...languages.map((lang): MetadataRoute.Sitemap[0] => ({
      url: `${baseUrl}/${lang}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    })),
    // Listings pages
    ...languages.map((lang): MetadataRoute.Sitemap[0] => ({
      url: `${baseUrl}/${lang}/listings`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]

  // Dynamic routes - fetch all projects
  const projects = await getAllProjects()
  const dynamicRoutes: MetadataRoute.Sitemap = projects.flatMap((project) =>
    languages.map((lang): MetadataRoute.Sitemap[0] => ({
      url: `${baseUrl}/${lang}/listings/${project.id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  )

  return [...staticRoutes, ...dynamicRoutes]
}

