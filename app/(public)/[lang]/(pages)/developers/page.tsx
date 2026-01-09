import { getDictionary } from '@/lib/dictionaries'
import DevelopersClient from './developers-client'
import { brandForLang, formatTitleWithBrand, getSiteUrl } from '@/lib/seo'
import type { Metadata } from 'next'
import WebPageSchema from '@/components/seo/webpage-schema'
import { buildIkUrl } from '@/lib/imagekit'

// Enable SSG for all language variants
export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'bg' }, { lang: 'ru' }, { lang: 'gr' }]
}

interface DevelopersPageProps {
  params: Promise<{
    lang: 'en' | 'bg' | 'ru' | 'gr'
  }>
}

export async function generateMetadata({ params }: DevelopersPageProps): Promise<Metadata> {
  const { lang } = await params
  const baseUrl = getSiteUrl() // Hardcoded production domain for canonical URLs
  
  const isBg = lang === 'bg'
  const isRu = lang === 'ru'
  const brand = brandForLang(lang)
  const socialImage = buildIkUrl("/Logo/mister-imot-waving-hi-with-bg.png", [
    { width: 1200, height: 630, quality: 85, format: "webp", focus: "auto" },
  ])
  
  const rawTitle = isBg
    ? `Верифицирани Строители – ${brand} | Платформа за Ново Строителство`
    : isRu
      ? `Застройщики – ${brand} | Новостройки в Болгарии`
      : `Verified Developers – ${brand} | New Construction Platform`
  const title = formatTitleWithBrand(rawTitle, lang)
  
  const description = isBg
    ? `Открийте верифицирани строители в България. Директна връзка с компании за ново строителство, без посредници. Прегледайте портфолиото и проектите на всеки строител.`
    : isRu
      ? `Найдите проверенных застройщиков в Болгарии. Общайтесь напрямую, без посредников и комиссий. Смотрите портфолио и проекты каждого застройщика.`
      : `Discover verified developers in Bulgaria. Connect directly with new construction companies, no middlemen. Browse each developer's portfolio and projects.`
  
  // Use pretty URL for Bulgarian and Russian, canonical for English
  const canonicalUrl = isBg 
    ? `${baseUrl}/bg/stroiteli`
    : isRu
      ? `${baseUrl}/ru/zastroyshchiki`
      : `${baseUrl}/developers`
  
  const ogLocale = isBg ? 'bg_BG' : isRu ? 'ru_RU' : 'en_US'
  return {
    title,
    description,
    metadataBase: new URL(baseUrl),
    robots: {
      index: true, // Explicitly allow indexing of developers page
      follow: true,
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}/developers`,
        bg: `${baseUrl}/bg/stroiteli`,
        ru: `${baseUrl}/ru/zastroyshchiki`,
        el: `${baseUrl}/gr/kataskeuastes`,
        'x-default': `${baseUrl}/developers`,
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
            ? 'Мистър Имот – Верифицирани строители'
            : 'Mister Imot – Verified developers',
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

export default async function DevelopersPage({ params }: DevelopersPageProps) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  const baseUrl = getSiteUrl() // Hardcoded production domain for canonical URLs
  const isBg = lang === 'bg'
  const isRu = lang === 'ru'
  const canonicalUrl = isBg 
    ? `${baseUrl}/bg/stroiteli`
    : isRu
      ? `${baseUrl}/ru/zastroyshchiki`
      : `${baseUrl}/developers`
  const brand = brandForLang(lang)
  const rawTitle = isBg
    ? `Верифицирани Строители – ${brand} | Платформа за Ново Строителство`
    : isRu
      ? `Застройщики – ${brand} | Новостройки в Болгарии`
      : `Verified Developers – ${brand} | New Construction Platform`
  const title = formatTitleWithBrand(rawTitle, lang)
  const description = isBg
    ? `Открийте верифицирани строители в България. Директна връзка с компании за ново строителство, без посредници. Прегледайте портфолиото и проектите на всеки строител.`
    : isRu
      ? `Найдите проверенных застройщиков в Болгарии. Общайтесь напрямую, без посредников и комиссий. Смотрите портфолио и проекты каждого застройщика.`
      : `Discover verified developers in Bulgaria. Connect directly with new construction companies, no middlemen. Browse each developer's portfolio and projects.`
  const socialImage = buildIkUrl("/Logo/mister-imot-waving-hi-with-bg.png", [
    { width: 1200, height: 630, quality: 85, format: "webp", focus: "auto" },
  ])

  return (
    <>
      <WebPageSchema
        name={title}
        description={description}
        url={canonicalUrl}
        lang={lang}
        baseUrl={baseUrl}
        primaryImageOfPage={socialImage}
      />
      <DevelopersClient dict={dict} lang={lang} />
    </>
  )
}
