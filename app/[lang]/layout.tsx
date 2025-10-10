import { LocaleProvider } from "@/lib/locale-context"
import { getDictionary } from "./dictionaries"
import { SiteHeader } from "@/components/site-header"
import { Footer } from "@/components/footer"
import { FeedbackButton } from "@/components/feedback-button"
import type { Metadata } from "next"
import { ViewportLock } from "@/components/ViewportLock"

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'bg' }]
}

export async function generateMetadata({ params }: { params: Promise<{ lang: 'en' | 'bg' }> }): Promise<Metadata> {
  const { lang } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const isBg = lang === 'bg'
  const brand = isBg ? 'Мистър Имот' : 'Mister Imot'

  const title = isBg
    ? `${brand} – Имоти директно от строители (без брокери, без комисионни)`
    : `${brand} – Off‑plan properties directly from developers (no brokers, 0% commissions)`

  const description = isBg
    ? `${brand}: единствената платформа в България за ново строителство – директна връзка със строители, без брокери и без комисионни.`
    : `${brand}: Bulgaria’s platform for new construction – connect directly with developers, no brokers and 0% commissions.`

  const url = `${siteUrl}/${lang}`
  const ogLocale = isBg ? 'bg_BG' : 'en_US'

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `${siteUrl}/en`,
        bg: `${siteUrl}/bg`,
        'x-default': `${siteUrl}/en`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: brand,
      locale: ogLocale,
      alternateLocale: ['en_US', 'bg_BG'],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
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
          {/* Global viewport fixes: mobile height lock and header height sync */}
          <ViewportLock />
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
