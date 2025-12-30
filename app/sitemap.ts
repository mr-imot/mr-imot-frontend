import { MetadataRoute } from 'next'
import { getDevelopers, getProjects, DevelopersListResponse, ProjectListResponse } from '@/lib/api'
import { getAllPostsMeta } from '@/lib/news'
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

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    // Homepage (canonical for English)
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    // Language-specific homepages (avoid duplicate EN root)
    {
      url: `${baseUrl}/bg`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/ru`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/gr`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    // Listings pages (using clean English URL)
    {
      url: `${baseUrl}/listings`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ru/obyavleniya`,
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
      url:
        lang === 'bg'
          ? `${baseUrl}/bg/stroiteli`
          : lang === 'ru'
            ? `${baseUrl}/ru/zastroyshchiki`
            : lang === 'gr'
              ? `${baseUrl}/gr/kataskeuastes`
              : `${baseUrl}/developers`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    // About Us pages (using pretty URLs for Bulgarian)
    {
      url: `${baseUrl}/about-mister-imot`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/ru/o-mister-imot`,
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
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/ru/kontakty`,
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
    // News indexes (localized slugs)
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/bg/novini`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/ru/novosti`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/gr/eidhseis`,
      lastModified: new Date(),
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
      url: `${baseUrl}/${
        lang === 'bg'
          ? 'bg/stroiteli'
          : lang === 'ru'
            ? 'ru/zastroyshchiki'
            : lang === 'gr'
              ? 'gr/kataskeuastes'
              : 'developers'
      }/${developer.slug || developer.id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  )

  // Fetch all news posts with error handling (similar to projects/developers)
  const newsPosts = await Promise.all(
    languages.map(async (lang) => {
      try {
        const posts = await getAllPostsMeta(lang as 'en' | 'bg' | 'ru' | 'gr')
        
        if (!posts || posts.length === 0) {
          console.warn(`[Sitemap] No news posts found for language: ${lang}`)
          return []
        }

        return posts.map((post) => ({
          url:
            lang === 'en'
              ? `${baseUrl}/news/${post.slug}`
              : lang === 'bg'
                ? `${baseUrl}/bg/novini/${post.slug}`
                : lang === 'ru'
                  ? `${baseUrl}/ru/novosti/${post.slug}`
                  : `${baseUrl}/gr/eidhseis/${post.slug}`,
          lastModified: post.date ? new Date(post.date) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        }))
      } catch (error) {
        console.error(`[Sitemap] Error fetching news posts for ${lang}:`, error)
        // Return empty array on error - sitemap will still include other content
        return []
      }
    })
  )

  const newsRoutes = newsPosts.flat()

  return [...staticRoutes, ...projectRoutes, ...developerRoutes, ...newsRoutes]
}

