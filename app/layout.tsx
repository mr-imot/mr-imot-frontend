import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
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
    statusBarStyle: 'black-translucent',
    title: 'Mr. Imot'
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#ffffff" },
  ],
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
    <html lang="en" suppressHydrationWarning className={geist.variable}>
      <body className="min-h-screen font-sans antialiased">
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
