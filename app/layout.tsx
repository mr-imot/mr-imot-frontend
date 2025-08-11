import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { SiteHeader } from "@/components/site-header"
import { Footer } from "@/components/footer"
import GlobalMaintenanceWrapper from "@/components/maintenance/global-maintenance-wrapper"
import { AuthProvider } from "@/lib/auth-context"
import { UnifiedAuthProvider } from "@/lib/unified-auth"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"


const inter = Inter({ subsets: ["latin"] })

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
    <html lang="en">
      <body className={cn("min-h-screen bg-nova-background font-sans antialiased", inter.className)}>
        <GlobalMaintenanceWrapper>
          <AuthProvider>
            <UnifiedAuthProvider>
              <div className="relative flex min-h-screen flex-col">
                <SiteHeader />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </UnifiedAuthProvider>
          </AuthProvider>
        </GlobalMaintenanceWrapper>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
