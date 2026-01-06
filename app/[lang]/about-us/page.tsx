import { getDictionary } from '../dictionaries'
import AboutClient from './about-client'
import AboutStructuredData from './about-structured-data'
import { brandForLang, formatTitleWithBrand, getSiteUrl } from '@/lib/seo'
import type { Metadata } from 'next'
import WebPageSchema from '@/components/seo/webpage-schema'

// Enable SSG for all language variants
export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'bg' }, { lang: 'ru' }, { lang: 'gr' }]
}

interface AboutPageProps {
  params: Promise<{
    lang: 'en' | 'bg' | 'ru' | 'gr'
  }>
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { lang } = await params
  const baseUrl = getSiteUrl() // Hardcoded production domain for canonical URLs
  
  const isBg = lang === 'bg'
  const isRu = lang === 'ru'
  const brand = brandForLang(lang)
  const socialImage = 'https://ik.imagekit.io/ts59gf2ul/Logo/mister-imot-waving-hi-with-bg.png?tr=w-1200,h-630,cm-pad_resize,bg-FFFFFF,fo-auto,q-85,f-auto&v=20241205'
  
  const rawTitle = isBg
    ? `За Нас – ${brand} | Платформа за ново строителство в България`
    : isRu
      ? `О нас – ${brand} | Платформа новостроек в Болгарии`
      : `About Us – ${brand} | New Construction Platform in Bulgaria`
  const title = formatTitleWithBrand(rawTitle, lang)
  
  const description = isBg
    ? `Научете повече за ${brand} – платформата, която модернизира пазара на ново строителство в България. Директна връзка със строители, без брокери и без комисиони. Нашата мисия, подход и роудмап за развитие.`
    : isRu
      ? `Узнайте больше о ${brand} – платформе, которая модернизирует рынок новостроек в Болгарии. Общайтесь напрямую с застройщиками, без брокеров и комиссий. Наша миссия, подход и планы развития.`
      : `Learn more about ${brand} – the platform modernizing Bulgaria's new construction market. Connect directly with developers, no brokers and 0% commissions. Our mission, approach, and development roadmap.`
  
  // Use pretty URL for Bulgarian and Russian, canonical for English
  const canonicalUrl = isBg 
    ? `${baseUrl}/bg/za-mistar-imot`
    : isRu
      ? `${baseUrl}/ru/o-mister-imot`
      : `${baseUrl}/about-mister-imot`
  
  const ogLocale = isBg ? 'bg_BG' : isRu ? 'ru_RU' : 'en_US'
  
  const keywords = isBg
    ? 'mrimot, mrimot.com, за нас, мистър имот, ново строителство, България, платформа, имоти, строители, без брокери, мисия, роудмап'
    : isRu
      ? 'mrimot, mrimot.com, о нас, мистер имот, новостройки, болгария, платформа, недвижимость, застройщики, без брокеров, миссия, планы'
      : 'mrimot, mrimot.com, about us, mister imot, new construction, Bulgaria, platform, real estate, developers, no brokers, mission, roadmap'

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
        ru: `${baseUrl}/ru/o-mister-imot`,
        el: `${baseUrl}/gr/sxetika-me-to-mister-imot`,
        'x-default': `${baseUrl}/about-mister-imot`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
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
  const baseUrl = getSiteUrl() // Hardcoded production domain for canonical URLs
  const isBg = lang === 'bg'
  const isRu = lang === 'ru'
  const brand = brandForLang(lang)
  const socialImage = 'https://ik.imagekit.io/ts59gf2ul/Logo/mister-imot-waving-hi-with-bg.png?tr=w-1200,h-630,cm-pad_resize,bg-FFFFFF,fo-auto,q-85,f-auto&v=20241205'
  
  const rawTitle = isBg
    ? `За Нас – ${brand} | Платформа за ново строителство в България`
    : isRu
      ? `О нас – ${brand} | Платформа новостроек в Болгарии`
      : `About Us – ${brand} | New Construction Platform in Bulgaria`
  const title = formatTitleWithBrand(rawTitle, lang)
  
  const description = isBg
    ? `Научете повече за ${brand} – платформата, която модернизира пазара на ново строителство в България. Директна връзка със строители, без брокери и без комисиони. Нашата мисия, подход и роудмап за развитие.`
    : isRu
      ? `Узнайте больше о ${brand} – платформе, которая модернизирует рынок новостроек в Болгарии. Общайтесь напрямую с застройщиками, без брокеров и комиссий. Наша миссия, подход и планы развития.`
      : `Learn more about ${brand} – the platform modernizing Bulgaria's new construction market. Connect directly with developers, no brokers and 0% commissions. Our mission, approach, and development roadmap.`

  const canonicalUrl = isBg 
    ? `${baseUrl}/bg/za-mistar-imot`
    : isRu
      ? `${baseUrl}/ru/o-mister-imot`
      : `${baseUrl}/about-mister-imot`

  return (
    <>
      <AboutStructuredData lang={lang} baseUrl={baseUrl} />
      <WebPageSchema
        name={title}
        description={description}
        url={canonicalUrl}
        lang={lang}
        baseUrl={baseUrl}
        primaryImageOfPage={socialImage}
      />
      <AboutClient dict={dict} lang={lang} />
    </>
  )
}
