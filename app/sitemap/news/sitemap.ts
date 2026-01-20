import { MetadataRoute } from 'next'
import { getNewsPostsForLang, type BlogLang } from '@/lib/news-index'
import { getBaseUrl } from '@/lib/sitemap-utils'
import { newsArticleHref, type SupportedLocale } from '@/lib/routes'
import slugMapData from '@/lib/news-slug-map.json'

// Type-safe slug map (Edge Runtime compatible - JSON import works)
const slugMap = slugMapData as {
  slugToKey: Record<string, string>
  keyToSlugs: Record<string, Record<'en' | 'bg' | 'ru' | 'gr', string>>
}

export const revalidate = 3600 // 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl()
  const languages: SupportedLocale[] = ['en', 'bg', 'ru', 'gr']
  
  try {
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
    
    return newsRoutes
  } catch (error) {
    console.error('[sitemap] Error generating news sitemap:', error)
    return []
  }
}
