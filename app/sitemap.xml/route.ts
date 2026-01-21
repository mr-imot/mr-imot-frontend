// Force dynamic behavior to prevent Vercel edge caching
// This ensures we always fetch fresh data from backend
export const dynamic = 'force-dynamic'

/**
 * Proxy sitemap index from backend.
 * Backend generates the complete sitemap index with all locales and chunks.
 * This route simply proxies the backend response to maintain single source of truth.
 */
export async function GET(): Promise<Response> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.mrimot.com'
    const baseApiUrl = apiUrl.replace(/\/$/, '')
    const backendIndexUrl = `${baseApiUrl}/api/v1/sitemaps/index.xml`
    
    // Fetch from backend with revalidation (cached for 1 hour)
    const response = await fetch(backendIndexUrl, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })
    
    if (!response.ok) {
      console.error('[sitemap] Backend sitemap index returned non-OK status:', response.status)
      // Return empty sitemap index on error (never 500 to Google)
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></sitemapindex>',
        {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
          },
        }
      )
    }
    
    const xml = await response.text()
    
    // Return backend response as-is (backend already outputs https://mrimot.com/sitemaps/... URLs)
    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('[sitemap] Error proxying backend sitemap index:', error)
    // Return empty sitemap index on error (never 500 to Google)
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></sitemapindex>',
      {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      }
    )
  }
}
