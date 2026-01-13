import type React from "react"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { SpeedInsights } from "@vercel/speed-insights/next"

// Geist for all text (headings and body) with Cyrillic support - only 2 weights above fold
const geist = Geist({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600"],
  variable: "--font-geist",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Mister Imot – Off-plan properties directly from developers",
  description: "Mister Imot: Bulgaria's platform for new construction – connect directly with developers, no brokers and 0% commissions.",
  manifest: '/manifest.json',
  // Note: robots index is handled by [lang] layout which sets index: true for public pages
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
    // English uses root / (no /en prefix) to match redirect behavior
    canonical: 'https://mrimot.com',
    languages: {
      en: 'https://mrimot.com',
      bg: 'https://mrimot.com/bg',
      ru: 'https://mrimot.com/ru',
      el: 'https://mrimot.com/gr',
      'x-default': 'https://mrimot.com',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Root layout is static and dumb - language lives in [lang] route segments
  // Hardcode lang="en" as default, [lang] layouts will handle locale-specific HTML lang if needed
  return (
    <html lang="en" suppressHydrationWarning className={cn(geist.variable)}>
      <head>
        {/* Preconnect to ImageKit for faster image loading (critical for LCP) */}
        <link rel="preconnect" href="https://ik.imagekit.io" crossOrigin="anonymous" />
        {/* Google Maps preconnect removed - now only on pages that need it (listings page) */}
        
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
  font-family: ${geist.style.fontFamily};
  --font-sans: ${geist.variable};
  --font-serif: ${geist.variable};
  --font-geist: ${geist.variable};
}
        `}</style>
      </head>
      <body className={cn("min-h-screen font-sans antialiased", geist.variable)}>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
