import { getDictionary } from "./dictionaries"
import { LocalizedHomePage } from "./localized-homepage"
import type { Metadata } from 'next'

interface HomePageProps {
  params: Promise<{ lang: 'en' | 'bg' }>
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { lang } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mrimot.com'
  const baseUrl = siteUrl.replace(/\/$/, '')
  
  const isBg = lang === 'bg'
  const brand = isBg ? 'Мистър Имот' : 'Mister Imot'
  
  const title = isBg
    ? `${brand} – Имоти директно от строители (без брокери, без комисионни)`
    : `${brand} – Off‑plan properties directly from developers (no brokers, 0% commissions)`
  
  const description = isBg
    ? `${brand}: единствената платформа в България за ново строителство – директна връзка със строители, без брокери и без комисионни.`
    : `${brand}: Bulgaria's platform for new construction – connect directly with developers, no brokers and 0% commissions.`
  
  const canonicalUrl = `${baseUrl}/${lang}`
  const ogLocale = isBg ? 'bg_BG' : 'en_US'
  
  return {
    title,
    description,
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
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function HomePage({ params }: HomePageProps) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return <LocalizedHomePage dict={dict} lang={lang} />
}
