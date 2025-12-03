import { MetadataRoute } from 'next'
import { getProjects, ProjectListResponse, getDevelopers, DevelopersListResponse } from '@/lib/api'

// Get base URL from environment variable or use production URL
function getBaseUrl(): string {
  let url: string
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    url = process.env.NEXT_PUBLIC_SITE_URL
  } else if (process.env.NODE_ENV === 'development') {
    url = 'https://mrimot.com'
  } else {
    url = 'https://mrimot.com'
  }
  // Remove trailing slash to prevent double slashes
  return url.replace(/\/$/, '')
}

// Fetch all active projects from the API with pagination
async function getAllActiveProjects(): Promise<{ id: number; slug?: string; updated_at?: string }[]> {
  try {
    const allProjects: { id: number; slug?: string; updated_at?: string }[] = []
    let page = 1
    const perPage = 100 // Maximum allowed by API
    let hasMore = true

    while (hasMore) {
      const response: ProjectListResponse = await getProjects({
        page,
        per_page: perPage,
      })

      if (response.projects && response.projects.length > 0) {
        // Filter to only active projects and include slug
        const activeProjects = response.projects
          .filter((p) => p.status === 'active')
          .map((p) => ({ 
            id: p.id,
            slug: p.slug,
            updated_at: p.updated_at
          }))
        allProjects.push(...activeProjects)
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

// Fetch all developers from the API with pagination
async function getAllDevelopers(): Promise<{ id: string }[]> {
  try {
    const allDevelopers: { id: string }[] = []
    let page = 1
    const perPage = 100 // Maximum allowed by API
    let hasMore = true

    while (hasMore) {
      const response: DevelopersListResponse = await getDevelopers({
        page,
        per_page: perPage,
      })

      if (response.developers && response.developers.length > 0) {
        allDevelopers.push(...response.developers.map((d) => ({ id: d.id })))
      }

      // Check if there are more pages
      hasMore = page < (response.total_pages || 1)
      page++
    }

    return allDevelopers
  } catch (error) {
    console.error('Error fetching developers for sitemap:', error)
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
    // Listings pages (using clean English URL)
    {
      url: `${baseUrl}/listings`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/bg/obiavi`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    // Developers pages
    ...languages.map((lang): MetadataRoute.Sitemap[0] => ({
      url: `${baseUrl}/${lang}/developers`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    // About Us pages (using pretty URLs for Bulgarian)
    {
      url: `${baseUrl}/en/about-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/bg/za-mistar-imot`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    // Contact pages (using pretty URLs for Bulgarian)
    {
      url: `${baseUrl}/en/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/bg/kontakt`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]

  // Dynamic routes - fetch all active projects (filtered by status)
  const projects = await getAllActiveProjects()
  const projectRoutes: MetadataRoute.Sitemap = projects.flatMap((project) =>
    languages.map((lang): MetadataRoute.Sitemap[0] => {
      // Use slug-based URL if available, otherwise fallback to ID
      const urlPath = project.slug || String(project.id)
      const url = lang === 'bg' 
        ? `${baseUrl}/bg/obiavi/${urlPath}`
        : `${baseUrl}/listings/${urlPath}` // Clean English URL without /en/
      
      // Use updated_at if available, otherwise use current date
      const lastModified = project.updated_at 
        ? new Date(project.updated_at)
        : new Date()
      
      return {
        url,
        lastModified,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }
    })
  )

  // Dynamic routes - fetch all developers
  const developers = await getAllDevelopers()
  const developerRoutes: MetadataRoute.Sitemap = developers.flatMap((developer) =>
    languages.map((lang): MetadataRoute.Sitemap[0] => ({
      url: `${baseUrl}/${lang === 'bg' ? 'bg/stroiteli' : 'en/developers'}/${developer.id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  )

  return [...staticRoutes, ...projectRoutes, ...developerRoutes]
}

