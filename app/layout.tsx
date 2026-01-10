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
  font-family: ${geist.style.fontFamily};
  --font-sans: ${geist.variable};
  --font-serif: ${geist.variable};
  --font-geist: ${geist.variable};
}
        `}</style>
        <link rel="preload" as="style" href="/styles/deferred.css" />
        <link
          rel="stylesheet"
          href="/styles/deferred.css"
          media="print"
          id="deferred-css"
        />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "const deferredCss=document.getElementById('deferred-css');if(deferredCss){deferredCss.addEventListener('load',()=>{deferredCss.media='all';});}",
          }}
        />
        <noscript>
          <link rel="stylesheet" href="/styles/deferred.css" />
        </noscript>
      </head>
      <body className={cn("min-h-screen font-sans antialiased", geist.variable)}>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
