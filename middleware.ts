import { NextResponse, type NextRequest } from "next/server";
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

// Extend NextRequest to include Vercel's geo property
interface VercelRequest extends NextRequest {
  geo?: {
    country?: string
    region?: string
    city?: string
  }
}

const SUPPORTED_LOCALES = ['en', 'bg']
const DEFAULT_LOCALE = 'en'

function getLocale(request: NextRequest) {
  // Get the Accept-Language header
  const acceptLanguage = request.headers.get('accept-language') ?? undefined
  let headers = { 'accept-language': acceptLanguage }
  let languages = new Negotiator({ headers }).languages()
  
  // Match the preferred language with our supported locales
  return match(languages, SUPPORTED_LOCALES, DEFAULT_LOCALE)
}

export function middleware(request: VercelRequest) {
  const { pathname } = request.nextUrl

  // Handle explicit /en/ paths - redirect to root (English default)
  if (pathname.startsWith('/en/')) {
    const newPath = pathname.replace('/en', '') || '/'
    return NextResponse.redirect(new URL(newPath, request.url))
  }
  if (pathname === '/en') {
    return NextResponse.redirect(new URL('/', request.url))
  }

              // Bulgarian pretty slugs → internal canonical paths
              if (pathname.startsWith('/bg/')) {
                const map: Record<string, string> = {
                  '/bg/obiavi': '/bg/listings',
                  '/bg/stroiteli': '/bg/developers',
                  '/bg/za-nas': '/bg/about-us',
                  '/bg/kontakt': '/bg/contact',
                }
                for (const [from, to] of Object.entries(map)) {
                  if (pathname === from || pathname.startsWith(from + '/')) {
                    const url = request.nextUrl.clone()
                    url.pathname = pathname.replace(from, to)
                    return NextResponse.rewrite(url)
                  }
                }
              }
  
  // Skip middleware for API routes, static assets, and internal Next.js paths
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/health') ||
    pathname.includes('.') // Skip files with extensions (images, etc.)
  ) {
    return NextResponse.next()
  }

  // Check if pathname already includes a locale (only for non-default locales)
  const pathnameHasLocale = pathname.startsWith('/bg/') || pathname === '/bg'

  if (pathnameHasLocale) {
    return NextResponse.next()
  }

  // 1. Check cookie preference (user override) - HIGHEST PRIORITY
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) {
    if (cookieLocale === 'bg') {
      return NextResponse.redirect(new URL(`/bg${pathname}`, request.url))
    }
    // For English (default), rewrite internally to /en for [lang] route handling
    const url = request.nextUrl.clone()
    url.pathname = `/en${pathname}`
    return NextResponse.rewrite(url)
  }

  // 2. Check Vercel geo header (IP-based detection)
  const country = request.geo?.country?.toLowerCase()
  if (country === 'bg') {
    return NextResponse.redirect(new URL(`/bg${pathname}`, request.url))
  }

  // 3. Check Accept-Language header
  const negotiated = getLocale(request)
  if (negotiated && negotiated !== DEFAULT_LOCALE) {
    return NextResponse.redirect(new URL(`/${negotiated}${pathname}`, request.url))
  }

  // 4. Fallback to default locale (English) - rewrite internally to /en
  const url = request.nextUrl.clone()
  url.pathname = `/en${pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - API routes (/api/*)
    // - Static files (/_next/static/*)
    // - Images (/images/*)
    // - Health check (/health)
    // - Files with extensions (*.*)
    '/((?!api|_next/static|_next/image|images|favicon|health|.*\\.).*)',
  ],
}
