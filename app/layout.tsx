import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Geist, Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import GlobalMaintenanceWrapper from "@/components/maintenance/global-maintenance-wrapper"
import { AuthProvider } from "@/lib/auth-context"
import { SpeedInsights } from "@vercel/speed-insights/next"
import ViewportLock from "@/components/ViewportLock"
import { ThemeProvider } from "@/components/theme-provider"

// Geist for hero/headings with Cyrillic support (trimmed weights)
const geist = Geist({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700"],
  variable: "--font-geist",
  display: "swap",
})

// Inter for body text with Cyrillic support (trimmed weights)
const inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Real Estate Development Directory",
  description: "Find and connect with real estate developers directly. No brokers, no commissions.",
  generator: 'v0.dev',
  manifest: '/manifest.json',
  robots: {
    // Root layout should not be indexed - all content is under /en or /bg
    index: false,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
    ]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent'
  },
  alternates: {
    // Hardcode production domain for canonical URLs to prevent build-time issues
    // See: https://www.reddit.com/r/nextjs/s/otIdK3NiqK
    canonical: 'https://mrimot.com/en',
    languages: {
      en: 'https://mrimot.com/en',
      bg: 'https://mrimot.com/bg',
      ru: 'https://mrimot.com/ru',
      el: 'https://mrimot.com/gr',
      'x-default': 'https://mrimot.com/en',
    },
  },
}

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true
  }
}

// REMOVED: generateThemeColor function that was causing blue background

// Mapping for Greek: route uses 'gr', HTML lang uses 'el' (ISO 639-1)
const localeToHTMLLang: Record<'en' | 'bg' | 'ru' | 'gr', string> = {
  en: 'en',
  bg: 'bg',
  ru: 'ru',
  gr: 'el'
}

// Get language from middleware header for HTML lang attribute
// This function must never throw errors - it's called during SSR and static generation
async function getLanguageFromPath(): Promise<string> {
  try {
    // Try to get language from middleware header
    const { headers } = await import('next/headers')
    const headersList = await headers()
    const locale = headersList.get('x-locale')
    
    if (locale && (locale === 'en' || locale === 'bg' || locale === 'ru' || locale === 'gr')) {
      return localeToHTMLLang[locale]
    }
  } catch (error) {
    // During static generation, headers() is not available
    // This is expected and safe to ignore
  }
  
  // Default to 'en' during static generation or if header is not available
  return 'en'
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Get language from middleware header, default to 'en'
  const htmlLang = await getLanguageFromPath()
  
  return (
    <html lang={htmlLang} suppressHydrationWarning className={cn(GeistSans.variable, GeistMono.variable, geist.variable, inter.variable)}>
      <head>
        {/* Preconnect to ImageKit for faster image loading (critical for LCP) */}
        <link rel="preconnect" href="https://ik.imagekit.io" crossOrigin="anonymous" />
        {/* Preconnect to Google Maps API for faster map loading (300ms LCP savings) */}
        <link rel="preconnect" href="https://maps.googleapis.com" crossOrigin="anonymous" />
        
        {/* Mobile Viewport Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
        
        {/* Mobile Theme Meta Tags - Match Background Color */}
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: dark)" />
        
        {/* iOS Safe Area Support */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Mr. Imot" />
        
        {/* Font preloading is handled automatically by next/font/google */}
        
        <style>{`
html {
  font-family: ${inter.style.fontFamily};
  --font-sans: ${inter.variable};
  --font-serif: ${geist.variable};
  --font-mono: ${GeistMono.variable};
  --font-geist: ${geist.variable};
  --font-inter: ${inter.variable};
}
        `}</style>
      </head>
      <body className={cn("min-h-screen font-sans antialiased", inter.variable, geist.variable)}>      
        {/* Global viewport fixes: mobile height lock and header height sync */}
        <ViewportLock />
        <ThemeProvider>
        <GlobalMaintenanceWrapper>
          <AuthProvider>
            
            <div className="relative flex min-h-screen flex-col">
              <main className="flex-1">{children}</main>
            </div>
          </AuthProvider>
        </GlobalMaintenanceWrapper>
        </ThemeProvider>
        {/* Analytics gated by CookieConsent in [lang]/layout; SpeedInsights remains */}
        <SpeedInsights />
      </body>
    </html>
  )
}
