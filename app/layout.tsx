import type React from "react"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Figtree, Instrument_Serif, Outfit, Source_Sans_3, Playfair_Display, Inter, Lora } from "next/font/google"
import "./globals.css"
import "../styles/mobile-optimizations.css"
import { cn } from "@/lib/utils"
import GlobalMaintenanceWrapper from "@/components/maintenance/global-maintenance-wrapper"
import { AuthProvider } from "@/lib/auth-context"
import { SpeedInsights } from "@vercel/speed-insights/next"
import ViewportLock from "@/components/ViewportLock"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"



const figtree = Figtree({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-figtree",
  display: "swap",
})

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
})

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
})

const sourceSans = Source_Sans_3({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-source-sans",
  display: "swap",
})

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair-display",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
})

const lora = Lora({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-lora",
  display: "swap",
})

// Geist fonts are configured via CSS variables in globals.css

export const metadata: Metadata = {
  title: "Real Estate Development Directory",
  description: "Find and connect with real estate developers directly. No brokers, no commissions.",
  generator: 'v0.dev',
  manifest: '/manifest.json',
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
    canonical: process.env.NEXT_PUBLIC_SITE_URL 
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/en`
      : 'http://localhost:3000/en',
    languages: {
      en: process.env.NEXT_PUBLIC_SITE_URL 
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/en`
        : 'http://localhost:3000/en',
      bg: process.env.NEXT_PUBLIC_SITE_URL 
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/bg`
        : 'http://localhost:3000/bg',
      'x-default': process.env.NEXT_PUBLIC_SITE_URL 
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/en`
        : 'http://localhost:3000/en',
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

// Get language from middleware header for HTML lang attribute
// This function must never throw errors - it's called during SSR and static generation
async function getLanguageFromPath(): Promise<'en' | 'bg'> {
  // Default to English - safe fallback for all contexts
  let detectedLang: 'en' | 'bg' = 'en'
  
  try {
    // Only attempt to read headers in server context
    // headers() can throw errors during static generation or edge runtime
    if (typeof window === 'undefined') {
      try {
        const headersList = await headers()
        // Get language from middleware-set header
        const locale = headersList.get('x-locale')
        
        if (locale === 'bg' || locale === 'en') {
          detectedLang = locale
        } else {
          // Fallback: try to detect from pathname if header not set
          const pathname = headersList.get('x-pathname') || ''
          if (pathname.startsWith('/bg/') || pathname === '/bg') {
            detectedLang = 'bg'
          }
        }
      } catch (headerError) {
        // Silently fallback to English if headers() fails
        // This can happen during static generation or in edge runtime
        detectedLang = 'en'
      }
    }
  } catch (error) {
    // Catch any unexpected errors and default to English
    detectedLang = 'en'
  }
  
  return detectedLang
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const lang = await getLanguageFromPath()
  
  return (
    <html lang={lang} suppressHydrationWarning className={cn(GeistSans.variable, GeistMono.variable, figtree.variable, instrumentSerif.variable, playfairDisplay.variable, inter.variable, lora.variable)}>
      <head>
        {/* Mobile Viewport Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
        
        {/* Mobile Theme Meta Tags - Match Background Color */}
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: dark)" />
        
        {/* iOS Safe Area Support */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Mr. Imot" />
        
        <style>{`
html {
  font-family: ${inter.style.fontFamily};
  --font-sans: ${inter.variable};
  --font-serif: ${lora.variable};
  --font-mono: ${GeistMono.variable};
  --font-figtree: ${figtree.variable};
  --font-instrument-serif: ${instrumentSerif.variable};
  --font-outfit: ${outfit.variable};
  --font-source-sans: ${sourceSans.variable};
  --font-playfair-display: ${playfairDisplay.variable};
  --font-inter: ${inter.variable};
  --font-lora: ${lora.variable};
}
        `}</style>
      </head>
      <body className={cn("min-h-screen font-sans antialiased", inter.variable, lora.variable, outfit.variable, sourceSans.variable, playfairDisplay.variable)}>      
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
