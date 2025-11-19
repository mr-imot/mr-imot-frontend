import { getDictionary } from '../dictionaries'
import ContactClient from './contact-client'
import type { Metadata } from 'next'

interface ContactPageProps {
  params: Promise<{
    lang: 'en' | 'bg'
  }>
}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { lang } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mrimot.com'
  const baseUrl = siteUrl.replace(/\/$/, '')
  
  const isBg = lang === 'bg'
  const brand = isBg ? 'Мистър Имот' : 'Mister Imot'
  
  const title = isBg
    ? `Контакт – ${brand} | Свържете се с нас`
    : `Contact – ${brand} | Get in Touch`
  
  const description = isBg
    ? `Свържете се с ${brand} за въпроси относно ново строителство, партньорства или общи запитвания. Отговоряме бързо и с удоволствие.`
    : `Contact ${brand} for questions about new construction, partnerships, or general inquiries. We respond quickly and are happy to help.`
  
  // Use pretty URL for Bulgarian, canonical for English
  const canonicalUrl = isBg 
    ? `${baseUrl}/bg/kontakt`
    : `${baseUrl}/en/contact`
  
  const ogLocale = isBg ? 'bg_BG' : 'en_US'
  const ogImage = `${baseUrl}/og-image.png`
  
  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}/en/contact`,
        bg: `${baseUrl}/bg/kontakt`,
        'x-default': `${baseUrl}/en/contact`,
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

export default async function ContactPage({ params }: ContactPageProps) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  
  return <ContactClient dict={dict} lang={lang} />
}
