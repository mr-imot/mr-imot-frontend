import { MetadataRoute } from 'next'
import { getDevelopers, getProjects, DevelopersListResponse, ProjectListResponse } from '@/lib/api'
import { getNewsPostsForLang, type BlogLang } from '@/lib/news-index'
import { getSiteUrl } from '@/lib/seo'
import { PUBLIC_ROUTES, homeHref, listingsHref, listingHref, developersHref, developerHref, newsHref, newsArticleHref, aboutHref, contactHref, type SupportedLocale } from '@/lib/routes'
import slugMapData from '@/lib/news-slug-map.json'

// Type-safe slug map (Edge Runtime compatible - JSON import works)
const slugMap = slugMapData as {
  slugToKey: Record<string, string>
  keyToSlugs: Record<string, Record<'en' | 'bg' | 'ru' | 'gr', string>>
}

// Refresh sitemap periodically to pick up new content
export const revalidate = 3600 // 1 hour

// Sitemap-specific fetch timeout (10 seconds - enough for API but prevents hanging)
const SITEMAP_FETCH_TIMEOUT = 10000 // 10 seconds
const SITEMAP_RETRY_DELAY = 300 // 300ms delay between retries

// Helper to check if error is a network/timeout error that should be retried
function isRetryableError(error: any): boolean {
  if (!error) return false
  
  // Check for ETIMEDOUT, ECONNRESET, or other network errors
  const errorMessage = error.message?.toLowerCase() || ''
  const errorCode = error.code?.toLowerCase() || error.cause?.code?.toLowerCase() || ''
  
  return (
    errorMessage.includes('timeout') ||
    errorMessage.includes('fetch failed') ||
    errorMessage.includes('network') ||
    errorCode === 'etimedout' ||
    errorCode === 'econnreset' ||
    errorCode === 'econnrefused' ||
    error.name === 'TypeError' && errorMessage.includes('fetch')
  )
}

// Fetch wrapper with timeout and retry for sitemap API calls
async function fetchWithTimeoutAndRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  url?: string
): Promise<T> {
  let lastError: any
  
  // Try up to 2 times (initial + 1 retry)
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      // Race the operation against a timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Operation timeout after ${SITEMAP_FETCH_TIMEOUT}ms`))
        }, SITEMAP_FETCH_TIMEOUT)
      })
      
      const result = await Promise.race([operation(), timeoutPromise])
      return result
    } catch (error: any) {
      lastError = error
      
      // Log with context
      const errorContext = {
        operation: operationName,
        attempt: attempt + 1,
        url: url || 'unknown',
        error: error.message || String(error),
        code: error.code || error.cause?.code,
        syscall: error.syscall || error.cause?.syscall,
      }
      
      if (attempt === 0 && isRetryableError(error)) {
        // Log retry attempt
        console.warn(`[sitemap] ${operationName} failed, retrying...`, errorContext)
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, SITEMAP_RETRY_DELAY))
        continue
      } else {
        // Final failure or non-retryable error
        console.error(`[sitemap] ${operationName} failed after ${attempt + 1} attempt(s)`, errorContext)
        throw error
      }
    }
  }
  
  throw lastError
}

// Get base URL - hardcoded production domain for SEO
// See: https://www.reddit.com/r/nextjs/s/otIdK3NiqK
function getBaseUrl(): string {
  return getSiteUrl()
}

// Helper to build hreflang alternates for any route type
// Maps internal locale codes (en, bg, ru, gr) to hreflang codes (en, bg, ru, el)
function buildAlternates(
  baseUrl: string,
  routeBuilder: (lang: SupportedLocale) => string
): { languages: Record<string, string> } {
  // Normalize: if English route is '/', use baseUrl (no trailing slash) to avoid https://mrimot.com/
  const enRoute = routeBuilder('en')
  const enUrl = enRoute === '/' ? baseUrl : `${baseUrl}${enRoute}`
  
  return {
    languages: {
      en: enUrl,
      bg: `${baseUrl}${routeBuilder('bg')}`,
      ru: `${baseUrl}${routeBuilder('ru')}`,
      el: `${baseUrl}${routeBuilder('gr')}`, // Greek URL segment is 'gr' but hreflang is 'el'
      'x-default': enUrl, // Use same normalized URL
    },
  }
}

