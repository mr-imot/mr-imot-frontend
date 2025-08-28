import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Figtree, Instrument_Serif, Outfit, Source_Sans_3 } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { SiteHeader } from "@/components/site-header"
import { Footer } from "@/components/footer"
import GlobalMaintenanceWrapper from "@/components/maintenance/global-maintenance-wrapper"
import { AuthProvider } from "@/lib/auth-context"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { FeedbackButton } from "@/components/feedback-button"


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
  generator: 'v0.dev'
  // manifest: '/manifest.json', // TEMPORARILY DISABLED
  // themeColor: '#1e40af', // TEMPORARILY DISABLED
  // appleWebApp: { // TEMPORARILY DISABLED
  //   capable: true,
  //   statusBarStyle: 'default',
  //   title: 'Mr. Imot'
  // },
  // viewport: { // TEMPORARILY DISABLED
  //   width: 'device-width',
  //   initialScale: 1,
  //   maximumScale: 1,
  //   userScalable: false
  // }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(GeistSans.variable, GeistMono.variable, figtree.variable, instrumentSerif.variable)}>
      <head>
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
          </AuthProvider>
        </GlobalMaintenanceWrapper>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
