import { buildIkUrl } from "@/lib/imagekit"

interface AboutStructuredDataProps {
  lang: 'en' | 'bg' | 'ru' | 'gr'
  baseUrl: string
}

export default function AboutStructuredData({ lang, baseUrl }: AboutStructuredDataProps) {
  const isBg = lang === 'bg'
  const isRu = lang === 'ru'
  const isGr = lang === 'gr'
  
  const brand = isBg ? 'Мистър Имот' : isRu ? 'Мистер Имот' : 'Mister Imot'
  const aboutUrl = isBg 
    ? `${baseUrl}/bg/za-mistar-imot`
    : isRu
      ? `${baseUrl}/ru/o-mister-imot`
      : isGr
        ? `${baseUrl}/gr/sxetika-me-to-mister-imot`
        : `${baseUrl}/about-mister-imot`
  
  // AboutPage Schema
  const aboutPageName = isBg ? "За Нас" : isRu ? "О нас" : isGr ? "Σχετικά με εμάς" : "About Us"
  const aboutPageDescription = isBg
    ? `Научете повече за ${brand} – платформата, която модернизира пазара на ново строителство в България.`
    : isRu
      ? `Узнайте больше о ${brand} – платформе, которая модернизирует рынок новостроек в Болгарии.`
      : isGr
        ? `Μάθετε περισσότερα για το ${brand} – την πλατφόρμα που εκσυγχρονίζει την αγορά νέων κατασκευών στη Βουλγαρία.`
        : `Learn more about ${brand} – the platform modernizing Bulgaria's new construction market.`
  
  const langToLocale: Record<string, string> = {
    en: 'en_US',
    bg: 'bg_BG',
    ru: 'ru_RU',
    gr: 'el_GR'
  }
  
  const aboutPageSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": aboutPageName,
    "description": aboutPageDescription,
    "url": aboutUrl,
    "inLanguage": langToLocale[lang] || 'en_US',
    "mainEntity": {
      "@type": "Organization",
      "name": brand,
      "url": `${baseUrl}/${lang}`,
      "logo": buildIkUrl("/Logo/mr-imot-logo.png"),
      "description": isBg
        ? "Платформа за ново строителство в България. Директна връзка между купувачи и строители без брокери."
        : isRu
          ? "Платформа новостроек в Болгарии. Прямая связь между покупателями и застройщиками без брокеров."
          : isGr
            ? "Πλατφόρμα νέων κατασκευών στη Βουλγαρία. Άμεση σύνδεση μεταξύ αγοραστών και κατασκευαστών χωρίς μεσίτες."
            : "New construction platform in Bulgaria. Direct connection between buyers and developers without brokers.",
      "foundingDate": "2025",
      "founder": {
        "@type": "Organization",
        "name": "Prodigy Corp"
      },
      "areaServed": {
        "@type": "Country",
        "name": "Bulgaria"
      },
      "knowsAbout": [
        isBg ? "Ново строителство" : isRu ? "Новостройки" : isGr ? "Νέες κατασκευές" : "New Construction",
        isBg ? "Недвижими имоти" : isRu ? "Недвижимость" : isGr ? "Ακίνητα" : "Real Estate",
        isBg ? "Оф-план проекти" : isRu ? "Оф-план проекты" : isGr ? "Έργα εκ των προτέρων" : "Off-Plan Properties",
        isBg ? "Директни продажби" : isRu ? "Прямые продажи" : isGr ? "Άμεσες πωλήσεις" : "Direct Sales"
      ]
    }
  }

  // Organization Schema (enhanced)
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": brand,
    "url": `${baseUrl}/${lang}`,
    "logo": buildIkUrl("/Logo/mr-imot-logo.png"),
    "description": isBg
      ? "Платформа за ново строителство в България. Директна връзка между купувачи и строители без брокери и комисиони."
      : isRu
        ? "Платформа новостроек в Болгарии. Прямая связь между покупателями и застройщиками без брокеров и комиссий."
        : isGr
          ? "Πλατφόρμα νέων κατασκευών στη Βουλγαρία. Άμεση σύνδεση μεταξύ αγοραστών και κατασκευαστών χωρίς μεσίτες και προμήθειες."
          : "New construction platform in Bulgaria. Direct connection between buyers and developers without brokers and commissions.",
    "foundingDate": "2025",
    "founder": {
      "@type": "Organization",
      "name": "Prodigy Corp"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "BG"
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+359-899-520-856",
        "contactType": "customer service",
        "areaServed": "BG",
        "availableLanguage": ["en", "bg", "ru", "el"]
      },
      {
        "@type": "ContactPoint",
        "email": "support@mrimot.com",
        "contactType": "customer support",
        "areaServed": "BG",
        "availableLanguage": ["en", "bg", "ru", "el"]
      }
    ],
    "sameAs": [
      "https://www.facebook.com/misterimot/",
      "https://x.com/mister_imot",
      "https://www.instagram.com/mister_imot",
      "https://www.youtube.com/@MisterImot",
      "https://www.tiktok.com/@mister_imot"
    ],
    "knowsAbout": [
      isBg ? "Ново строителство" : isRu ? "Новостройки" : isGr ? "Νέες κατασκευές" : "New Construction",
      isBg ? "Недвижими имоти" : isRu ? "Недвижимость" : isGr ? "Ακίνητα" : "Real Estate",
      isBg ? "Оф-план проекти" : isRu ? "Оф-план проекты" : isGr ? "Έργα εκ των προτέρων" : "Off-Plan Properties",
      isBg ? "Директни продажби" : isRu ? "Прямые продажи" : isGr ? "Άμεσες πωλήσεις" : "Direct Sales",
      isBg ? "Платформа за имоти" : isRu ? "Платформа недвижимости" : isGr ? "Πλατφόρμα ακινήτων" : "Real Estate Platform"
    ]
  }

  // BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": isBg ? "Начало" : isRu ? "Главная" : isGr ? "Αρχική" : "Home",
        "item": `${baseUrl}/${lang}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": aboutPageName,
        "item": aboutUrl
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  )
}

