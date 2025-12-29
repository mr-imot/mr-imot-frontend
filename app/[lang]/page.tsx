import { getDictionary } from "./dictionaries"
import { LocalizedHomePage } from "./localized-homepage"
import { brandForLang, formatTitleWithBrand } from "@/lib/seo"
import type { Metadata } from 'next'
import WebPageSchema from "@/components/seo/webpage-schema"

interface HomePageProps {
  params: Promise<{ lang: 'en' | 'bg' | 'ru' | 'gr' }>
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { lang } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mrimot.com'
  const baseUrl = siteUrl.replace(/\/$/, '')
  const dict = await getDictionary(lang)
  const isBg = lang === 'bg'
  const isRu = lang === 'ru'
  const brand = brandForLang(lang)
  const socialImage = 'https://ik.imagekit.io/ts59gf2ul/Logo/mister-imot-waving-hi-with-bg.png?tr=w-1200,h-630,cm-pad_resize,bg-FFFFFF,fo-auto,q-85,f-auto&v=20241205'

  const fallbackTitle = isBg
    ? `${brand} – Имоти директно от строители (без брокери, без комисиони)`
    : `${brand} – Off‑plan properties directly from developers (no brokers, 0% commissions)`

  const fallbackDescription = isBg
    ? `${brand}: единствената платформа в България за ново строителство – директна връзка със строители, без брокери и без комисиони.`
    : `${brand}: Bulgaria's platform for new construction – connect directly with developers, no brokers and 0% commissions.`

  const seoContent = (dict as { seo?: { home?: { title?: string; description?: string; keywords?: string[] } } })?.seo?.home
  const rawTitle = seoContent?.title || fallbackTitle
  const title = formatTitleWithBrand(rawTitle, lang)
  const description = seoContent?.description || fallbackDescription
  const keywords = Array.isArray(seoContent?.keywords) ? seoContent?.keywords : undefined

  const canonicalUrl = `${baseUrl}/${lang}`
  const ogLocale = isBg ? 'bg_BG' : isRu ? 'ru_RU' : 'en_US'
  return {
    title,
    description,
    keywords,
    metadataBase: new URL(baseUrl),
    robots: {
      index: true, // Explicitly allow indexing of homepage
      follow: true,
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}/en`,
        bg: `${baseUrl}/bg`,
        ru: `${baseUrl}/ru`,
          el: `${baseUrl}/gr`,
        'x-default': `${baseUrl}/en`,
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
            ? 'Мистър Имот – Имоти директно от строители'
            : 'Mister Imot – Off‑plan properties directly from developers',
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

export default async function HomePage({ params }: HomePageProps) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mrimot.com'
  const baseUrl = siteUrl.replace(/\/$/, '')
  const isBg = lang === 'bg'
  const isRu = lang === 'ru'
  const brand = brandForLang(lang)
  const socialImage = 'https://ik.imagekit.io/ts59gf2ul/Logo/mister-imot-waving-hi-with-bg.png?tr=w-1200,h-630,cm-pad_resize,bg-FFFFFF,fo-auto,q-85,f-auto&v=20241205'

  const fallbackTitle = isBg
    ? `${brand} – Имоти директно от строители (без брокери, без комисиони)`
    : `${brand} – Off‑plan properties directly from developers (no brokers, 0% commissions)`

  const fallbackDescription = isBg
    ? `${brand}: единствената платформа в България за ново строителство – директна връзка със строители, без брокери и без комисиони.`
    : `${brand}: Bulgaria's platform for new construction – connect directly with developers, no brokers and 0% commissions.`

  const seoContent = (dict as { seo?: { home?: { title?: string; description?: string; keywords?: string[] } } })?.seo?.home
  const rawTitle = seoContent?.title || fallbackTitle
  const title = formatTitleWithBrand(rawTitle, lang)
  const description = seoContent?.description || fallbackDescription
  const canonicalUrl = `${baseUrl}/${lang}`

  // Generate JSON-LD schemas on server
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: lang === 'bg' ? 'Мистър Имот' : 'Mister Imot',
    alternateName: ['mrimot', 'mrimot.com'],
    url: lang === 'bg' ? 'https://mrimot.com/bg' : 'https://mrimot.com/en',
    inLanguage: lang === 'bg' ? 'bg' : 'en',
    logo: 'https://ik.imagekit.io/ts59gf2ul/Logo/mr-imot-logo.png',
    sameAs: [
      'https://www.facebook.com/misterimot/',
      'https://x.com/mister_imot',
      'https://www.instagram.com/mister_imot',
      'https://www.youtube.com/@MisterImot',
      'https://www.tiktok.com/@mister_imot'
    ]
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: lang === 'bg' ? 'Мистър Имот' : 'Mister Imot',
    alternateName: ['mrimot', 'mrimot.com'],
    url: lang === 'bg' ? 'https://mrimot.com/bg' : 'https://mrimot.com/en',
    inLanguage: lang === 'bg' ? 'bg' : 'en',
    potentialAction: {
      "@type": "SearchAction",
      target: `https://mrimot.com/${lang}/listings?query={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": dict.faq?.question1?.question || '',
        "acceptedAnswer": {
          "@type": "Answer",
          "text": dict.faq?.question1?.answer || ''
        }
      },
      {
        "@type": "Question",
        "name": dict.faq?.question2?.question || '',
        "acceptedAnswer": {
          "@type": "Answer",
          "text": dict.faq?.question2?.answer || ''
        }
      },
      {
        "@type": "Question",
        "name": dict.faq?.question3?.question || '',
        "acceptedAnswer": {
          "@type": "Answer",
          "text": dict.faq?.question3?.answer || ''
        }
      },
      {
        "@type": "Question",
        "name": dict.faq?.question4?.question || '',
        "acceptedAnswer": {
          "@type": "Answer",
          "text": dict.faq?.question4?.answer || ''
        }
      },
      {
        "@type": "Question",
        "name": dict.faq?.question5?.question || '',
        "acceptedAnswer": {
          "@type": "Answer",
          "text": dict.faq?.question5?.answer || ''
        }
      },
      {
        "@type": "Question",
        "name": dict.faq?.question6?.question || '',
        "acceptedAnswer": {
          "@type": "Answer",
          "text": dict.faq?.question6?.answer || ''
        }
      },
      {
        "@type": "Question",
        "name": dict.faq?.question7?.question || '',
        "acceptedAnswer": {
          "@type": "Answer",
          "text": dict.faq?.question7?.answer || ''
        }
      },
      {
        "@type": "Question",
        "name": dict.faq?.question8?.question || '',
        "acceptedAnswer": {
          "@type": "Answer",
          "text": dict.faq?.question8?.answer || ''
        }
      },
      {
        "@type": "Question",
        "name": dict.faq?.question9?.question || '',
        "acceptedAnswer": {
          "@type": "Answer",
          "text": dict.faq?.question9?.answer || ''
        }
      }
    ]
  }

  return (
    <>
      {/* JSON-LD Schemas - Server-rendered */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <WebPageSchema
        name={title}
        description={description}
        url={canonicalUrl}
        lang={lang}
        baseUrl={baseUrl}
        primaryImageOfPage={socialImage}
      />
      <LocalizedHomePage dict={dict} lang={lang} />
    </>
  )
}
