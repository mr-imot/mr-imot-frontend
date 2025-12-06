import { getDictionary } from "../dictionaries"
import { LocalizedListingsPage } from "./localized-listings-page"
import type { Metadata } from 'next'

interface ListingsPageProps {
  params: Promise<{ lang: 'en' | 'bg' }>
}

export async function generateMetadata({ params }: ListingsPageProps): Promise<Metadata> {
  const { lang } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mrimot.com'
  const baseUrl = siteUrl.replace(/\/$/, '')
  const socialImage = 'https://ik.imagekit.io/ts59gf2ul/Logo/mister-imot-waving-hi-with-bg.png?tr=w-1200,h-630,cm-pad_resize,bg-FFFFFF,fo-auto,q-85,f-auto&v=20241205'
  
  const isBg = lang === 'bg'
  const brand = isBg ? 'Мистър Имот' : 'Mister Imot'
  
  const title = isBg
    ? `Обяви за Ново Строителство – ${brand} | Без Брокери, Без Комисионни`
    : `New Construction Listings – ${brand} | No Brokers, 0% Commission`
  
  const description = isBg
    ? `Открийте най-добрите обяви за ново строителство в България. Директна връзка със строители, без посредници. Апартаменти и къщи в София, Пловдив, Варна и други градове.`
    : `Discover the best new construction listings in Bulgaria. Connect directly with developers, no middlemen. Apartments and houses in Sofia, Plovdiv, Varna, and other cities.`
  
  // Use pretty URL for Bulgarian, canonical for English
  const canonicalUrl = isBg 
    ? `${baseUrl}/bg/obiavi`
    : `${baseUrl}/listings`
  
  const ogLocale = isBg ? 'bg_BG' : 'en_US'
  
  return {
    title,
    description,
    robots: {
      index: true, // Explicitly allow indexing of listings page
      follow: true,
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
      en: `${baseUrl}/listings`,
        bg: `${baseUrl}/bg/obiavi`,
      'x-default': `${baseUrl}/listings`,
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
          alt: title,
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

export default async function ListingsPage({ params }: ListingsPageProps) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return <LocalizedListingsPage dict={dict} lang={lang} />
}