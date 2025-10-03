import { NextResponse, type NextRequest } from "next/server";
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

let locales = ['en', 'bg']
let defaultLocale = 'en'

function getLocale(request: NextRequest) {
  // Get the Accept-Language header
  const acceptLanguage = request.headers.get('accept-language') ?? undefined
  let headers = { 'accept-language': acceptLanguage }
  let languages = new Negotiator({ headers }).languages()
  
  // Match the preferred language with our supported locales
  return match(languages, locales, defaultLocale)
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  // Bulgarian pretty slugs → internal canonical paths
  if (pathname.startsWith('/bg/')) {
    const map: Record<string, string> = {
      '/bg/obiavi': '/bg/listings',
      '/bg/stroiteli': '/bg/developers',
      '/bg/za-nas': '/bg/about-us',
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
    return
  }

  // Respect explicit locale prefixes
  if (pathname === '/en' || pathname.startsWith('/en/') || pathname === '/bg' || pathname.startsWith('/bg/')) {
    return
  }

  // Check if there is any supported locale in the pathname
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) return

  // Read user preference cookie if present
  const cookieLocale = request.cookies.get('locale')?.value
  const negotiated = getLocale(request)
  const targetLocale = (cookieLocale === 'en' || cookieLocale === 'bg') ? cookieLocale : negotiated

  if (targetLocale === 'en') {
    // Serve English at root by rewriting internally to /en
    const url = request.nextUrl.clone()
    url.pathname = `/en${pathname}`
    return NextResponse.rewrite(url)
  } else {
    // Non-default locales get explicit redirect with prefix
    const url = request.nextUrl.clone()
    url.pathname = `/bg${pathname}`
    return NextResponse.redirect(url)
  }
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
