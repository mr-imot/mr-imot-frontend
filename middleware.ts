import { NextResponse, type NextRequest } from "next/server";
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import slugMapData from '@/lib/news-slug-map.json'

// Type-safe slug map (Edge Runtime compatible - JSON import works)
const slugMap = slugMapData as {
  slugToKey: Record<string, string>
  keyToSlugs: Record<string, Record<'en' | 'bg' | 'ru' | 'gr', string>>
}

// Extend NextRequest to include Vercel's geo property
interface VercelRequest extends NextRequest {
  geo?: {
    country?: string
    region?: string
    city?: string
  }
}

const SUPPORTED_LOCALES = ['en', 'bg', 'ru', 'gr']
const DEFAULT_LOCALE = 'en'

// Helper function to determine if a route is static (public) or dynamic (auth/admin)
// Uses allowlist approach: only explicitly listed routes are static, everything else is dynamic
// This is a safety guarantee - by default, routes are NOT cached unless explicitly allowed
// add new public pages here or they won’t be cached
function isStaticRoute(pathname: string): boolean {
  // Strip language prefix if present (en, bg, ru, gr)
  const normalized = pathname.replace(/^\/(en|bg|ru|gr)(?=\/|$)/, '') || '/'
  
  // Explicit allowlist of public static routes
  // Only these exact routes are safe to cache publicly
  // Dynamic routes with [id], [slug], catch-all [...slug] are NOT included
  return (
    normalized === '' ||
    normalized === '/' ||
    normalized === '/about-us' ||
    normalized === '/about-mister-imot' ||
    normalized === '/contact' ||
    normalized === '/privacy-policy' ||
    normalized === '/terms-of-service' ||
    normalized === '/cookie-policy' ||
    normalized === '/developers' ||
    normalized === '/news' ||
    normalized === '/listings' ||
    // Bulgarian localized routes (exact matches only)
    normalized === '/obiavi' ||
    normalized === '/stroiteli' ||
    normalized === '/za-mistar-imot' ||
    normalized === '/kontakt' ||
    normalized === '/novini' ||
    // Russian localized routes (exact matches only)
    normalized === '/obyavleniya' ||
    normalized === '/zastroyshchiki' ||
    normalized === '/o-mister-imot' ||
    normalized === '/kontakty' ||
    normalized === '/novosti' ||
    // Greek localized routes (exact matches only)
    normalized === '/aggelies' ||
    normalized === '/kataskeuastes' ||
    normalized === '/sxetika-me-to-mister-imot' ||
    normalized === '/epikoinonia' ||
    normalized === '/eidhseis'
  )
}

// Helper function to set appropriate cache headers based on route type
function setCacheHeaders(response: NextResponse, pathname: string): NextResponse {
  if (isStaticRoute(pathname)) {
    // Allow caching for static public routes
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400')
  } else {
    // No cache for dynamic auth/admin routes
    response.headers.set('Cache-Control', 'no-cache, max-age=0, must-revalidate')
  }
  return response
}

// Helper function to set Client Hints headers for responsive images
// Also sets Vary header to include locale detection factors (Cookie, Accept-Language)
// This is critical for edge caching safety - ensures different users get correct locale redirects
function setClientHintsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Accept-CH', 'Width, Viewport-Width, DPR')
  response.headers.set('Accept-CH-Lifetime', '86400') // Persist for 1 day
  // Vary on all headers that affect locale detection and caching decisions
  response.headers.set('Vary', 'Accept-CH, Width, Viewport-Width, DPR, Accept-Language, Cookie')
  return response
}

