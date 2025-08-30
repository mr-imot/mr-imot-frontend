import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Figtree, Instrument_Serif, Outfit, Source_Sans_3 } from "next/font/google"
import "./globals.css"
import "../styles/mobile-optimizations.css"
import { cn } from "@/lib/utils"
import { SiteHeader } from "@/components/site-header"
import { Footer } from "@/components/footer"
import GlobalMaintenanceWrapper from "@/components/maintenance/global-maintenance-wrapper"
import { AuthProvider } from "@/lib/auth-context"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { FeedbackButton } from "@/components/feedback-button"
import { StatusBarBackground } from "@/components/status-bar-background"


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

// Geist fonts are configured via CSS variables in globals.css

export const metadata: Metadata = {
  title: "Mr imot - Real Estate Development Directory",
  description: "Find and connect with real estate developers directly. No brokers, no BS.",
  generator: 'v0.dev',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent', // Changed to prevent blue background
    title: 'Mr. Imot'
  }
}

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false
  }
}

// REMOVED: generateThemeColor function that was causing blue background

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(GeistSans.variable, GeistMono.variable, figtree.variable, instrumentSerif.variable)}>
      <head>
        {/* Mobile Viewport Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        
        {/* Mobile Theme Meta Tags - Prevent Blue Background */}
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
        
        {/* iOS Safe Area Support */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Mr. Imot" />
        
        <style>{`
html {
  font-family: ${figtree.style.fontFamily};
  --font-sans: ${figtree.variable};
  --font-mono: ${GeistMono.variable};
  --font-figtree: ${figtree.variable};
  --font-instrument-serif: ${instrumentSerif.variable};
  --font-outfit: ${outfit.variable};
  --font-source-sans: ${sourceSans.variable};
}
        `}</style>
      </head>
      <body className={cn("min-h-screen font-sans antialiased", figtree.variable, instrumentSerif.variable, outfit.variable, sourceSans.variable)}>      
        <ThemeProvider>
        <GlobalMaintenanceWrapper>
          <AuthProvider>
            {/* NEW: Header Fade Overlay */}
            <div className="header-fade-overlay" />
            
            <div className="relative flex min-h-screen flex-col">
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <FeedbackButton />
            <StatusBarBackground />
          </AuthProvider>
        </GlobalMaintenanceWrapper>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
