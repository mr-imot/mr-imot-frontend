import { getDictionary } from '../dictionaries'
import DevelopersClient from './developers-client'
import type { Metadata } from 'next'

interface DevelopersPageProps {
  params: Promise<{
    lang: 'en' | 'bg'
  }>
}

export async function generateMetadata({ params }: DevelopersPageProps): Promise<Metadata> {
  const { lang } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mrimot.com'
  const baseUrl = siteUrl.replace(/\/$/, '')
  
  const isBg = lang === 'bg'
  const brand = isBg ? 'Мистър Имот' : 'Mister Imot'
  
  const title = isBg
    ? `Верифицирани Строители – ${brand} | Платформа за Ново Строителство`
    : `Verified Developers – ${brand} | New Construction Platform`
  
  const description = isBg
    ? `Открийте верифицирани строители в България. Директна връзка с компании за ново строителство, без посредници. Прегледайте портфолиото и проектите на всеки строител.`
    : `Discover verified developers in Bulgaria. Connect directly with new construction companies, no middlemen. Browse each developer's portfolio and projects.`
  
  // Use pretty URL for Bulgarian, canonical for English
  const canonicalUrl = isBg 
    ? `${baseUrl}/bg/stroiteli`
    : `${baseUrl}/developers`
  
  const ogLocale = isBg ? 'bg_BG' : 'en_US'
  const ogImage = `${baseUrl}/og-image.png`
  
  return {
    title,
    description,
    robots: {
      index: true, // Explicitly allow indexing of developers page
      follow: true,
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
      en: `${baseUrl}/developers`,
        bg: `${baseUrl}/bg/stroiteli`,
      'x-default': `${baseUrl}/developers`,
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

export default async function DevelopersPage({ params }: DevelopersPageProps) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  return <DevelopersClient dict={dict} lang={lang} />
}
