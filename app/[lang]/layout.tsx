import { LocaleProvider } from "@/lib/locale-context"
import { getDictionary } from "./dictionaries"
import { SiteHeader } from "@/components/site-header"
import { Footer } from "@/components/footer"
import { FeedbackButton } from "@/components/feedback-button"

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'bg' }]
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ lang: 'en' | 'bg' }>
}>) {
  const { lang } = await params
  
  try {
    const translations = await getDictionary(lang)
    
    return (
      <LocaleProvider locale={lang} translations={translations}>
        <div className="relative flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <FeedbackButton />
      </LocaleProvider>
    )
  } catch (error) {
    console.error('Failed to load dictionary:', error)
    // Fallback to English if dictionary loading fails
    const fallbackTranslations = await getDictionary('en')
    
    return (
      <LocaleProvider locale="en" translations={fallbackTranslations}>
        <div className="relative flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <FeedbackButton />
      </LocaleProvider>
    )
  }
}
