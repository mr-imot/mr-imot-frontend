// Force dynamic behavior to prevent Vercel edge caching
export const dynamic = 'force-dynamic'

/**
 * Proxy sitemap index from backend.
 * Backend generates the complete sitemap index with all locales and chunks.
 * Cache-Control: no-store so proxy never serves a stale index (see docs/seo-architecture.md Sitemap freshness).
 */
export async function GET(): Promise<Response> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.mrimot.com'
    const baseApiUrl = apiUrl.replace(/\/$/, '')
    const backendIndexUrl = `${baseApiUrl}/api/v1/sitemaps/index.xml`
    
    const response = await fetch(backendIndexUrl, {
      next: { revalidate: 60 }, // 1 minute - index updates quickly after backend changes
    })
    
    if (!response.ok) {
      console.error('[sitemap] Backend sitemap index returned non-OK status:', response.status)
      // Return empty sitemap index on error (never 500 to Google)
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></sitemapindex>',
        {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'no-store',
          },
        }
      )
    }
    
    const xml = await response.text()
    
    // Return backend response as-is (backend already outputs https://mrimot.com/sitemaps/... URLs)
    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-store',
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
          'Cache-Control': 'no-store',
        },
      }
    )
  }
}
