import { LocaleProvider } from "@/lib/locale-context"
import { AuthProvider } from "@/lib/auth-context"
import { getDictionary, type SupportedLocale } from "@/lib/dictionaries"
import { Footer } from "@/components/footer"
import { FeedbackButton } from "@/components/feedback-button"
import CookieConsent from "@/components/cookie-consent"
import { brandForLang, formatTitleWithBrand, getSiteUrl } from "@/lib/seo"
import type { Metadata } from "next"
import { buildIkUrl } from "@/lib/imagekit"
import ThemeInit from "@/components/ThemeInit"
import HeaderHeight from "@/components/HeaderHeight"

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'bg' }, { lang: 'ru' }, { lang: 'gr' }]
}

export async function generateMetadata({ params }: { params: Promise<{ lang: SupportedLocale }> }): Promise<Metadata> {
  const { lang } = await params
  const siteUrl = getSiteUrl() // Hardcoded production domain for canonical URLs
  const socialImage = buildIkUrl("/Logo/mister-imot-waving-hi-with-bg.png", [
    { width: 1200, height: 630, quality: 85, format: "webp", focus: "auto" },
  ])

  const isBg = lang === 'bg'
  const isGr = lang === 'gr'
  const isRu = lang === 'ru'
  const brand = brandForLang(lang)

  const rawTitle = isBg
    ? `${brand} – Имоти директно от строители (без брокери, без комисиони)`
    : `${brand} – Off‑plan properties directly from developers (no brokers, 0% commissions)`
  const title = formatTitleWithBrand(rawTitle, lang)

  const description = isBg
    ? `${brand}: единствената платформа в България за ново строителство – директна връзка със строители, без брокери и без комисиони.`
    : `${brand}: Bulgaria's platform for new construction – connect directly with developers, no brokers and 0% commissions.`

  // English uses root / (no /en prefix) to match redirect behavior and clean URLs
  const url = lang === 'en' ? siteUrl : `${siteUrl}/${lang}`
  const ogLocale = isBg ? 'bg_BG' : isGr ? 'el_GR' : isRu ? 'ru_RU' : 'en_US'

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
        en: siteUrl,
        bg: `${siteUrl}/bg`,
        ru: `${siteUrl}/ru`,
        el: `${siteUrl}/gr`,
        'x-default': siteUrl,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: brand,
      locale: ogLocale,
      alternateLocale: ['en_US', 'bg_BG', 'ru_RU', 'el_GR'],
      type: 'website',
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: isBg
            ? 'Мистър Имот – Имоти директно от строители'
            : isGr
              ? 'Mister Imot – Ακίνητα εκτός σχεδίου απευθείας από κατασκευαστές'
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

export default async function PublicLangLayout({
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
      <LocaleProvider locale={lang}>
        <AuthProvider>
          <ThemeInit />
          <HeaderHeight />
          <div className="relative flex min-h-screen flex-col">
            {/* ServerHeader is rendered by (pages)/layout.tsx for normal pages - outside main */}
            {/* Listings pages have their own layout without ServerHeader */}
            {children}
            <Footer lang={lang} translations={{ footer: translations.footer, navigation: translations.navigation }} />
          </div>
          <FeedbackButton translations={translations.feedback} />
          <CookieConsent />
        </AuthProvider>
      </LocaleProvider>
    )
  } catch (error) {
    console.error('Failed to load dictionary:', error)
    // Fallback to English if dictionary loading fails
    const fallbackTranslations = await getDictionary('en')
    
    return (
      <LocaleProvider locale="en">
        <AuthProvider>
          <ThemeInit />
          <HeaderHeight />
          <div className="relative flex min-h-screen flex-col">
            {/* ServerHeader is rendered by (pages)/layout.tsx for normal pages - outside main */}
            {/* Listings pages have their own layout without ServerHeader */}
            {children}
            <Footer lang="en" translations={{ footer: fallbackTranslations.footer, navigation: fallbackTranslations.navigation }} />
          </div>
          <FeedbackButton translations={fallbackTranslations.feedback} />
          <CookieConsent />
        </AuthProvider>
      </LocaleProvider>
    )
  }
}
