import { MetadataRoute } from 'next'
import { getDevelopers, getProjects, DevelopersListResponse, ProjectListResponse } from '@/lib/api'
import { getNewsPostsForLang, type BlogLang } from '@/lib/news-index'
import { getSiteUrl } from '@/lib/seo'

// Refresh sitemap periodically to pick up new content
export const revalidate = 3600 // 1 hour

// Get base URL - hardcoded production domain for SEO
// See: https://www.reddit.com/r/nextjs/s/otIdK3NiqK
function getBaseUrl(): string {
  return getSiteUrl()
}

// Fetch all active projects from the API with pagination (public endpoint, no cookies)
async function getAllActiveProjects(): Promise<{ id: number; slug?: string; updated_at?: string }[]> {
  try {
    const allProjects: { id: number; slug?: string; updated_at?: string }[] = []
    let page = 1
    const perPage = 100
    let hasMore = true

    while (hasMore) {
      const data: ProjectListResponse = await getProjects({
        page,
        per_page: perPage,
        status: 'active',
      })

      const projects = data?.projects || []
      if (projects.length > 0) {
        const activeProjects = projects
          // API might omit status for public feed; include items unless explicitly inactive
          .filter((p) => {
            const status = (p.status || '').toLowerCase()
            return status === '' || status === 'active'
          })
          .map((p) => ({
            id: Number(p.id),
            slug: p.slug,
            updated_at: p.updated_at,
          }))
        allProjects.push(...activeProjects)
      }

      hasMore = page < (data?.total_pages || 1)
      page++
    }

    return allProjects
  } catch (error) {
    console.error('Error fetching projects for sitemap (public):', error)
    return []
  }
}

// Fetch all developers from the API with pagination
async function getAllDevelopers(): Promise<{ id: string; slug?: string }[]> {
  try {
    const allDevelopers: { id: string; slug?: string }[] = []
    let page = 1
    const perPage = 100 // Maximum allowed by API
    let hasMore = true

    while (hasMore) {
      const response: DevelopersListResponse = await getDevelopers({
        page,
        per_page: perPage,
      })

      if (response.developers && response.developers.length > 0) {
        allDevelopers.push(...response.developers.map((d) => ({ id: d.id, slug: d.slug })))
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
  const languages = ['en', 'bg', 'ru', 'gr']

  // Static routes (no lastModified - these are stable pages)
  const staticRoutes: MetadataRoute.Sitemap = [
    // Homepage (canonical for English)
    {
      url: baseUrl,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    // Language-specific homepages (avoid duplicate EN root)
    {
      url: `${baseUrl}/bg`,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/ru`,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/gr`,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    // Listings pages (using clean English URL)
    {
      url: `${baseUrl}/listings`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ru/obyavleniya`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/bg/obiavi`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    // Developers pages
    ...languages.map((lang): MetadataRoute.Sitemap[0] => ({
      url:
        lang === 'bg'
          ? `${baseUrl}/bg/stroiteli`
          : lang === 'ru'
            ? `${baseUrl}/ru/zastroyshchiki`
            : lang === 'gr'
              ? `${baseUrl}/gr/kataskeuastes`
              : `${baseUrl}/developers`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    // About Us pages (using pretty URLs for Bulgarian)
    {
      url: `${baseUrl}/about-mister-imot`,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/ru/o-mister-imot`,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/bg/za-mistar-imot`,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    // Contact pages (using pretty URLs for Bulgarian)
    {
      url: `${baseUrl}/contact`,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/ru/kontakty`,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/bg/kontakt`,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    // News indexes (localized slugs)
    {
      url: `${baseUrl}/news`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/bg/novini`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/ru/novosti`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/gr/eidhseis`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
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
        : lang === 'ru'
          ? `${baseUrl}/ru/obyavleniya/${urlPath}`
          : lang === 'gr'
            ? `${baseUrl}/gr/aggelies/${urlPath}`
            : `${baseUrl}/listings/${urlPath}` // Clean English URL without /en/
      
      // Use updated_at if available and valid, otherwise omit lastModified
      const route: MetadataRoute.Sitemap[0] = {
        url,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }
      
      if (project.updated_at) {
        const lm = new Date(project.updated_at)
        if (!isNaN(lm.getTime())) {
          route.lastModified = lm
        }
      }
      
      return route
    })
  )

  // Dynamic routes - fetch all developers (no lastModified - API doesn't provide updated_at)
  const developers = await getAllDevelopers()
  const developerRoutes: MetadataRoute.Sitemap = developers.flatMap((developer) =>
    languages.map((lang): MetadataRoute.Sitemap[0] => ({
      url: `${baseUrl}/${
        lang === 'bg'
          ? 'bg/stroiteli'
          : lang === 'ru'
            ? 'ru/zastroyshchiki'
            : lang === 'gr'
              ? 'gr/kataskeuastes'
              : 'developers'
      }/${developer.slug || developer.id}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  )

  // Fetch all news posts from build-time generated index (no filesystem reads at runtime)
  const newsRoutes: MetadataRoute.Sitemap = []
  for (const lang of languages) {
    try {
      const posts = getNewsPostsForLang(lang as BlogLang)
      
      if (!posts || posts.length === 0) {
        console.warn(`[Sitemap] No news posts found for language: ${lang}`)
        continue
      }

      const langRoutes = posts.map((post) => {
        const route: MetadataRoute.Sitemap[0] = {
          url: `${baseUrl}${post.urlPath}`,
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        }
        
        // Only include lastModified if valid
        const lm = new Date(post.lastmod)
        if (!isNaN(lm.getTime())) {
          route.lastModified = lm
        }
        
        return route
      })
      
      newsRoutes.push(...langRoutes)
    } catch (error) {
      console.error(`[Sitemap] Error fetching news posts for ${lang}:`, error)
      // Continue to next language - sitemap will still include other content
    }
  }

  return [...staticRoutes, ...projectRoutes, ...developerRoutes, ...newsRoutes]
}

