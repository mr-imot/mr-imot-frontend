import { MetadataRoute } from 'next'
import { getDevelopers, DevelopersListResponse } from '@/lib/api'
import { getBaseUrl, buildAlternates, fetchWithTimeoutAndRetry } from '@/lib/sitemap-utils'
import { developerHref, type SupportedLocale } from '@/lib/routes'

export const revalidate = 3600 // 1 hour

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
  
  try {
    const developers = await getAllDevelopers()
    const developerRoutes: MetadataRoute.Sitemap = developers.flatMap((developer) => {
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
    
    return developerRoutes
  } catch (error) {
    console.error('[sitemap] Error generating developers sitemap:', error)
    return []
  }
}
