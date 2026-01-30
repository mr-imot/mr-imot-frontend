export const revalidate = 300

/**
 * Proxy sitemap index from backend.
 * Backend generates the complete sitemap index with all locales and chunks.
 * Success responses cached 5 min (revalidate + Cache-Control); errors never cached.
 */
export async function GET(): Promise<Response> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.mrimot.com'
    const baseApiUrl = apiUrl.replace(/\/$/, '')
    const backendIndexUrl = `${baseApiUrl}/api/v1/sitemaps/index.xml`
    
    const response = await fetch(backendIndexUrl, {
      next: { revalidate: 300 },
    })
    
    if (!response.ok) {
      console.error('[sitemap] Backend sitemap index returned non-OK status:', response.status)
      // Return empty sitemap index on error (never 500 to Google); do not cache errors
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
        'Cache-Control': 'public, max-age=300, s-maxage=300',
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
