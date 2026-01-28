import { MetadataRoute } from 'next'
import { apiClient } from '@/lib/api'
import { getBaseUrl, buildAlternates } from '@/lib/sitemap-utils'
import { cityListingsHref } from '@/lib/routes'

export const revalidate = 3600 // 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl()
  
  try {
    const citiesData = await apiClient.getCities(10) // min_projects=10
    
    // Filter to Bulgaria only (case-insensitive)
    const bgCities = citiesData.cities.filter(
      city => (city.country_code || '').toLowerCase() === 'bg'
    )
    
    // One URL per city (EN as main) + alternates for other languages
    const cityRoutes: MetadataRoute.Sitemap = bgCities.map((city) => {
      const alternates = buildAlternates(baseUrl, (lang) =>
        cityListingsHref(lang, city.city_key)
      )

      const route: MetadataRoute.Sitemap[0] = {
        url: `${baseUrl}${cityListingsHref('en', city.city_key)}`, // main URL
        changeFrequency: 'weekly' as const,
        priority: 0.7,
        alternates,
      }

      if (city.last_modified) {
        const lm = new Date(city.last_modified)
        if (!isNaN(lm.getTime())) {
          route.lastModified = lm
        }
      }

      return route
    })
    
    return cityRoutes
  } catch (error) {
    console.error('[sitemap] Error generating cities sitemap:', error)
    return []
  }
}
