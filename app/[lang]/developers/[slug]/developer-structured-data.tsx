import { DeveloperProfile } from '@/lib/api'

interface DeveloperStructuredDataProps {
  developer: DeveloperProfile
  lang: 'en' | 'bg'
  baseUrl: string
}

export default function DeveloperStructuredData({ developer, lang, baseUrl }: DeveloperStructuredDataProps) {
  const isBg = lang === 'bg'
  const localizedPath = lang === 'bg' ? 'bg/stroiteli' : 'developers'
  const developerPath = developer.slug || developer.id
  
  // LocalBusiness Schema (only for verified developers)
  const localBusinessSchema = developer.is_verified ? {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": developer.company_name,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": developer.office_address,
      "addressCountry": "BG"
    },
    ...(developer.office_latitude && developer.office_longitude && {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": developer.office_latitude,
        "longitude": developer.office_longitude
      }
    }),
    ...(developer.phone && { "telephone": developer.phone }),
    ...(developer.website && { "url": developer.website }),
    ...(developer.profile_image_url && { "image": developer.profile_image_url })
  } : null
  
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
        "name": isBg ? "Строители" : "Developers",
        "item": isBg ? `${baseUrl}/bg/stroiteli` : `${baseUrl}/developers`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": developer.company_name,
        "item": `${baseUrl}/${localizedPath}/${developerPath}`
      }
    ]
  }
  
  return (
    <>
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

