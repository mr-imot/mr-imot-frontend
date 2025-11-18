import { Project } from '@/lib/api'

interface ListingStructuredDataProps {
  project: Project
  lang: 'en' | 'bg'
  baseUrl: string
}

export default function ListingStructuredData({ project, lang, baseUrl }: ListingStructuredDataProps) {
  const isBg = lang === 'bg'
  const brand = isBg ? 'Мистър Имот' : 'Mister Imot'
  
  // Prepare images array
  const images: string[] = []
  if (project.cover_image_url) {
    images.push(project.cover_image_url)
  }
  if (project.images && project.images.length > 0) {
    project.images.forEach(img => {
      if (img.image_url && !images.includes(img.image_url)) {
        images.push(img.image_url)
      }
    })
  }
  
  // Product/RealEstateListing Schema
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": project.title || project.name || 'New Construction Project',
    "description": project.description || '',
    ...(images.length > 0 && { "image": images }),
    "brand": {
      "@type": "Brand",
      "name": brand
    },
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock",
      "priceCurrency": "EUR",
      ...(project.price_label && { "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": project.price_label
      }})
    },
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
        "name": isBg ? "Начало" : "Home",
        "item": `${baseUrl}/${lang}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": isBg ? "Обяви" : "Listings",
        "item": isBg ? `${baseUrl}/bg/obiavi` : `${baseUrl}/en/listings`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": project.title || project.name || 'Project',
        "item": `${baseUrl}/${lang === 'bg' ? 'bg/obiavi' : 'en/listings'}/${project.id}`
      }
    ]
  }
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  )
}

