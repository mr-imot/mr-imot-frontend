import { getDictionary } from '../dictionaries'
import AboutClient from './about-client'
import type { Metadata } from 'next'

interface AboutPageProps {
  params: Promise<{
    lang: 'en' | 'bg'
  }>
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { lang } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  const isBg = lang === 'bg'
  const brand = isBg ? 'Мистър Имот' : 'Mister Imot'
  
  const title = isBg
    ? `За Нас – ${brand} | Платформа за ново строителство в България`
    : `About Us – ${brand} | New Construction Platform in Bulgaria`
  
  const description = isBg
    ? `Научете повече за ${brand} – платформата, която модернизира пазара на ново строителство в България. Директна връзка със строители, без брокери и без комисионни. Нашата мисия, подход и роудмап за развитие.`
    : `Learn more about ${brand} – the platform modernizing Bulgaria's new construction market. Connect directly with developers, no brokers and 0% commissions. Our mission, approach, and development roadmap.`
  
  // Use pretty URL for Bulgarian, canonical for English
  const canonicalUrl = isBg 
    ? `${siteUrl}/bg/za-mistar-imot`
    : `${siteUrl}/en/about-mister-imot`
  
  const ogLocale = isBg ? 'bg_BG' : 'en_US'
  
  return {
    title,
    description,
    robots: {
      index: true, // Explicitly allow indexing of about page
      follow: true,
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${siteUrl}/en/about-mister-imot`,
        bg: `${siteUrl}/bg/za-mistar-imot`,
        'x-default': `${siteUrl}/en/about-mister-imot`,
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

export default async function AboutPage({ params }: AboutPageProps) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return <AboutClient dict={dict} lang={lang} />
}
