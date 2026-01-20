import { MetadataRoute } from 'next'
import { getBaseUrl, buildAlternates } from '@/lib/sitemap-utils'
import { homeHref, listingsHref, developersHref, aboutHref, contactHref, newsHref, type SupportedLocale } from '@/lib/routes'

export const revalidate = 3600 // 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl()
  const languages: SupportedLocale[] = ['en', 'bg', 'ru', 'gr']
  
  try {
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
      // Listings pages (map view)
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
    
    return staticRoutes
  } catch (error) {
    console.error('[sitemap] Error generating static sitemap:', error)
    return []
  }
}
