import { getDictionary } from '../dictionaries'
import AboutClient from './about-client'
import AboutStructuredData from './about-structured-data'
import type { Metadata } from 'next'

interface AboutPageProps {
  params: Promise<{
    lang: 'en' | 'bg'
  }>
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { lang } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mrimot.com'
  
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
    : `${siteUrl}/about-mister-imot`
  
  const ogLocale = isBg ? 'bg_BG' : 'en_US'
  const baseUrl = siteUrl.replace(/\/$/, '')
  const ogImage = `${baseUrl}/og-image.png`
  
  const keywords = isBg
    ? 'за нас, мистър имот, ново строителство, България, платформа, имоти, строители, без брокери, мисия, роудмап'
    : 'about us, mister imot, new construction, Bulgaria, platform, real estate, developers, no brokers, mission, roadmap'

  return {
    title,
    description,
    keywords,
    robots: {
      index: true, // Explicitly allow indexing of about page
      follow: true,
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}/about-mister-imot`,
        bg: `${baseUrl}/bg/za-mistar-imot`,
        'x-default': `${baseUrl}/about-mister-imot`,
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
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mrimot.com'
  const baseUrl = siteUrl.replace(/\/$/, '')

  return (
    <>
      <AboutStructuredData lang={lang} baseUrl={baseUrl} />
      <AboutClient dict={dict} lang={lang} />
    </>
  )
}