function getLocale(request: NextRequest) {
  try {
  // Get the Accept-Language header
  const acceptLanguage = request.headers.get('accept-language') ?? undefined
  let headers = { 'accept-language': acceptLanguage }
  let languages = new Negotiator({ headers }).languages()
    
    // Filter out invalid locales (wildcards, malformed codes, etc.)
    // Only keep valid locale codes that match our supported format (2-letter codes)
    const validLanguages = languages.map((lang) => {
      // Remove wildcards and invalid characters
      if (lang === '*' || !lang || typeof lang !== 'string') {
        return ''
      }
      // Extract base locale (e.g., 'en-US' -> 'en', 'bg' -> 'bg')
      const baseLocale = lang.split('-')[0].toLowerCase()
      // Only allow valid 2-letter locale codes
      if (!(baseLocale.length === 2 && /^[a-z]{2}$/.test(baseLocale))) return ''
      // Normalize Greek accept-language (el) to gr locale code used by the app
      if (baseLocale === 'el') return 'gr'
      return baseLocale
    }).filter(Boolean)
    
    // If no valid languages found, return default
    if (validLanguages.length === 0) {
      return DEFAULT_LOCALE
    }
  
  // Match the preferred language with our supported locales
    return match(validLanguages, SUPPORTED_LOCALES, DEFAULT_LOCALE)
  } catch (error) {
    // If locale matching fails for any reason, return default locale
    console.error('Error matching locale:', error)
    return DEFAULT_LOCALE
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip static files and special paths immediately (before any processing)
  // Also skip not-found pages and 404 trigger routes to prevent middleware interference
  // Check for file extensions (including images, fonts, etc.)
  const hasFileExtension = /\.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot|css|js|json|xml|txt|pdf|zip|html)$/i.test(pathname)
  
  if (
    hasFileExtension || // Any file with extension (.png, .jpg, .xml, .ico, etc.)
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/images') ||
    pathname === '/not-found' ||
    pathname === '/en/not-found' ||
    pathname === '/bg/not-found' ||
    pathname === '/ru/not-found' ||
    pathname === '/gr/not-found' ||
    pathname === '/en/__404__' ||
    pathname === '/bg/__404__' ||
    pathname === '/ru/__404__' ||
    pathname === '/gr/__404__' ||
    pathname === '/og-image.png' || // Explicitly exclude og-image.png
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return NextResponse.next()
  }

  // Enforce no /en prefix in canonical URLs – redirect /en/* → /* (preserve path/query)
  if (pathname === '/en') {
    return NextResponse.redirect(new URL('/', request.url))
  }
  if (pathname.startsWith('/en/')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace(/^\/en/, '') || '/'
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
      return NextResponse.redirect(new URL(`/listings/${listingId}`, request.url))
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
    return NextResponse.redirect(new URL(`/listings/${listingId}`, request.url))
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
      const locale = cookieLocale === 'bg' ? 'bg' : cookieLocale === 'ru' ? 'ru' : cookieLocale === 'gr' ? 'gr' : 'en'
      // Redirect to a route that doesn't exist to trigger not-found naturally
      return NextResponse.redirect(new URL(`/${locale}/__404__`, request.url))
    }
    
    // Check cookie preference first
    const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
    if (cookieLocale === 'bg') {
      url.pathname = '/bg/register'
    } else if (cookieLocale === 'ru') {
      url.pathname = '/ru/register'
    } else if (cookieLocale === 'gr') {
      url.pathname = '/gr/register'
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
    } else if (cookieLocale === 'ru') {
      url.pathname = '/ru/forgot-password'
    } else if (cookieLocale === 'gr') {
      url.pathname = '/gr/forgot-password'
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

  // Handle /ru/register - block access without type=developer
  if (pathname === '/ru/register') {
    const url = request.nextUrl.clone()
    const type = url.searchParams.get('type')
    
    // Only allow developer registration - redirect others to trigger not-found
    if (type !== 'developer') {
      // Redirect to non-existent route to trigger not-found naturally
      return NextResponse.redirect(new URL('/ru/__404__', request.url))
    }
  }

  // Handle /gr/register - block access without type=developer
  if (pathname === '/gr/register') {
    const url = request.nextUrl.clone()
    const type = url.searchParams.get('type')
    
    // Only allow developer registration - redirect others to trigger not-found
    if (type !== 'developer') {
      // Redirect to non-existent route to trigger not-found naturally
      return NextResponse.redirect(new URL('/gr/__404__', request.url))
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

  // English aliases → canonical no-prefix URLs
  const englishAliasMap: Record<string, string> = {
    '/en/listings': '/listings',
    '/en/developers': '/developers',
    '/en/about-us': '/about-mister-imot',
    '/en/about-mister-imot': '/about-mister-imot',
    '/en/contact': '/contact',
    '/about-us': '/about-mister-imot',
  }
  for (const [from, to] of Object.entries(englishAliasMap)) {
    if (pathname === from || pathname.startsWith(from + '/')) {
      const url = request.nextUrl.clone()
      url.pathname = pathname.replace(from, to)
      return NextResponse.redirect(url)
    }
  }

  // Bulgarian aliases → canonical BG pretty URLs
  const bulgarianAliasMap: Record<string, string> = {
    '/bg/listings': '/bg/obiavi',
    '/bg/developers': '/bg/stroiteli',
    '/bg/about-us': '/bg/za-mistar-imot',
    '/bg/about-mister-imot': '/bg/za-mistar-imot',
    '/bg/contact': '/bg/kontakt',
  }
  for (const [from, to] of Object.entries(bulgarianAliasMap)) {
    if (pathname === from || pathname.startsWith(from + '/')) {
      const url = request.nextUrl.clone()
      url.pathname = pathname.replace(from, to)
      return NextResponse.redirect(url)
    }
  }

  // Canonical BG news → pretty BG news (keep URL bar localized)
  if (pathname === '/bg/news' || pathname.startsWith('/bg/news/')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace('/bg/news', '/bg/novini')
    return NextResponse.redirect(url)
  }

  // Russian aliases → canonical RU pretty URLs
  const russianAliasMap: Record<string, string> = {
    '/ru/listings': '/ru/obyavleniya',
    '/ru/developers': '/ru/zastroyshchiki',
    '/ru/about-us': '/ru/o-mister-imot',
    '/ru/about-mister-imot': '/ru/o-mister-imot',
    '/ru/contact': '/ru/kontakty',
  }
  for (const [from, to] of Object.entries(russianAliasMap)) {
    if (pathname === from || pathname.startsWith(from + '/')) {
      const url = request.nextUrl.clone()
      url.pathname = pathname.replace(from, to)
      return NextResponse.redirect(url)
    }
  }

  // Canonical RU news → pretty RU news
  if (pathname === '/ru/news' || pathname.startsWith('/ru/news/')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace('/ru/news', '/ru/novosti')
    return NextResponse.redirect(url)
  }

  // Greek aliases → canonical GR pretty URLs
  const greekAliasMap: Record<string, string> = {
    '/gr/listings': '/gr/aggelies',
    '/gr/developers': '/gr/kataskeuastes',
    '/gr/about-us': '/gr/sxetika-me-to-mister-imot',
    '/gr/about-mister-imot': '/gr/sxetika-me-to-mister-imot',
    '/gr/contact': '/gr/epikoinonia',
  }
  for (const [from, to] of Object.entries(greekAliasMap)) {
    if (pathname === from || pathname.startsWith(from + '/')) {
      const url = request.nextUrl.clone()
      url.pathname = pathname.replace(from, to)
      return NextResponse.redirect(url)
    }
  }

  // Canonical GR news → pretty GR news
  if (pathname === '/gr/news' || pathname.startsWith('/gr/news/')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace('/gr/news', '/gr/eidhseis')
    return NextResponse.redirect(url)
  }

  // News article slug translation - 301 redirect for SEO
  // Handles cases like /bg/novini/ideia-khoum-new-partner → /bg/novini/ideia-khoum-nov-partnyor
  // Also handles English: /news/ideia-khoum-new-partner (no /en/ prefix)
  let newsArticleMatch = pathname.match(/^\/(bg|ru|gr)\/(novini|novosti|eidhseis)\/([^/]+)$/)
  let lang: string | undefined
  let slug: string | undefined
  
  if (newsArticleMatch) {
    [, lang, , slug] = newsArticleMatch
  } else {
    // Check for English news (no /en/ prefix)
    const englishNewsMatch = pathname.match(/^\/news\/([^/]+)$/)
    if (englishNewsMatch) {
      lang = 'en'
      slug = englishNewsMatch[1]
    }
  }
  
  if (lang && slug) {
    try {
      // Find translationKey for this slug (O(1) lookup from static JSON)
      const translationKey = slugMap.slugToKey[slug]
      
      if (translationKey) {
        // Get alternate slugs for this translation
        const alternateSlugs = slugMap.keyToSlugs[translationKey]
        const correctSlug = alternateSlugs?.[lang as 'en' | 'bg' | 'ru' | 'gr']
        
        // If slug doesn't match the correct one for this language, redirect with 301
        if (correctSlug && correctSlug !== slug) {
          const newsPathMap: Record<string, string> = {
            en: '/news',
            bg: '/novini',
            ru: '/novosti',
            gr: '/eidhseis',
          }
          const newsPath = newsPathMap[lang] || '/news'
          const url = request.nextUrl.clone()
          url.pathname = lang === 'en' 
            ? `${newsPath}/${correctSlug}`
            : `/${lang}${newsPath}/${correctSlug}`
          
          // 301 Permanent Redirect for SEO (canonical URL correction)
          return NextResponse.redirect(url, 301)
        }
      }
    } catch (error) {
      // If lookup fails, continue with normal flow (don't break the site)
      console.error('[Middleware] Error in news slug translation:', error)
    }
  }

  // English canonical slugs (no prefix) → internal /en routes for rendering
  if (!pathname.startsWith('/bg/')) {
    const englishRewriteMap: Record<string, string> = {
      '/about-mister-imot': '/en/about-us',
    }
    for (const [from, to] of Object.entries(englishRewriteMap)) {
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
      '/bg/novini': '/bg/news',
    }
    for (const [from, to] of Object.entries(map)) {
      if (pathname === from || pathname.startsWith(from + '/')) {
        const url = request.nextUrl.clone()
        // Preserve the full path including slug - replace only the base path
        // This ensures slugs like "vista-park-oblast-sofiia-71448713" are preserved
        url.pathname = pathname.replace(from, to)
        // Debug: Log rewrite to identify truncation issues
        if (process.env.NODE_ENV === 'development' && pathname.includes('/obiavi/')) {
          console.log(`[Middleware] Rewriting: ${pathname} → ${url.pathname}`)
        }
        return NextResponse.rewrite(url)
      }
    }
  }

  // Russian pretty slugs → internal canonical paths
  if (pathname.startsWith('/ru/')) {
    const map: Record<string, string> = {
      '/ru/obyavleniya': '/ru/listings',
      '/ru/zastroyshchiki': '/ru/developers',
      '/ru/o-mister-imot': '/ru/about-us',
      '/ru/kontakty': '/ru/contact',
      '/ru/login': '/ru/login',
      '/ru/novosti': '/ru/news',
    }
    for (const [from, to] of Object.entries(map)) {
      if (pathname === from || pathname.startsWith(from + '/')) {
        const url = request.nextUrl.clone()
        url.pathname = pathname.replace(from, to)
        return NextResponse.rewrite(url)
      }
    }
  }

  // Greek pretty slugs → internal canonical paths
  if (pathname.startsWith('/gr/')) {
    const map: Record<string, string> = {
      '/gr/aggelies': '/gr/listings',
      '/gr/kataskeuastes': '/gr/developers',
      '/gr/sxetika-me-to-mister-imot': '/gr/about-us',
      '/gr/epikoinonia': '/gr/contact',
      '/gr/login': '/gr/login',
      '/gr/eidhseis': '/gr/news',
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
  // This is a redundant check (already handled above), but kept for safety
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
    '/og-image.png',
  ]
  
  // Reuse hasFileExtension already declared at the top of the function
  if (
    nonLocalizedPaths.some(path => pathname.startsWith(path) || pathname === path) ||
    hasFileExtension // Skip files with extensions (images, etc.)
  ) {
    return NextResponse.next()
  }

  // Check if pathname already includes a locale
  // Also allow localized not-found pages to pass through
  const pathnameHasBgLocale = pathname.startsWith('/bg/') || pathname === '/bg'
  const pathnameHasEnLocale = pathname.startsWith('/en/') || pathname === '/en'
  const pathnameHasRuLocale = pathname.startsWith('/ru/') || pathname === '/ru'
  const pathnameHasGrLocale = pathname.startsWith('/gr/') || pathname === '/gr'
  const isNotFoundPage = pathname === '/not-found' || pathname === '/en/not-found' || pathname === '/bg/not-found' || pathname === '/ru/not-found' || pathname === '/gr/not-found'

  if (pathnameHasBgLocale || pathnameHasEnLocale || pathnameHasRuLocale || pathnameHasGrLocale || isNotFoundPage) {
    const response = NextResponse.next()
    // Set language header based on pathname
    if (pathnameHasBgLocale) {
      response.headers.set('x-locale', 'bg')
    } else if (pathnameHasEnLocale) {
      response.headers.set('x-locale', 'en')
    } else if (pathnameHasRuLocale) {
      response.headers.set('x-locale', 'ru')
    } else if (pathnameHasGrLocale) {
      response.headers.set('x-locale', 'gr')
    } else {
      // For not-found pages, default to English
      response.headers.set('x-locale', 'en')
    }
    // Set pathname header for server components
    response.headers.set('x-pathname', pathname)
    // Set appropriate cache headers based on route type
    setCacheHeaders(response, pathname)
    return response
  }

  // 1. Check cookie preference (user override) - HIGHEST PRIORITY
  // BUT exclude not-found pages to prevent redirect loops
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  if (
    cookieLocale &&
    SUPPORTED_LOCALES.includes(cookieLocale) &&
    pathname !== '/not-found' &&
    !pathname.startsWith('/en/not-found') &&
    !pathname.startsWith('/bg/not-found') &&
    !pathname.startsWith('/ru/not-found') &&
    !pathname.startsWith('/gr/not-found')
  ) {
    if (cookieLocale === 'bg') {
      const response = NextResponse.redirect(new URL(`/bg${pathname}`, request.url))
      response.headers.set('x-locale', 'bg')
      response.headers.set('x-pathname', `/bg${pathname}`)
      setCacheHeaders(response, `/bg${pathname}`)
      return response
    } else if (cookieLocale === 'ru') {
      const response = NextResponse.redirect(new URL(`/ru${pathname}`, request.url))
      response.headers.set('x-locale', 'ru')
      response.headers.set('x-pathname', `/ru${pathname}`)
      setCacheHeaders(response, `/ru${pathname}`)
      return response
    } else if (cookieLocale === 'gr') {
      const response = NextResponse.redirect(new URL(`/gr${pathname}`, request.url))
      response.headers.set('x-locale', 'gr')
      response.headers.set('x-pathname', `/gr${pathname}`)
      setCacheHeaders(response, `/gr${pathname}`)
      return response
    }
    // For English (default), rewrite internally to /en for [lang] route handling
    // But skip if pathname already starts with /en/
    if (!pathname.startsWith('/en/')) {
      const url = request.nextUrl.clone()
      url.pathname = `/en${pathname}`
      const response = NextResponse.rewrite(url)
      response.headers.set('x-locale', 'en')
      response.headers.set('x-pathname', `/en${pathname}`)
      setCacheHeaders(response, `/en${pathname}`)
      return response
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
    // Set language header for root layout to use
    response.headers.set('x-locale', 'bg')
    response.headers.set('x-pathname', `/bg${pathname}`)
    setCacheHeaders(response, `/bg${pathname}`)
    return setClientHintsHeaders(response)
  }

  // 3. Check Accept-Language header
  // BUT exclude not-found pages to prevent redirect loops
  try {
  const negotiated = getLocale(request)
  if (negotiated && negotiated !== DEFAULT_LOCALE && !isNotFoundPage) {
      const response = NextResponse.redirect(new URL(`/${negotiated}${pathname}`, request.url))
      // Set language header for root layout to use
      response.headers.set('x-locale', negotiated)
      response.headers.set('x-pathname', `/${negotiated}${pathname}`)
      setCacheHeaders(response, `/${negotiated}${pathname}`)
      return setClientHintsHeaders(response)
    }
  } catch (error) {
    // If Accept-Language detection fails, continue to fallback
    // This ensures the middleware never crashes due to locale detection errors
    console.error('Error in Accept-Language detection:', error)
  }

  // 4. Fallback to default locale (English) - rewrite internally to /en
  // BUT exclude not-found pages and paths that already start with /en/
  if (!isNotFoundPage && !pathname.startsWith('/en/') && !pathnameHasRuLocale && !pathnameHasBgLocale && !pathnameHasGrLocale) {
    const url = request.nextUrl.clone()
    url.pathname = `/en${pathname}`
    const response = NextResponse.rewrite(url)
    // Set language header for root layout to use
    response.headers.set('x-locale', 'en')
    response.headers.set('x-pathname', `/en${pathname}`)
    setCacheHeaders(response, `/en${pathname}`)
    return setClientHintsHeaders(response)
  }
  
  // If it's a not-found page or already has /en/, set language header and pass through
  const response = NextResponse.next()
  // Determine language from pathname
  const detectedLang = pathname.startsWith('/bg/') || pathname === '/bg'
    ? 'bg'
    : pathname.startsWith('/ru/') || pathname === '/ru'
      ? 'ru'
      : pathname.startsWith('/gr/') || pathname === '/gr'
        ? 'gr'
        : 'en'
  response.headers.set('x-locale', detectedLang)
  response.headers.set('x-pathname', pathname)
  setCacheHeaders(response, pathname)
  return setClientHintsHeaders(response)
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - API routes (/api/*)
    // - Static files (/_next/static/*, /_next/image/*)
    // - Images (/images/*)
    // - Health check (/health)
    // - Files with extensions (*.png, *.jpg, *.ico, etc.)
    // - Common static files (robots.txt, sitemap.xml, og-image.png, favicon.ico)
    // Note: Using non-capturing groups (?:...) to avoid "Capturing groups are not allowed" error
    '/((?!api|_next/static|_next/image|images|favicon|health|og-image|robots|sitemap|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot|css|js|json|xml|txt|pdf|zip|html)).*)',
  ],
}