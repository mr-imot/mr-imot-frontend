import { getDictionary } from '../dictionaries'
import AboutClient from './about-client'
import AboutStructuredData from './about-structured-data'
import { brandForLang, formatTitleWithBrand } from '@/lib/seo'
import type { Metadata } from 'next'

interface AboutPageProps {
  params: Promise<{
    lang: 'en' | 'bg'
  }>
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { lang } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mrimot.com'
  const baseUrl = siteUrl.replace(/\/$/, '')
  
  const isBg = lang === 'bg'
  const brand = brandForLang(lang)
  const socialImage = 'https://ik.imagekit.io/ts59gf2ul/Logo/mister-imot-waving-hi-with-bg.png?tr=w-1200,h-630,cm-pad_resize,bg-FFFFFF,fo-auto,q-85,f-auto&v=20241205'
  
  const rawTitle = isBg
    ? `За Нас – ${brand} | Платформа за ново строителство в България`
    : `About Us – ${brand} | New Construction Platform in Bulgaria`
  const title = formatTitleWithBrand(rawTitle, lang)
  
  const description = isBg
    ? `Научете повече за ${brand} – платформата, която модернизира пазара на ново строителство в България. Директна връзка със строители, без брокери и без комисионни. Нашата мисия, подход и роудмап за развитие.`
    : `Learn more about ${brand} – the platform modernizing Bulgaria's new construction market. Connect directly with developers, no brokers and 0% commissions. Our mission, approach, and development roadmap.`
  
  // Use pretty URL for Bulgarian, canonical for English
  const canonicalUrl = isBg 
    ? `${baseUrl}/bg/za-mistar-imot`
    : `${baseUrl}/about-mister-imot`
  
  const ogLocale = isBg ? 'bg_BG' : 'en_US'
  
  const keywords = isBg
    ? 'за нас, мистър имот, ново строителство, България, платформа, имоти, строители, без брокери, мисия, роудмап'
    : 'about us, mister imot, new construction, Bulgaria, platform, real estate, developers, no brokers, mission, roadmap'

  return {
    title,
    description,
    keywords,
    metadataBase: new URL(baseUrl),
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
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: isBg
            ? 'Мистър Имот – За нас'
            : 'Mister Imot – About us',
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
