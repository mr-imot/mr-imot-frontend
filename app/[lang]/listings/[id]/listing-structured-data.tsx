import { Project } from '@/lib/api'

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
  
  // Build URL paths based on language
  const urlPath = project.slug || String(project.id)
  const listingUrl = lang === 'en'
    ? `${baseUrl}/listings/${urlPath}`
    : `${baseUrl}/${lang}/${slugPaths[lang]}/${urlPath}`
  
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
  
  // RealEstateListing Schema - PRIMARY schema for real estate
  // DO NOT use Product schema for real estate - it causes Google to expect merchant fields
  const realEstateSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": project.title || project.name || 'New Construction Project',
    "description": project.description || project.title || '',
    "url": listingUrl,
    "inLanguage": langToLocale[lang] || 'en_US',
    ...(images.length > 0 && { "image": images }),
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
        ...(project.price_label && { "description": project.price_label })
      }
    })
  }
  
  // BreadcrumbList Schema
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
        "item": lang === 'en' ? `${baseUrl}/listings` : `${baseUrl}/${lang}/${slugPaths[lang]}`
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  )
}
