import { LocaleProvider } from "@/lib/locale-context"
import { getDictionary } from "./dictionaries"
import { SiteHeader } from "@/components/site-header"
import { Footer } from "@/components/footer"
import { FeedbackButton } from "@/components/feedback-button"
import { brandForLang, formatTitleWithBrand } from "@/lib/seo"
import type { Metadata } from "next"
import ViewportLock from "@/components/ViewportLock"

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'bg' }]
}

export async function generateMetadata({ params }: { params: Promise<{ lang: 'en' | 'bg' }> }): Promise<Metadata> {
  const { lang } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mrimot.com'
  const socialImage = 'https://ik.imagekit.io/ts59gf2ul/Logo/mister-imot-waving-hi-with-bg.png?tr=w-1200,h-630,cm-pad_resize,bg-FFFFFF,fo-auto,q-85,f-auto'

  const isBg = lang === 'bg'
  const brand = brandForLang(lang)

  const rawTitle = isBg
    ? `${brand} – Имоти директно от строители (без брокери, без комисионни)`
    : `${brand} – Off‑plan properties directly from developers (no brokers, 0% commissions)`
  const title = formatTitleWithBrand(rawTitle, lang)

  const description = isBg
    ? `${brand}: единствената платформа в България за ново строителство – директна връзка със строители, без брокери и без комисионни.`
    : `${brand}: Bulgaria’s platform for new construction – connect directly with developers, no brokers and 0% commissions.`

  const url = `${siteUrl}/${lang}`
  const ogLocale = isBg ? 'bg_BG' : 'en_US'

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    robots: {
      // Public pages under [lang] should be indexable by default
      // Private routes (developer, admin, buyer) will override this in their own layouts
      index: true,
      follow: true,
    },
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
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: isBg
            ? 'Мистър Имот – Имоти директно от строители'
            : 'Mister Imot – Off-plan properties directly from developers',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [socialImage],
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
