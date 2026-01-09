import { buildIkUrl } from "@/lib/imagekit"

interface ContactStructuredDataProps {
  lang: 'en' | 'bg'
  baseUrl: string
}

export default function ContactStructuredData({ lang, baseUrl }: ContactStructuredDataProps) {
  const isBg = lang === 'bg'
  const brand = isBg ? 'Мистър Имот' : 'Mister Imot'
  const contactUrl = isBg ? `${baseUrl}/bg/kontakt` : `${baseUrl}/contact`
  
  // ContactPage Schema
  const contactPageSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": isBg ? "Контакт" : "Contact",
    "description": isBg
      ? `Свържете се с ${brand} за въпроси относно ново строителство, партньорства или общи запитвания.`
      : `Contact ${brand} for questions about new construction, partnerships, or general inquiries.`,
    "url": contactUrl,
    "inLanguage": lang,
    "mainEntity": {
      "@type": "Organization",
      "name": brand,
      "url": `${baseUrl}/${lang}`,
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
      ]
    }
  }

  // LocalBusiness Schema (for better local SEO)
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": brand,
    "url": `${baseUrl}/${lang}`,
    "logo": buildIkUrl("/Logo/mr-imot-logo.png"),
    "description": isBg
      ? "Платформа за ново строителство в България. Директна връзка между купувачи и строители без брокери."
      : "New construction platform in Bulgaria. Direct connection between buyers and developers without brokers.",
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
        "availableLanguage": ["en", "bg"],
        "hoursAvailable": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "09:00",
          "closes": "18:00"
        }
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
        "name": isBg ? "Контакт" : "Contact",
        "item": contactUrl
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  )
}

