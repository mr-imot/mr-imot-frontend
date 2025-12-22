import { DeveloperProfile } from '@/lib/api'

interface DeveloperStructuredDataProps {
  developer: DeveloperProfile
  lang: 'en' | 'bg' | 'ru' | 'gr'
  baseUrl: string
}

export default function DeveloperStructuredData({ developer, lang, baseUrl }: DeveloperStructuredDataProps) {
  const localizedPath = lang === 'bg' ? 'bg/stroiteli' : lang === 'ru' ? 'ru/zastroyshchiki' : lang === 'gr' ? 'gr/kataskeuastes' : 'developers'
  const developerPath = developer.slug || developer.id
  const developerUrl = `${baseUrl}/${localizedPath}/${developerPath}`
  
  // Breadcrumb translations
  const breadcrumbTranslations = {
    en: { home: 'Home', developers: 'Developers' },
    bg: { home: 'Начало', developers: 'Строители' },
    ru: { home: 'Главная', developers: 'Застройщики' },
    gr: { home: 'Αρχική', developers: 'Κατασκευαστές' }
  }
  const t = breadcrumbTranslations[lang] || breadcrumbTranslations.en
  
  // Helper function to extract city and postal code from address
  const parseAddress = (address: string): { city?: string; postalCode?: string; streetAddress: string } => {
    // Common Bulgarian cities
    const cities = ['Sofia', 'София', 'Plovdiv', 'Пловдив', 'Varna', 'Варна', 'Burgas', 'Бургас', 'Ruse', 'Русе', 'Stara Zagora', 'Стара Загора']
    
    // Try to extract postal code (4 digits, usually at the end before city name)
    const postalCodeMatch = address.match(/\b(\d{4})\b/)
    const postalCode = postalCodeMatch ? postalCodeMatch[1] : undefined
    
    // Try to find city name in address
    let city: string | undefined
    for (const cityName of cities) {
      if (address.includes(cityName)) {
        city = cityName === 'Sofia' || cityName === 'София' ? 'Sofia' 
             : cityName === 'Plovdiv' || cityName === 'Пловдив' ? 'Plovdiv'
             : cityName === 'Varna' || cityName === 'Варна' ? 'Varna'
             : cityName === 'Burgas' || cityName === 'Бургас' ? 'Burgas'
             : cityName === 'Ruse' || cityName === 'Русе' ? 'Ruse'
             : cityName === 'Stara Zagora' || cityName === 'Стара Загора' ? 'Stara Zagora'
             : cityName
        break
      }
    }
    
    return {
      streetAddress: address,
      city,
      postalCode
    }
  }
  
  // Multi-language description helper
  const getDescription = (companyName: string, projectCount: number): string => {
    if (lang === 'bg') {
      return `${companyName} е верифициран инвеститор в Мистър Имот с ${projectCount} проект${projectCount > 1 ? 'а' : ''}.`
    } else if (lang === 'ru') {
      return `${companyName} — проверенный застройщик в Мистер Имот с ${projectCount} проект${projectCount > 1 ? 'ами' : 'ом'}.`
    } else if (lang === 'gr') {
      return `${companyName} είναι ένας επαληθευμένος επενδυτής στο Mister Imot με ${projectCount} έργ${projectCount > 1 ? 'α' : 'ο'}.`
    }
    return `${companyName} is a verified real estate developer on Mister Imot with ${projectCount} project${projectCount > 1 ? 's' : ''}.`
  }

  // Default fallback logo
  const logoUrl = developer.profile_image_url || "https://ik.imagekit.io/ts59gf2ul/Logo/mr-imot-logo-no-background.png?tr=w-1200,h-630"
  
  // Organization Schema for Developer (always render if developer exists)
  const developerOrganizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": developerUrl,
    "name": developer.company_name,
    "url": developerUrl,
    "logo": {
      "@type": "ImageObject",
      "url": logoUrl
    },
    "image": {
      "@type": "ImageObject",
      "url": logoUrl
    },
    ...(developer.phone && { "telephone": developer.phone }),
    ...(developer.email && { "email": developer.email }),
    ...(developer.website && { 
      "sameAs": [developer.website] 
    }),
    ...(developer.is_verified && developer.office_address && {
      "address": (() => {
        const parsedAddress = parseAddress(developer.office_address)
        return {
          "@type": "PostalAddress",
          "streetAddress": parsedAddress.streetAddress,
          "addressCountry": "BG",
          ...(parsedAddress.city && { "addressLocality": parsedAddress.city }),
          ...(parsedAddress.postalCode && { "postalCode": parsedAddress.postalCode })
        }
      })()
    }),
    "knowsAbout": [
      "New residential construction",
      "Real estate development",
      "Apartment buildings"
    ],
    ...(developer.total_projects && developer.total_projects > 0 && {
      "description": getDescription(developer.company_name, developer.total_projects),
      "priceRange": "$$$" // Optional: indicates mid-to-high price range
    })
  }
  
  // LocalBusiness Schema (only if office_address exists and developer is verified)
  const localBusinessSchema = developer.is_verified && developer.office_address ? (() => {
    const parsedAddress = parseAddress(developer.office_address)
    
    return {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": `${developerUrl}#business`,
      "name": developer.company_name,
      "url": developerUrl,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": parsedAddress.streetAddress,
        "addressCountry": "BG",
        ...(parsedAddress.city && { "addressLocality": parsedAddress.city }),
        ...(parsedAddress.postalCode && { "postalCode": parsedAddress.postalCode })
      },
    ...(developer.office_latitude && developer.office_longitude && {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": developer.office_latitude,
        "longitude": developer.office_longitude
      }
    }),
    ...(developer.phone && { "telephone": developer.phone }),
    ...(developer.email && { "email": developer.email }),
    "logo": {
      "@type": "ImageObject",
      "url": logoUrl
    },
    "image": {
      "@type": "ImageObject",
      "url": logoUrl
    },
    // Link to parent Organization (only reference, no duplicate data)
    "parentOrganization": {
      "@type": "Organization",
      "@id": developerUrl
    }
    }
  })() : null
  
  // BreadcrumbList Schema
  const developersListUrl = lang === 'en' 
    ? `${baseUrl}/developers` 
    : lang === 'bg'
      ? `${baseUrl}/bg/stroiteli`
      : lang === 'ru'
        ? `${baseUrl}/ru/zastroyshchiki`
        : lang === 'gr'
          ? `${baseUrl}/gr/kataskeuastes`
          : `${baseUrl}/developers`
  
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": t.home,
        "item": lang === 'en' ? baseUrl : `${baseUrl}/${lang}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": t.developers,
        "item": developersListUrl
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": developer.company_name,
        "item": developerUrl
      }
    ]
  }
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(developerOrganizationSchema) }}
      />
      {localBusinessSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  )
}

