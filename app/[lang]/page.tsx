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
      
      {/* Critical CSS - Comprehensive above-the-fold styles to eliminate render-blocking CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{line-height:1.5;-webkit-text-size-adjust:100%;font-family:var(--font-inter),system-ui,-apple-system,sans-serif;scroll-behavior:smooth}
body{margin:0;color:#111827;background:#fff;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;min-height:100vh;overflow-x:hidden}
img,picture,video,canvas,svg{display:block;max-width:100%;height:auto}
a{color:inherit;text-decoration:none}
button{font:inherit;cursor:pointer}

.min-h-screen{min-height:100vh}
.flex{display:flex}
.flex-1{flex:1 1 0%}
.flex-col{flex-direction:column}
.relative{position:relative}
.items-center{align-items:center}
.justify-between{justify-content:space-between}
.justify-center{justify-content:center}
.space-x-3>*+*{margin-left:0.75rem}
.space-x-4>*+*{margin-left:1rem}
.hidden{display:none}
.text-white{color:#fff}
.text-sm{font-size:0.875rem;line-height:1.25rem}
.font-medium{font-weight:500}
.font-semibold{font-weight:600}
.font-bold{font-weight:700}
.rounded-full{border-radius:9999px}
.uppercase{text-transform:uppercase}
.tracking-wide{letter-spacing:0.025em}
.transition-all{transition:all 0.3s}

.header-glass{position:sticky;top:0;z-index:50;background:rgba(255,255,255,0.3);-webkit-backdrop-filter:blur(20px) saturate(180%);backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid rgba(255,255,255,0.4);box-shadow:0 4px 6px -1px rgba(0,0,0,0.1)}
.header-glass .logo-circle{width:3.5rem;height:3.5rem;border-radius:9999px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center}
.bg-charcoal-500{background-color:#264653}
.bg-charcoal-700{background-color:#609db6}
.hover\\:bg-charcoal-600:hover{background-color:#3f7489}
.hover\\:bg-charcoal-800:hover{background-color:#95bece}
.px-4{padding-left:1rem;padding-right:1rem}
.px-5{padding-left:1.25rem;padding-right:1.25rem}
.px-6{padding-left:1.5rem;padding-right:1.5rem}
.py-2{padding-top:0.5rem;padding-bottom:0.5rem}
.py-2\\.5{padding-top:0.625rem;padding-bottom:0.625rem}
.py-4{padding-top:1rem;padding-bottom:1rem}
.pl-4{padding-left:1rem}
.pr-0{padding-right:0}
.border{border-width:1px}
.border-charcoal-600{border-color:#3f7489}
.shadow-sm{box-shadow:0 1px 2px 0 rgba(0,0,0,0.05)}
.w-14{width:3.5rem}
.h-14{height:3.5rem}
.w-full{width:100%}

.hero-section{position:relative;overflow:visible;height:calc(100vh - var(--header-height,80px))}
@supports(height:100dvh){.hero-section{height:calc(100dvh - var(--header-height,80px))}}
.hero-section>.max-w-7xl{margin-left:auto;margin-right:auto;max-width:80rem;height:100%;display:grid;align-content:center}
.hero-grid{display:grid;grid-template-rows:auto 1fr;gap:0.5rem;align-items:center;width:100%;height:100%}
.hero-content{order:2;display:flex;flex-direction:column;min-height:0}
.hero-title{line-height:1!important;padding-bottom:0.15em!important;letter-spacing:-0.025em;font-family:var(--font-geist),Georgia,serif;font-size:clamp(2.75rem,6vw,4.75rem)}
.hero-subtitle{font-size:clamp(1rem,2.5vw,1.25rem);line-height:1.6;max-width:520px;font-family:var(--font-inter),system-ui,sans-serif;color:#4b5563}
.hero-cta{margin-top:auto}
.hero-cta button{width:100%;padding:1.25rem 2.5rem;border-radius:1rem;background-color:#264653;color:#fff;font-weight:700;text-transform:uppercase;font-size:clamp(1rem,3vw,1.5rem);font-family:var(--font-inter),system-ui,sans-serif;cursor:pointer;border:none;position:relative;overflow:hidden}
.hero-visual{display:none}
.headline-gradient{background:linear-gradient(to right,#0f1c22,#264653,#3f7489);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;padding-bottom:0.06em}
.bg-green-600{background-color:#16a34a}
.text-gray-600{color:#4b5563}
.text-gray-800{color:#1f2937}
.text-slate-900\\/70{color:rgba(15,23,42,0.7)}
.gap-3{gap:0.75rem}
.mb-3{margin-bottom:0.75rem}
.space-y-2>*+*{margin-top:0.5rem}
.w-3{width:0.75rem}
.h-3{height:0.75rem}
.flex-shrink-0{flex-shrink:0}
.drop-shadow-sm{filter:drop-shadow(0 1px 1px rgba(0,0,0,0.05))}
.italic{font-style:italic}
.font-normal{font-weight:400}
.mr-2{margin-right:0.5rem}

@media(min-width:640px){
  .sm\\:px-6{padding-left:1.5rem;padding-right:1.5rem}
  .sm\\:pr-6{padding-right:1.5rem}
  .sm\\:w-auto{width:auto}
  .hero-cta button{width:auto}
}
@media(min-width:768px){
  .md\\:px-8{padding-left:2rem;padding-right:2rem}
  .md\\:flex{display:flex}
  .md\\:hidden{display:none}
  .md\\:block{display:block}
  .md\\:grid{display:grid}
  .md\\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}
  .md\\:space-x-6>*+*{margin-left:1.5rem}
}
@media(min-width:1024px){
  .lg\\:flex{display:flex}
  .lg\\:order-none{order:0}
  .hero-grid{grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:none;gap:2rem}
  .hero-content{order:unset}
  .hero-title{line-height:0.92!important}
  .hero-visual{display:flex;align-items:center;justify-content:flex-end;height:100%}
}
      ` }} />
      <LocalizedHomePage dict={dict} lang={lang} />
    </>
  )
}