// Fetch all active projects from the API with pagination (public endpoint, no cookies)
async function getAllActiveProjects(): Promise<{ id: number; slug?: string; updated_at?: string; created_at?: string }[]> {
  const allProjects: { id: number; slug?: string; updated_at?: string; created_at?: string }[] = []
  let page = 1
  const perPage = 100
  let hasMore = true
  let lastSuccessfulPage = 0

  try {
    while (hasMore) {
      try {
        const data: ProjectListResponse = await fetchWithTimeoutAndRetry(
          () => getProjects({
            page,
            per_page: perPage,
            status: 'active',
          }),
          'projects fetch',
          `/api/v1/projects?page=${page}&per_page=${perPage}&status=active`
        )

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
              created_at: p.created_at,
            }))
          allProjects.push(...activeProjects)
          lastSuccessfulPage = page
        }

        hasMore = page < (data?.total_pages || 1)
        page++
      } catch (error: any) {
        // If we've successfully fetched at least one page, return partial results
        if (lastSuccessfulPage > 0) {
          console.warn(`[sitemap] Projects fetch failed at page ${page}, returning ${allProjects.length} projects from ${lastSuccessfulPage} page(s)`)
          break
        }
        // If first page fails, throw to be caught by outer try-catch
        throw error
      }
    }

    return allProjects
  } catch (error) {
    console.error('[sitemap] Error fetching projects for sitemap (public):', {
      error: error instanceof Error ? error.message : String(error),
      code: (error as any)?.code || (error as any)?.cause?.code,
      fetchedPages: lastSuccessfulPage,
      projectsCount: allProjects.length,
    })
    // Return partial results if we got any, otherwise empty array
    return allProjects
  }
}

