import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { cn } from "@/lib/utils"
import { SiteHeader } from "@/components/site-header"
import { Footer } from "@/components/footer"
import GlobalMaintenanceWrapper from "@/components/maintenance/global-maintenance-wrapper"
import { AuthProvider } from "@/lib/auth-context"
import { UnifiedAuthProvider } from "@/lib/unified-auth"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { FeedbackButton } from "@/components/feedback-button"


// Geist fonts are configured via CSS variables in globals.css

export const metadata: Metadata = {
  title: "Mr imot - Real Estate Development Directory",
  description: "Find and connect with real estate developers directly. No brokers, no BS.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(GeistSans.variable, GeistMono.variable)}>
      <body className={cn("min-h-screen bg-background font-sans antialiased")}>      
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <GlobalMaintenanceWrapper>
          <AuthProvider>
            <UnifiedAuthProvider>
              <div className="relative flex min-h-screen flex-col">
                <SiteHeader />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <FeedbackButton />
            </UnifiedAuthProvider>
          </AuthProvider>
        </GlobalMaintenanceWrapper>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
