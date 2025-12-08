import { getDictionary } from "./dictionaries"
import { LocalizedHomePage } from "./localized-homepage"
import { brandForLang, formatTitleWithBrand } from "@/lib/seo"
import type { Metadata } from 'next'

interface HomePageProps {
  params: Promise<{ lang: 'en' | 'bg' }>
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { lang } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mrimot.com'
  const baseUrl = siteUrl.replace(/\/$/, '')
  const dict = await getDictionary(lang)
  const isBg = lang === 'bg'
  const brand = brandForLang(lang)
  const socialImage = 'https://ik.imagekit.io/ts59gf2ul/Logo/mister-imot-waving-hi-with-bg.png?tr=w-1200,h-630,cm-pad_resize,bg-FFFFFF,fo-auto,q-85,f-auto&v=20241205'

  const fallbackTitle = isBg
    ? `${brand} – Имоти директно от строители (без брокери, без комисионни)`
    : `${brand} – Off‑plan properties directly from developers (no brokers, 0% commissions)`

  const fallbackDescription = isBg
    ? `${brand}: единствената платформа в България за ново строителство – директна връзка със строители, без брокери и без комисионни.`
    : `${brand}: Bulgaria's platform for new construction – connect directly with developers, no brokers and 0% commissions.`

  const seoContent = (dict as { seo?: { home?: { title?: string; description?: string; keywords?: string[] } } })?.seo?.home
  const rawTitle = seoContent?.title || fallbackTitle
  const title = formatTitleWithBrand(rawTitle, lang)
  const description = seoContent?.description || fallbackDescription
  const keywords = Array.isArray(seoContent?.keywords) ? seoContent?.keywords : undefined

  const canonicalUrl = `${baseUrl}/${lang}`
  const ogLocale = isBg ? 'bg_BG' : 'en_US'
  return {
    title,
    description,
    keywords,
    metadataBase: new URL(baseUrl),
    robots: {
      index: true, // Explicitly allow indexing of homepage
      follow: true,
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}/en`,
        bg: `${baseUrl}/bg`,
        'x-default': `${baseUrl}/en`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
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
            : 'Mister Imot – Off‑plan properties directly from developers',
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

export default async function HomePage({ params }: HomePageProps) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return <LocalizedHomePage dict={dict} lang={lang} />
}
