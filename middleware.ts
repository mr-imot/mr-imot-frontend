import { NextResponse } from "next/server";
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

let locales = ['en', 'bg']
let defaultLocale = 'en'

function getLocale(request) {
  // Get the Accept-Language header
  const acceptLanguage = request.headers.get('accept-language') ?? undefined
  let headers = { 'accept-language': acceptLanguage }
  let languages = new Negotiator({ headers }).languages()
  
  // Match the preferred language with our supported locales
  return match(languages, locales, defaultLocale)
}

export function middleware(request) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for API routes, static assets, and internal Next.js paths
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/health') ||
    pathname.includes('.') // Skip files with extensions (images, etc.)
  ) {
    return
  }

  // If URL contains /en prefix, canonicalize to remove it
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const stripped = pathname.replace(/^\/en(?=\/|$)/, '') || '/'
    const url = request.nextUrl.clone()
    url.pathname = stripped
    return NextResponse.redirect(url)
  }

  // Check if there is any supported locale in the pathname
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) return

  // No locale in path: use language negotiation
  const locale = getLocale(request)

  if (locale === 'en') {
    // Serve English at the root without /en in the URL (rewrite internally)
    const url = request.nextUrl.clone()
    url.pathname = `/en${pathname}`
    return NextResponse.rewrite(url)
  }

  // Non-default locale (bg) keeps explicit prefix for SEO
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(url)
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
