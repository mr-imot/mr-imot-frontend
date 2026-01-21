// Force dynamic behavior to prevent Vercel edge caching
// This ensures we always fetch fresh data from backend
export const dynamic = 'force-dynamic'

/**
 * Proxy sitemap index from backend.
 * Backend generates the complete sitemap index with all locales and chunks.
 * This route simply proxies the backend response to maintain single source of truth.
 * 
 * TEMPORARY: Using no-store cache control for initial deployment to break edge cache.
 * After verifying https://mrimot.com/sitemap.xml matches backend index, change back to:
 * Cache-Control: public, max-age=3600, s-maxage=3600
 */
export async function GET(): Promise<Response> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.mrimot.com'
    const baseApiUrl = apiUrl.replace(/\/$/, '')
    const backendIndexUrl = `${baseApiUrl}/api/v1/sitemaps/index.xml`
    
    // Always fetch fresh from backend (no Next.js caching)
    const response = await fetch(backendIndexUrl, {
      cache: 'no-store', // Force fresh fetch every time
    })
    
    if (!response.ok) {
      console.error('[sitemap] Backend sitemap index returned non-OK status:', response.status)
      // Return empty sitemap index on error (never 500 to Google)
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></sitemapindex>',
        {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'no-store', // Temporary: force cache refresh
          },
        }
      )
    }
    
    const xml = await response.text()
    
    // Return backend response as-is (backend already outputs https://mrimot.com/sitemaps/... URLs)
    // TEMPORARY: Using no-store to break edge cache. Change back after verification.
    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-store', // Temporary: force cache refresh for one deployment
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
          'Cache-Control': 'no-store', // Temporary: force cache refresh
        },
      }
    )
  }
}
