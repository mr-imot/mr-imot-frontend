import { Project } from '@/lib/api'
import { buildIkUrl } from '@/lib/imagekit'
import { listingsHref, cityListingsHref, listingHref } from '@/lib/routes'
import { getCityKeyFromCityType } from '@/lib/city-registry'

interface ListingStructuredDataProps {
  project: Project
  lang: 'en' | 'bg' | 'ru' | 'gr'
  baseUrl: string
}

/**
 * Enhanced price extraction for multilingual real estate listings
 * Handles: European formats, US formats, multiple currencies, edge cases
 */
function extractNumericPrice(priceLabel: string | undefined | null): number | null {
  if (!priceLabel) return null
  
  // Skip non-numeric price indicators (multilingual)
  const skipPatterns = [
    // English
    'contact', 'call', 'request', 'tbd', 'tba', 'coming soon', 'inquire',
    // Bulgarian  
    'запитване', 'свържете', 'обадете', 'по договаряне',
    // Russian
    'свяжитесь', 'позвоните', 'договорная', 'запрос',
    // Greek
    'επικοινωνήστε', 'τηλεφωνήστε', 'συζητήσιμη'
  ]
  
  const lowerLabel = priceLabel.toLowerCase()
  if (skipPatterns.some(pattern => lowerLabel.includes(pattern))) {
    return null
  }
  
  // Remove currency symbols, units, and prefixes
  const cleaned = priceLabel
    .replace(/€|EUR|лв|BGN|\$|USD|₽|RUB/gi, '') // Currency symbols
    .replace(/\/m²|per m²|на м²|кв\.м|за кв\.м/gi, '') // Unit indicators
    .replace(/from|starting|от|начиная|από/gi, '') // Prefix words
    .replace(/\s+/g, '') // All whitespace
    .trim()
  
  // Extract first number sequence (handles: 1,200.50 or 1.200,50)
  const match = cleaned.match(/[\d.,]+/)
  if (!match) return null
  
  let numString = match[0]
  
  // Determine format based on comma/period positions
  const lastComma = numString.lastIndexOf(',')
  const lastPeriod = numString.lastIndexOf('.')
  
  if (lastComma > lastPeriod && lastComma === numString.length - 3) {
    // European format: 1.200,50 → 1200.50
    numString = numString.replace(/\./g, '').replace(',', '.')
  } else if (lastPeriod > lastComma && lastPeriod === numString.length - 3) {
    // US format: 1,200.50 → 1200.50
    numString = numString.replace(/,/g, '')
  } else if (lastComma === numString.length - 3 || lastPeriod === numString.length - 3) {
    // Could be decimal: 1200,50 or 1200.50
    numString = numString.replace(',', '.')
  } else {
    // Just thousands separator: 1,200 or 1.200 → 1200
    numString = numString.replace(/[,.]/g, '')
  }
  
  const result = parseFloat(numString)
  
  // Validate result
  if (isNaN(result) || result <= 0 || result > 999999999) {
    return null
  }
  
  return result
}

/**
 * Ensures URL is absolute
 */
function makeAbsoluteUrl(url: string | undefined, baseUrl: string): string | null {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
}

/**
 * Maps route language code to ISO locale for structured data
 */
const langToLocale: Record<string, string> = {
  en: 'en_US',
  bg: 'bg_BG',
  ru: 'ru_RU',
  gr: 'el_GR'
}

/**
 * Maps language to localized URL paths
 */
const slugPaths: Record<string, string> = {
  en: 'listings',
  bg: 'obiavi',
  ru: 'obyavleniya',
  gr: 'aggelies'
}

/**
 * Breadcrumb translations for all languages
 */
const breadcrumbTranslations = {
  en: { home: 'Home', listings: 'Listings' },
  bg: { home: 'Начало', listings: 'Обяви' },
  ru: { home: 'Главная', listings: 'Объявления' },
  gr: { home: 'Αρχική', listings: 'Αγγελίες' }
}

/**
 * Currency detection map
 */