// Fetch all developers from the API with pagination
async function getAllDevelopers(): Promise<{ id: string; slug?: string }[]> {
  const allDevelopers: { id: string; slug?: string }[] = []
  let page = 1
  const perPage = 100 // Maximum allowed by API
  let hasMore = true
  let lastSuccessfulPage = 0

  try {
    while (hasMore) {
      try {
        const response: DevelopersListResponse = await fetchWithTimeoutAndRetry(
          () => getDevelopers({
            page,
            per_page: perPage,
          }),
          'developers fetch',
          `/api/v1/developers?page=${page}&per_page=${perPage}`
        )

        if (response.developers && response.developers.length > 0) {
          allDevelopers.push(...response.developers.map((d) => ({ id: d.id, slug: d.slug })))
          lastSuccessfulPage = page
        }

        // Check if there are more pages
        hasMore = page < (response.total_pages || 1)
        page++
      } catch (error: any) {
        // If we've successfully fetched at least one page, return partial results
        if (lastSuccessfulPage > 0) {
          console.warn(`[sitemap] Developers fetch failed at page ${page}, returning ${allDevelopers.length} developers from ${lastSuccessfulPage} page(s)`)
          break
        }
        // If first page fails, throw to be caught by outer try-catch
        throw error
      }
    }

    return allDevelopers
  } catch (error) {
    console.error('[sitemap] Error fetching developers for sitemap:', {
      error: error instanceof Error ? error.message : String(error),
      code: (error as any)?.code || (error as any)?.cause?.code,
      fetchedPages: lastSuccessfulPage,
      developersCount: allDevelopers.length,
    })
    // Return partial results if we got any, otherwise empty array
    return allDevelopers
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl()
  const languages: SupportedLocale[] = ['en', 'bg', 'ru', 'gr']

  // Static routes (no lastModified - these are stable pages)
  const staticRoutes: MetadataRoute.Sitemap = [
    // Homepages
    ...languages.map((lang): MetadataRoute.Sitemap[0] => {
      const homePath = homeHref(lang)
      // Normalize: if home route is '/', use baseUrl (no trailing slash) to avoid https://mrimot.com/
      const url = homePath === '/' ? baseUrl : `${baseUrl}${homePath}`
      
      return {
        url,
        changeFrequency: 'daily' as const,
        priority: 1.0,
        alternates: buildAlternates(baseUrl, homeHref),
      }
    }),
    // Listings pages
    ...languages.map((lang): MetadataRoute.Sitemap[0] => ({
      url: `${baseUrl}${listingsHref(lang)}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternates: buildAlternates(baseUrl, listingsHref),
    })),
    // Developers pages
    ...languages.map((lang): MetadataRoute.Sitemap[0] => ({
      url: `${baseUrl}${developersHref(lang)}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternates: buildAlternates(baseUrl, developersHref),
    })),
    // About Us pages
    ...languages.map((lang): MetadataRoute.Sitemap[0] => ({
      url: `${baseUrl}${aboutHref(lang)}`,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
      alternates: buildAlternates(baseUrl, aboutHref),
    })),
    // Contact pages
    ...languages.map((lang): MetadataRoute.Sitemap[0] => ({
      url: `${baseUrl}${contactHref(lang)}`,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
      alternates: buildAlternates(baseUrl, contactHref),
    })),
    // News indexes
    ...languages.map((lang): MetadataRoute.Sitemap[0] => ({
      url: `${baseUrl}${newsHref(lang)}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      alternates: buildAlternates(baseUrl, newsHref),
    })),
  ]

  // Dynamic routes - fetch all active projects (filtered by status)
  // Wrap in try-catch for extra safety - getAllActiveProjects already handles errors internally
  let projectRoutes: MetadataRoute.Sitemap = []
  try {
    const projects = await getAllActiveProjects()
    projectRoutes = projects.flatMap((project) => {
      // Use slug-based URL if available, otherwise fallback to ID
      const identifier = project.slug || String(project.id)
      
      // Build alternates once per project (shared across all language variants)
      const alternates = buildAlternates(baseUrl, (lang) => listingHref(lang, identifier))
      
      return languages.map((lang): MetadataRoute.Sitemap[0] => {
        const url = `${baseUrl}${listingHref(lang, identifier)}`
        
        // Use updated_at if available, fallback to created_at, otherwise omit lastModified
        const route: MetadataRoute.Sitemap[0] = {
          url,
          changeFrequency: 'monthly' as const,
          priority: 0.6,
          alternates,
        }
        
        // Prefer updated_at, fallback to created_at
        const dateValue = project.updated_at || project.created_at
        if (dateValue) {
          const lm = new Date(dateValue)
          if (!isNaN(lm.getTime())) {
            route.lastModified = lm
          }
        }
        
        return route
      })
    })
  } catch (error) {
    console.error('[sitemap] Unexpected error processing projects:', error)
    // Continue with empty projectRoutes - static routes will still be returned
  }

  // Dynamic routes - fetch all developers (no lastModified - API doesn't provide updated_at)
  // Wrap in try-catch for extra safety - getAllDevelopers already handles errors internally
  let developerRoutes: MetadataRoute.Sitemap = []
  try {
    const developers = await getAllDevelopers()
    developerRoutes = developers.flatMap((developer) => {
      const identifier = developer.slug || String(developer.id)
      
      // Build alternates once per developer (shared across all language variants)
      const alternates = buildAlternates(baseUrl, (lang) => developerHref(lang, identifier))
      
      return languages.map((lang): MetadataRoute.Sitemap[0] => ({
        url: `${baseUrl}${developerHref(lang, identifier)}`,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
        alternates,
      }))
    })
  } catch (error) {
    console.error('[sitemap] Unexpected error processing developers:', error)
    // Continue with empty developerRoutes - static routes will still be returned
  }

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
        // Find translationKey for this slug to get alternate slugs
        const translationKey = slugMap.slugToKey[post.slug]
        const alternateSlugs = translationKey ? slugMap.keyToSlugs[translationKey] : null
        
        // Build alternates using alternate slugs if available, otherwise use current slug for that language
        const alternates = {
          languages: {
            en: `${baseUrl}${alternateSlugs?.en ? newsArticleHref('en', alternateSlugs.en) : (lang === 'en' ? post.urlPath : newsArticleHref('en', post.slug))}`,
            bg: `${baseUrl}${alternateSlugs?.bg ? newsArticleHref('bg', alternateSlugs.bg) : (lang === 'bg' ? post.urlPath : newsArticleHref('bg', post.slug))}`,
            ru: `${baseUrl}${alternateSlugs?.ru ? newsArticleHref('ru', alternateSlugs.ru) : (lang === 'ru' ? post.urlPath : newsArticleHref('ru', post.slug))}`,
            el: `${baseUrl}${alternateSlugs?.gr ? newsArticleHref('gr', alternateSlugs.gr) : (lang === 'gr' ? post.urlPath : newsArticleHref('gr', post.slug))}`,
            'x-default': `${baseUrl}${alternateSlugs?.en ? newsArticleHref('en', alternateSlugs.en) : (lang === 'en' ? post.urlPath : newsArticleHref('en', post.slug))}`,
          },
        }
        
        const route: MetadataRoute.Sitemap[0] = {
          url: `${baseUrl}${post.urlPath}`,
          changeFrequency: 'weekly' as const,
          priority: 0.6,
          alternates,
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

