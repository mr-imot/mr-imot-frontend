import { getDictionary } from '../dictionaries'
import ContactClient from './contact-client'
import ContactStructuredData from './contact-structured-data'
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
  const socialImage = 'https://ik.imagekit.io/ts59gf2ul/Logo/mister-imot-waving-hi-with-bg.png?tr=w-1200,h-630,cm-pad_resize,bg-FFFFFF,fo-auto,q-85,f-auto&v=20241205'
  
  const title = isBg
    ? `Контакт – ${brand} | Свържете се с нас`
    : `Contact – ${brand} | Get in Touch`
  
  const description = isBg
    ? `Свържете се с ${brand} за въпроси относно ново строителство, партньорства или общи запитвания. Отговоряме бързо и с удоволствие.`
    : `Contact ${brand} for questions about new construction, partnerships, or general inquiries. We respond quickly and are happy to help.`
  
  // Use pretty URL for Bulgarian, canonical for English
  const canonicalUrl = isBg 
    ? `${baseUrl}/bg/kontakt`
    : `${baseUrl}/contact`
  
  const ogLocale = isBg ? 'bg_BG' : 'en_US'
  const keywords = isBg
    ? 'контакт, свържете се, поддръжка, ново строителство, имоти, България, запитвания'
    : 'contact, support, customer service, new construction, real estate, Bulgaria, inquiries'

  return {
    title,
    description,
    keywords,
    metadataBase: new URL(baseUrl),
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}/contact`,
        bg: `${baseUrl}/bg/kontakt`,
        'x-default': `${baseUrl}/contact`,
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
            ? 'Мистър Имот – Контакт'
            : 'Mister Imot – Contact',
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

export default async function ContactPage({ params }: ContactPageProps) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mrimot.com'
  const baseUrl = siteUrl.replace(/\/$/, '')
  
  return (
    <>
      <ContactStructuredData lang={lang} baseUrl={baseUrl} />
      <ContactClient dict={dict} lang={lang} />
    </>
  )
}
