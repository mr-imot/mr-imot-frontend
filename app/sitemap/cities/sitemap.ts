import { MetadataRoute } from 'next'
import { getBaseUrl, buildAlternates } from '@/lib/sitemap-utils'
import { listingsHref, type SupportedLocale } from '@/lib/routes'

export const revalidate = 3600 // 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl()
  const languages: SupportedLocale[] = ['en', 'bg', 'ru', 'gr']
  
  try {
    const { ApiClient } = await import('@/lib/api')
    const apiClient = new ApiClient()
    const citiesData = await apiClient.getCities(10) // min_projects=10
    
    // Filter to Bulgaria only (Bulgaria-first rollout)
    const bgCities = citiesData.cities.filter(city => city.country_code === 'bg')
    
    const cityRoutes: MetadataRoute.Sitemap = bgCities.flatMap((city) => {
      // Build alternates once per city (shared across all language variants)
      const alternates = buildAlternates(baseUrl, (lang) => {
        const params = new URLSearchParams()
        params.set('city', city.city_key)
        return `${listingsHref(lang)}?${params.toString()}`
      })
      
      return languages.map((lang): MetadataRoute.Sitemap[0] => {
        const params = new URLSearchParams()
        params.set('city', city.city_key)
        const url = `${baseUrl}${listingsHref(lang)}?${params.toString()}`
        
        const route: MetadataRoute.Sitemap[0] = {
          url,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
          alternates,
        }
        
        // Use last_modified from API response
        if (city.last_modified) {
          const lm = new Date(city.last_modified)
          if (!isNaN(lm.getTime())) {
            route.lastModified = lm
          }
        }
        
        return route
      })
    })
    
    return cityRoutes
  } catch (error) {
    console.error('[sitemap] Error generating cities sitemap:', error)
    return []
  }
}
