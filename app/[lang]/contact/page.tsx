import { getDictionary } from '../dictionaries'
import ContactClient from './contact-client'
import ContactStructuredData from './contact-structured-data'
import { brandForLang, formatTitleWithBrand, getSiteUrl } from '@/lib/seo'
import type { Metadata } from 'next'
import WebPageSchema from '@/components/seo/webpage-schema'

// Enable SSG for all language variants
export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'bg' }, { lang: 'ru' }, { lang: 'gr' }]
}

interface ContactPageProps {
  params: Promise<{
    lang: 'en' | 'bg' | 'ru' | 'gr'
  }>
}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { lang } = await params
  const baseUrl = getSiteUrl() // Hardcoded production domain for canonical URLs
  
  const isBg = lang === 'bg'
  const brand = brandForLang(lang)
  const socialImage = 'https://ik.imagekit.io/ts59gf2ul/Logo/mister-imot-waving-hi-with-bg.png?tr=w-1200,h-630,cm-pad_resize,bg-FFFFFF,fo-auto,q-85,f-auto&v=20241205'
  
  const rawTitle = isBg
    ? `Контакт – ${brand} | Свържете се с нас`
    : `Contact – ${brand} | Get in Touch`
  const title = formatTitleWithBrand(rawTitle, lang)
  
  const description = isBg
    ? `Свържете се с ${brand} за въпроси относно ново строителство, партньорства или общи запитвания. Отговоряме бързо и с удоволствие.`
    : `Contact ${brand} for questions about new construction, partnerships, or general inquiries. We respond quickly and are happy to help.`
  
  // Use pretty URL for Bulgarian, canonical for English
  const canonicalUrl = isBg 
    ? `${baseUrl}/bg/kontakt`
    : `${baseUrl}/contact`
  
  const ogLocale = isBg ? 'bg_BG' : 'en_US'
  const keywords = isBg
    ? 'mrimot, mrimot.com, контакт, свържете се, поддръжка, ново строителство, имоти, България, запитвания'
    : 'mrimot, mrimot.com, contact, support, customer service, new construction, real estate, Bulgaria, inquiries'

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
        ru: `${baseUrl}/ru/kontakty`,
        el: `${baseUrl}/gr/epikoinonia`,
        'x-default': `${baseUrl}/contact`,
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
  const baseUrl = getSiteUrl() // Hardcoded production domain for canonical URLs
  const isBg = lang === 'bg'
  const brand = brandForLang(lang)
  const socialImage = 'https://ik.imagekit.io/ts59gf2ul/Logo/mister-imot-waving-hi-with-bg.png?tr=w-1200,h-630,cm-pad_resize,bg-FFFFFF,fo-auto,q-85,f-auto&v=20241205'
  
  const rawTitle = isBg
    ? `Контакт – ${brand} | Свържете се с нас`
    : `Contact – ${brand} | Get in Touch`
  const title = formatTitleWithBrand(rawTitle, lang)
  
  const description = isBg
    ? `Свържете се с ${brand} за въпроси относно ново строителство, партньорства или общи запитвания. Отговоряме бързо и с удоволствие.`
    : `Contact ${brand} for questions about new construction, partnerships, or general inquiries. We respond quickly and are happy to help.`
  
  const canonicalUrl = isBg 
    ? `${baseUrl}/bg/kontakt`
    : `${baseUrl}/contact`

  return (
    <>
      <ContactStructuredData lang={lang} baseUrl={baseUrl} />
      <WebPageSchema
        name={title}
        description={description}
        url={canonicalUrl}
        lang={lang}
        baseUrl={baseUrl}
        primaryImageOfPage={socialImage}
      />
      <ContactClient dict={dict} lang={lang} />
    </>
  )
}