const currencyMap: Record<string, string> = {
  '€': 'EUR',
  'EUR': 'EUR',
  'лв': 'BGN',
  'BGN': 'BGN',
  '$': 'USD',
  'USD': 'USD',
  '₽': 'RUB',
  'RUB': 'RUB'
}

export default function ListingStructuredData({ 
  project, 
  lang, 
  baseUrl 
}: ListingStructuredDataProps) {
  const t = breadcrumbTranslations[lang] || breadcrumbTranslations.en
  
  // Prepare images array with validation
  const images: string[] = []
  const coverUrl = makeAbsoluteUrl(project.cover_image_url, baseUrl)
  if (coverUrl) images.push(coverUrl)
  
  if (project.images && project.images.length > 0) {
    project.images.forEach(img => {
      const imgUrl = makeAbsoluteUrl(img.image_url, baseUrl)
      if (imgUrl && !images.includes(imgUrl)) {
        images.push(imgUrl)
      }
    })
  }
  
  // Build URL using listingHref helper (canonical /p/[slug] route)
  const urlPath = project.slug || String(project.id)
  const listingUrl = `${baseUrl}${listingHref(lang, urlPath)}`
  
  // Developer URL
  const developerUrl = project.developer
    ? `${baseUrl}/developers/${project.developer.slug || project.developer.id}`
    : null
  
  // Publisher name per language
  const publisherName = lang === 'bg' 
    ? 'Мистър Имот' 
    : lang === 'ru' 
      ? 'Мистер Имот' 
      : 'Mister Imot'
  
  // Extract numeric price if available
  const numericPrice = extractNumericPrice(project.price_label)
  
  // Detect currency from price_label
  let currency = 'EUR' // Default
  if (project.price_label) {
    for (const [symbol, code] of Object.entries(currencyMap)) {
      if (project.price_label.includes(symbol)) {
        currency = code
        break
      }
    }
  }
  
  // Enhanced description with verified developer info
  const baseDescription = project.description || project.title || ''
  // Localized verification message per language
  const verificationMessage = lang === 'bg'
    ? ' Публикуван директно от верифициран инвеститор в Мистър Имот. Без брокери или посредници.'
    : lang === 'ru'
      ? ' Опубликовано напрямую проверенным застройщиком в Мистер Имот. Без брокеров или посредников.'
      : lang === 'gr'
        ? ' Δημοσιεύτηκε απευθείας από επαληθευμένο επενδυτή στο Mister Imot. Χωρίς μεσίτες ή μεσάζοντες.'
        : ' Published directly by a verified developer on Mister Imot. No brokers or intermediaries.'
  const enhancedDescription = project.developer?.verification_status === 'verified'
    ? `${baseDescription}${verificationMessage}`
    : baseDescription
  
  // Format dates for schema (YYYY-MM-DD)
  const formatDate = (dateString: string | undefined): string | undefined => {
    if (!dateString) return undefined
    try {
      return dateString.split('T')[0]
    } catch {
      return undefined
    }
  }
  
  // Determine availability based on project status
  const getAvailability = (status?: string): string => {
    if (!status || status === 'active') {
      return 'https://schema.org/InStock'
    } else if (status === 'paused') {
      return 'https://schema.org/PreOrder'
    } else if (status === 'deleted') {
      return 'https://schema.org/OutOfStock'
    }
    return 'https://schema.org/InStock' // default
  }
  
  // RealEstateListing Schema - PRIMARY schema for real estate
  // DO NOT use Product schema for real estate - it causes Google to expect merchant fields
  const realEstateSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": listingUrl,
    "name": project.title || project.name || 'New Construction Project',
    "description": enhancedDescription,
    "url": listingUrl,
    "inLanguage": langToLocale[lang] || 'en_US',
    ...(images.length > 0 && { "image": images }),
    
    // Publisher = MrImot (the platform)
    "publisher": {
      "@type": "Organization",
      "@id": `${baseUrl}#organization`,
      "name": publisherName,
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": buildIkUrl("/Logo/mr-imot-logo-no-background.png", [
          { width: 600, height: 60, quality: 90, format: "webp", focus: "auto" },
        ])
      }
    },
    
    // Provider = Developer (source of the property)
    ...(project.developer && developerUrl && {
      "provider": {
        "@type": "Organization",
        "@id": developerUrl,
        "name": project.developer.company_name,
        "url": developerUrl,
        ...(project.developer.profile_image_url && {
          "logo": {
            "@type": "ImageObject",
            "url": project.developer.profile_image_url
          }
        })
      }
    }),
    
    // Dates
    ...(project.created_at && { "datePublished": formatDate(project.created_at) }),
    ...(project.updated_at && { "dateModified": formatDate(project.updated_at) }),
    
    "address": {
      "@type": "PostalAddress",
      "addressLocality": project.city || 'Bulgaria',
      "addressCountry": "BG",
      ...(project.formatted_address && { "streetAddress": project.formatted_address }),
      ...(project.neighborhood && { "addressRegion": project.neighborhood })
    },
    ...(project.latitude && project.longitude && {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": project.latitude,
        "longitude": project.longitude
      }
    }),
    // Price fields - only include if valid numeric price exists
    ...(numericPrice && {
      "offers": {
        "@type": "Offer",
        "price": numericPrice,
        "priceCurrency": currency,
        "availability": getAvailability(project.status),
        ...(project.price_label && { "description": project.price_label }),
        // Seller in offers, not in RealEstateListing root
        ...(project.developer && developerUrl && {
          "seller": {
            "@type": "Organization",
            "@id": developerUrl
          }
        })
      }
    })
  }
  
  // Organization Schema for Developer (always render if developer exists)
  const developerOrganizationSchema = project.developer && developerUrl ? {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": developerUrl,
    "name": project.developer.company_name,
    "url": developerUrl,
    ...(project.developer.profile_image_url && {
      "logo": {
        "@type": "ImageObject",
        "url": project.developer.profile_image_url
      }
    }),
    ...(project.developer.phone && { "telephone": project.developer.phone }),
    ...(project.developer.email && { "email": project.developer.email }),
    ...(project.developer.website && { 
      "sameAs": [project.developer.website] 
    }),
    "knowsAbout": [
      "New residential construction",
      "Real estate development",
      "Apartment buildings"
    ]
  } : null
  
  // LocalBusiness Schema for Developer (only if office_address exists)
  const developerLocalBusinessSchema = project.developer && developerUrl && project.developer.office_address ? {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${developerUrl}#business`,
    "name": project.developer.company_name,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": project.developer.office_address,
      "addressCountry": "BG"
    },
    ...(project.developer.office_latitude && project.developer.office_longitude && {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": project.developer.office_latitude,
        "longitude": project.developer.office_longitude
      }
    }),
    ...(project.developer.phone && { "telephone": project.developer.phone }),
    ...(project.developer.website && { "url": project.developer.website }),
    // Link to parent Organization
    "parentOrganization": {
      "@id": developerUrl
    }
  } : null
  
  // BreadcrumbList Schema
  // If project has city, link to city hub route
  const projectCity = project.city
  const cityKey = projectCity && ['Sofia', 'Plovdiv', 'Varna'].includes(projectCity) 
    ? getCityKeyFromCityType(projectCity as 'Sofia' | 'Plovdiv' | 'Varna')
    : null
  
  const listingsUrl = cityKey 
    ? `${baseUrl}${cityListingsHref(lang, cityKey)}`
    : (lang === 'en' ? `${baseUrl}/listings` : `${baseUrl}/${lang}/${slugPaths[lang]}`)
  
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
        "name": t.listings,
        "item": listingsUrl // Hub route if city exists
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": project.title || project.name || 'Project',
        "item": listingUrl
      }
    ]
  }
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(realEstateSchema) }}
      />
      {developerOrganizationSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(developerOrganizationSchema) }}
        />
      )}
      {developerLocalBusinessSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(developerLocalBusinessSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  )
}
