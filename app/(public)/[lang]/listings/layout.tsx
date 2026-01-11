import { getDictionary, type SupportedLocale } from "@/lib/dictionaries"
import { DesktopHeader } from "@/components/desktop-header"
import { GoogleMapsPreconnect } from "@/components/google-maps-preconnect"

/**
 * Listings-specific layout
 * 
 * This layout renders ServerHeader for desktop (xl and above) and lets the
 * listings client component handle the mobile search header (mobile/tablet only).
 * 
 * ServerHeader with isListings={true} uses 'hidden xl:flex' which means:
 * - Hidden on mobile/tablet (< xl) - mobile search header shows instead
 * - Visible on desktop (≥ xl) - ServerHeader shows
 * 
 * Note: 
 * - ImageKitProvider and LocaleProvider are provided by the parent layout
 * - Footer, FeedbackButton, CookieConsent are also provided by the parent layout
 * - This layout handles the modal slot for parallel routes
 * 
 * This ensures:
 * - Mobile: Only mobile search header (from listings client component)
 * - Desktop: Only ServerHeader (from this layout)
 * - No duplicate headers
 * - No CSS hiding hacks
 * - Fully static and cacheable (no headers() or cookies() calls)
 */
export default async function ListingsLayout({
  children,
  modal,
  params,
}: {
  children: React.ReactNode
  modal: React.ReactNode
  params: Promise<{ lang: SupportedLocale }>
}) {
  const { lang } = await params
  
  try {
    const translations = await getDictionary(lang)
    
    return (
      <>
        {/* Preconnect to Google Maps resources for faster map loading (only on listings page) */}
        <GoogleMapsPreconnect />
        {/* DesktopHeader: minimal header for desktop only (xl+), no mobile nav to prevent duplicate hydration */}
        {/* Mobile listings header handles mobile navigation via PublicMobileNav */}
        <DesktopHeader lang={lang} translations={translations} />
        {/* Listings pages handle their own layout structure via ListingsLayoutServer */}
        {children}
        {/* Modal slot for parallel routes */}
        {modal}
      </>
    )
  } catch (error) {
    console.error('Failed to load dictionary:', error)
    // Fallback to English if dictionary loading fails
    const fallbackTranslations = await getDictionary('en')
    
    return (
      <>
        {/* Preconnect to Google Maps resources for faster map loading (only on listings page) */}
        <GoogleMapsPreconnect />
        {/* DesktopHeader: minimal header for desktop only (xl+), no mobile nav to prevent duplicate hydration */}
        {/* Mobile listings header handles mobile navigation via PublicMobileNav */}
        <DesktopHeader lang="en" translations={fallbackTranslations} />
        {/* Listings pages handle their own layout structure via ListingsLayoutServer */}
        {children}
        {/* Modal slot for parallel routes */}
        {modal}
      </>
    )
  }
}
