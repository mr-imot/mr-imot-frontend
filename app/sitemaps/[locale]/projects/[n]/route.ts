import { SUPPORTED_LOCALES } from '@/lib/dictionaries'

// Force dynamic so we always fetch from backend
export const dynamic = 'force-dynamic'

const SUPPORTED_SET = new Set(SUPPORTED_LOCALES)

/**
 * Proxy locale projects sitemap chunk from backend.
 * [n] captures the segment e.g. "1" for URL .../projects/1.xml.
 * Backend returns Content-Length: 0 but sends a body; we read body and return it
 * so clients receive the full XML (see P0 fix in docs/seo-live-checks.md).
 * Only accepts supported locales (en, bg, ru, gr); 404 otherwise.
 * On backend error: 502 + no-store so we don't publish "empty sitemap" as truth.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string; n: string }> }
): Promise<Response> {
  const { locale, n } = await params
  if (!SUPPORTED_SET.has(locale as 'en' | 'bg' | 'ru' | 'gr')) {
    return new Response(null, { status: 404 })
  }
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.mrimot.com'
    const baseApiUrl = apiUrl.replace(/\/$/, '')
    // n may be "1" or "1.xml" depending on routing; API expects 1.xml
    const chunk = n.endsWith('.xml') ? n : `${n}.xml`
    const backendUrl = `${baseApiUrl}/api/v1/sitemaps/${encodeURIComponent(locale)}/projects/${chunk}`

    const response = await fetch(backendUrl, {
      next: { revalidate: 60 },
      headers: { Accept: 'application/xml' },
    })

    if (!response.ok) {
      console.error('[sitemaps] Backend projects sitemap non-OK:', response.status, locale, chunk)
      return new Response(null, {
        status: 502,
        headers: { 'Cache-Control': 'no-store' },
      })
    }

    const xml = await response.text()
    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('[sitemaps] Error proxying projects sitemap:', error)
    return new Response(null, {
      status: 502,
      headers: { 'Cache-Control': 'no-store' },
    })
  }
}
