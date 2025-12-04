interface AboutStructuredDataProps {
  lang: 'en' | 'bg'
  baseUrl: string
}

export default function AboutStructuredData({ lang, baseUrl }: AboutStructuredDataProps) {
  const isBg = lang === 'bg'
  const brand = isBg ? 'Мистър Имот' : 'Mister Imot'
  const aboutUrl = isBg ? `${baseUrl}/bg/za-mistar-imot` : `${baseUrl}/en/about-mister-imot`
  
  // AboutPage Schema
  const aboutPageSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": isBg ? "За Нас" : "About Us",
    "description": isBg
      ? `Научете повече за ${brand} – платформата, която модернизира пазара на ново строителство в България.`
      : `Learn more about ${brand} – the platform modernizing Bulgaria's new construction market.`,
    "url": aboutUrl,
    "inLanguage": lang,
    "mainEntity": {
      "@type": "Organization",
      "name": brand,
      "url": `${baseUrl}/${lang}`,
      "logo": "https://ik.imagekit.io/ts59gf2ul/Logo/mr-imot-logo.png",
      "description": isBg
        ? "Платформа за ново строителство в България. Директна връзка между купувачи и строители без брокери."
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
        isBg ? "Ново строителство" : "New Construction",
        isBg ? "Недвижими имоти" : "Real Estate",
        isBg ? "Оф-план проекти" : "Off-Plan Properties",
        isBg ? "Директни продажби" : "Direct Sales"
      ]
    }
  }

  // Organization Schema (enhanced)
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": brand,
    "url": `${baseUrl}/${lang}`,
    "logo": "https://ik.imagekit.io/ts59gf2ul/Logo/mr-imot-logo.png",
    "description": isBg
      ? "Платформа за ново строителство в България. Директна връзка между купувачи и строители без брокери и комисионни."
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
        "availableLanguage": ["en", "bg"]
      },
      {
        "@type": "ContactPoint",
        "email": "support@mrimot.com",
        "contactType": "customer support",
        "areaServed": "BG",
        "availableLanguage": ["en", "bg"]
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
      isBg ? "Ново строителство" : "New Construction",
      isBg ? "Недвижими имоти" : "Real Estate",
      isBg ? "Оф-план проекти" : "Off-Plan Properties",
      isBg ? "Директни продажби" : "Direct Sales",
      isBg ? "Платформа за имоти" : "Real Estate Platform"
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
        "name": isBg ? "Начало" : "Home",
        "item": `${baseUrl}/${lang}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": isBg ? "За Нас" : "About Us",
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

