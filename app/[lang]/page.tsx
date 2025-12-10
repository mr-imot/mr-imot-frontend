import { getDictionary } from "./dictionaries"
import { LocalizedHomePage } from "./localized-homepage"
import { brandForLang, formatTitleWithBrand } from "@/lib/seo"
import type { Metadata } from 'next'

interface HomePageProps {
  params: Promise<{ lang: 'en' | 'bg' }>
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { lang } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mrimot.com'
  const baseUrl = siteUrl.replace(/\/$/, '')
  const dict = await getDictionary(lang)
  const isBg = lang === 'bg'
  const brand = brandForLang(lang)
  const socialImage = 'https://ik.imagekit.io/ts59gf2ul/Logo/mister-imot-waving-hi-with-bg.png?tr=w-1200,h-630,cm-pad_resize,bg-FFFFFF,fo-auto,q-85,f-auto&v=20241205'

  const fallbackTitle = isBg
    ? `${brand} – Имоти директно от строители (без брокери, без комисионни)`
    : `${brand} – Off‑plan properties directly from developers (no brokers, 0% commissions)`

  const fallbackDescription = isBg
    ? `${brand}: единствената платформа в България за ново строителство – директна връзка със строители, без брокери и без комисионни.`
    : `${brand}: Bulgaria's platform for new construction – connect directly with developers, no brokers and 0% commissions.`

  const seoContent = (dict as { seo?: { home?: { title?: string; description?: string; keywords?: string[] } } })?.seo?.home
  const rawTitle = seoContent?.title || fallbackTitle
  const title = formatTitleWithBrand(rawTitle, lang)
  const description = seoContent?.description || fallbackDescription
  const keywords = Array.isArray(seoContent?.keywords) ? seoContent?.keywords : undefined

  const canonicalUrl = `${baseUrl}/${lang}`
  const ogLocale = isBg ? 'bg_BG' : 'en_US'
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
        'x-default': `${baseUrl}/en`,
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

  // Generate JSON-LD schemas on server
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: lang === 'bg' ? 'Мистър Имот' : 'Mister Imot',
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
      
      {/* Critical CSS for above-the-fold hero section */}
      <style dangerouslySetInnerHTML={{ __html: `
        .hero-section{min-height:100vh;position:relative}
        .hero-section .max-w-7xl{margin-left:auto;margin-right:auto;max-width:80rem}
        .hero-section .px-4{padding-left:1rem;padding-right:1rem}
        @media(min-width:640px){.hero-section .sm\\:px-6{padding-left:1.5rem;padding-right:1.5rem}}
        @media(min-width:768px){.hero-section .md\\:px-8{padding-left:2rem;padding-right:2rem}}
        .hero-grid{display:grid;grid-template-rows:auto 1fr;gap:0.5rem;align-items:center;width:100%}
        @media(min-width:1024px){.hero-grid{grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:none;gap:2rem}}
        .hero-content{order:2;display:flex;flex-direction:column}
        @media(min-width:1024px){.hero-content{order:unset}}
        .hero-title{line-height:0.72;letter-spacing:-0.025em;font-family:var(--font-serif);font-size:clamp(2.75rem,6vw,4.75rem)}
        .hero-subtitle{font-size:clamp(1.2rem,3vw,1.25rem);line-height:1.6;max-width:clamp(320px,90%,520px);font-family:var(--font-sans)}
        .hero-cta button{width:100%;padding:clamp(1.125rem,2.75vw,1.75rem) clamp(2.25rem,5.5vw,3.5rem);border-radius:1rem;background-color:#264653;color:#fff;font-weight:700;text-transform:uppercase;font-size:clamp(1.25rem,3.5vw,1.75rem);font-family:var(--font-sans);cursor:pointer}
        @media(min-width:640px){.hero-cta button{width:auto}}
      ` }} />
      <LocalizedHomePage dict={dict} lang={lang} />
    </>
  )
}
