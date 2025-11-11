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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip static files and special paths immediately (before any processing)
  // Also skip not-found pages and 404 trigger routes to prevent middleware interference
  if (
    pathname.includes('.') || // Any file with extension (.txt, .xml, .ico, etc.)
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/images') ||
    pathname === '/not-found' ||
    pathname === '/en/not-found' ||
    pathname === '/bg/not-found' ||
    pathname === '/en/__404__' ||
    pathname === '/bg/__404__'
  ) {
    return NextResponse.next()
  }
  

  // Handle explicit /en/ paths - redirect to root (English default)
  // BUT exclude not-found pages and register to prevent redirect loops and preserve query params
  if (pathname.startsWith('/en/') && pathname !== '/en/not-found' && pathname !== '/en/register') {
    const url = request.nextUrl.clone()
    const newPath = pathname.replace('/en', '') || '/'
    url.pathname = newPath
    // Query params are automatically preserved in the cloned URL
    return NextResponse.redirect(url)
  }
  if (pathname === '/en') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Handle old /listing/ route - redirect to proper localized route
  if (pathname.startsWith('/listing/')) {
    const listingId = pathname.replace('/listing/', '')
    
    // Check cookie preference first
    const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
    if (cookieLocale === 'bg') {
      return NextResponse.redirect(new URL(`/bg/obiavi/${listingId}`, request.url))
    } else {
      return NextResponse.redirect(new URL(`/en/listings/${listingId}`, request.url))
    }
  }

  // Handle /bg/listing/ route - redirect to /bg/obiavi/
  if (pathname.startsWith('/bg/listing/')) {
    const listingId = pathname.replace('/bg/listing/', '')
    return NextResponse.redirect(new URL(`/bg/obiavi/${listingId}`, request.url))
  }

  // Handle /en/listing/ route - redirect to /en/listings/
  if (pathname.startsWith('/en/listing/')) {
    const listingId = pathname.replace('/en/listing/', '')
    return NextResponse.redirect(new URL(`/en/listings/${listingId}`, request.url))
  }

  // Handle /register route - block access without type=developer
  if (pathname === '/register') {
    const url = request.nextUrl.clone()
    const type = url.searchParams.get('type')
    
    // Only allow developer registration - redirect others to a non-existent route
    // This will trigger Next.js not-found handler naturally
    if (type !== 'developer') {
      // Check cookie preference for locale
      const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
      const locale = cookieLocale === 'bg' ? 'bg' : 'en'
      // Redirect to a route that doesn't exist to trigger not-found naturally
      return NextResponse.redirect(new URL(`/${locale}/__404__`, request.url))
    }
    
    // Check cookie preference first
    const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
    if (cookieLocale === 'bg') {
      url.pathname = '/bg/register'
    } else {
      // Rewrite to /en/register internally
      url.pathname = '/en/register'
    }
    
    return NextResponse.rewrite(url)
  }

  // Handle /forgot-password route specially - needs locale prefix first
  if (pathname === '/forgot-password') {
    const url = request.nextUrl.clone()
    
    // Check cookie preference first
    const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
    if (cookieLocale === 'bg') {
      url.pathname = '/bg/forgot-password'
    } else {
      // Rewrite to /en/forgot-password internally
      url.pathname = '/en/forgot-password'
    }
    
    return NextResponse.rewrite(url)
  }
  
  // Handle /bg/register - block access without type=developer
  if (pathname === '/bg/register') {
    const url = request.nextUrl.clone()
    const type = url.searchParams.get('type')
    
    // Only allow developer registration - redirect others to trigger not-found
    if (type !== 'developer') {
      // Redirect to non-existent route to trigger not-found naturally
      return NextResponse.redirect(new URL('/bg/__404__', request.url))
    }
  }

  // Handle /en/register - block access without type=developer
  if (pathname === '/en/register') {
    const url = request.nextUrl.clone()
    const type = url.searchParams.get('type')
    
    // Only allow developer registration - redirect others to trigger not-found
    if (type !== 'developer') {
      // Redirect to non-existent route to trigger not-found naturally
      return NextResponse.redirect(new URL('/en/__404__', request.url))
    }
  }

  // Note: no pretty slug for register in BG; '/bg/register' is canonical

  // English pretty slugs → internal canonical paths
  if (pathname.startsWith('/en/') || (!pathname.startsWith('/bg/') && !pathname.startsWith('/en/'))) {
    const englishMap: Record<string, string> = {
      '/en/about-mister-imot': '/en/about-us',
      '/about-mister-imot': '/en/about-us',
    }
    for (const [from, to] of Object.entries(englishMap)) {
      if (pathname === from || pathname.startsWith(from + '/')) {
        const url = request.nextUrl.clone()
        url.pathname = pathname.replace(from, to)
        return NextResponse.rewrite(url)
      }
    }
  }

  // Bulgarian pretty slugs → internal canonical paths
  if (pathname.startsWith('/bg/')) {
    const map: Record<string, string> = {
      '/bg/obiavi': '/bg/listings',
      '/bg/stroiteli': '/bg/developers',
      '/bg/za-mistar-imot': '/bg/about-us',
      '/bg/kontakt': '/bg/contact',
      '/bg/login': '/bg/login',
    }
    for (const [from, to] of Object.entries(map)) {
      if (pathname === from || pathname.startsWith(from + '/')) {
        const url = request.nextUrl.clone()
        url.pathname = pathname.replace(from, to)
        return NextResponse.rewrite(url)
      }
    }
  }
  
  // Skip middleware for API routes, static assets, internal Next.js paths, and non-localized pages
  const nonLocalizedPaths = [
    '/api/',
    '/_next/',
    '/images/',
    '/favicon',
    '/health',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/admin/',
    '/buyer/',
    '/test-api',
    '/debug',
    '/design-system',
    '/maintenance',
    '/robots.txt',
    '/sitemap.xml',
  ]
  
  if (
    nonLocalizedPaths.some(path => pathname.startsWith(path)) ||
    pathname.includes('.') // Skip files with extensions (images, etc.)
  ) {
    return NextResponse.next()
  }

  // Check if pathname already includes a locale (only for non-default locales)
  // Also allow /en/not-found and /bg/not-found to pass through
  const pathnameHasLocale = pathname.startsWith('/bg/') || pathname === '/bg'
  const isNotFoundPage = pathname === '/not-found' || pathname === '/en/not-found' || pathname === '/bg/not-found'

  if (pathnameHasLocale || isNotFoundPage) {
    return NextResponse.next()
  }

  // 1. Check cookie preference (user override) - HIGHEST PRIORITY
  // BUT exclude not-found pages to prevent redirect loops
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale) && pathname !== '/not-found' && !pathname.startsWith('/en/not-found') && !pathname.startsWith('/bg/not-found')) {
    if (cookieLocale === 'bg') {
      return NextResponse.redirect(new URL(`/bg${pathname}`, request.url))
    }
    // For English (default), rewrite internally to /en for [lang] route handling
    // But skip if pathname already starts with /en/
    if (!pathname.startsWith('/en/')) {
      const url = request.nextUrl.clone()
      url.pathname = `/en${pathname}`
      return NextResponse.rewrite(url)
    }
  }

  // 2. Check Vercel geo header (IP-based detection)
  // Note: request.geo might be undefined during cold starts or in preview deployments
  // Cast to any to access geo property which is injected by Vercel Edge
  const geo = (request as any).geo
  let country = geo?.country?.toUpperCase()
  
  // Fallback to x-vercel-ip-country header if geo is not available
  if (!country) {
    country = request.headers.get('x-vercel-ip-country')?.toUpperCase() || undefined
  }
  
  if (country === 'BG') {
    const response = NextResponse.redirect(new URL(`/bg${pathname}`, request.url))
    // Set cookie to persist Bulgarian preference (so we don't re-detect on every request)
    response.cookies.set('NEXT_LOCALE', 'bg', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
    })
    return response
  }

  // 3. Check Accept-Language header
  // BUT exclude not-found pages to prevent redirect loops
  const negotiated = getLocale(request)
  if (negotiated && negotiated !== DEFAULT_LOCALE && !isNotFoundPage) {
    return NextResponse.redirect(new URL(`/${negotiated}${pathname}`, request.url))
  }

  // 4. Fallback to default locale (English) - rewrite internally to /en
  // BUT exclude not-found pages and paths that already start with /en/
  if (!isNotFoundPage && !pathname.startsWith('/en/')) {
    const url = request.nextUrl.clone()
    url.pathname = `/en${pathname}`
    return NextResponse.rewrite(url)
  }
  
  // If it's a not-found page or already has /en/, just pass through
  return NextResponse.next()
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
