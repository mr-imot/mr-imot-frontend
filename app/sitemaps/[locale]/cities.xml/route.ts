import { SUPPORTED_LOCALES } from '@/lib/dictionaries'

export const revalidate = 300

const SUPPORTED_SET = new Set(SUPPORTED_LOCALES)

/**
 * Proxy locale sitemap (cities) from backend.
 * Backend returns Content-Length: 0 but sends a body; we read body and return it
 * so clients receive the full XML (see P0 fix in docs/seo-live-checks.md).
 * Only accepts supported locales (en, bg, ru, gr); 404 otherwise.
 * On backend error: 502 + no-store so we don't publish "empty sitemap" as truth.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> }
): Promise<Response> {
  const { locale } = await params
  if (!SUPPORTED_SET.has(locale as 'en' | 'bg' | 'ru' | 'gr')) {
    return new Response(null, { status: 404 })
  }
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.mrimot.com'
    const baseApiUrl = apiUrl.replace(/\/$/, '')
    const backendUrl = `${baseApiUrl}/api/v1/sitemaps/${encodeURIComponent(locale)}/cities.xml`

    const response = await fetch(backendUrl, {
      next: { revalidate: 300 },
      headers: { Accept: 'application/xml' },
    })

    if (!response.ok) {
      console.error('[sitemaps] Backend cities.xml non-OK:', response.status, locale)
      return new Response(null, {
        status: 502,
        headers: { 'Cache-Control': 'no-store' },
      })
    }

    const xml = await response.text()
    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    })
  } catch (error) {
    console.error('[sitemaps] Error proxying cities.xml:', error)
    return new Response(null, {
      status: 502,
      headers: { 'Cache-Control': 'no-store' },
    })
  }
}
