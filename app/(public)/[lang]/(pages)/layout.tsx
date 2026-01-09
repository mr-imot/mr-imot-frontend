import { getDictionary, type SupportedLocale } from "@/lib/dictionaries"
import { ServerHeader } from "@/components/server-header"

/**
 * Layout for normal public pages (homepage, about, contact, etc.)
 * 
 * This layout renders ServerHeader for all pages under the (pages) route group.
 * Listings pages are NOT under this route group, so they don't get ServerHeader.
 * 
 * This ensures:
 * - Only one header exists per page type
 * - No CSS hiding hacks
 * - No duplicate hydration
 * - Fully static and cacheable (no headers() or cookies() calls)
 */
export default async function PagesLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ lang: SupportedLocale }>
}>) {
  const { lang } = await params
  
  try {
    const translations = await getDictionary(lang)
    
    return (
      <>
        <ServerHeader lang={lang} translations={translations} isListings={false} />
        {children}
      </>
    )
  } catch (error) {
    console.error('Failed to load dictionary:', error)
    // Fallback to English if dictionary loading fails
    const fallbackTranslations = await getDictionary('en')
    
    return (
      <>
        <ServerHeader lang="en" translations={fallbackTranslations} isListings={false} />
        {children}
      </>
    )
  }
}
