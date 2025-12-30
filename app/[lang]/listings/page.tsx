import "@/styles/mobile-optimizations.css"
import "@/styles/maps.css"
import { getDictionary } from "../dictionaries"
import { ListingsLayoutServer, CITY_BOUNDS, CityType, PropertyTypeFilter } from "./listings-layout-server"
import { ListingsClientWrapper } from "./listings-client-wrapper"
import { brandForLang, formatTitleWithBrand, getSiteUrl } from "@/lib/seo"
import type { Metadata } from 'next'
import WebPageSchema from '@/components/seo/webpage-schema'

interface ListingsPageProps {
  params: Promise<{ lang: 'en' | 'bg' | 'ru' | 'gr' }>
  searchParams?: Promise<{ city?: string; type?: string }>
}

// Server-side initial data fetch
async function fetchInitialProperties(city: CityType, propertyType: PropertyTypeFilter) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const baseUrl = apiUrl.replace(/\/$/, '')
    const bounds = CITY_BOUNDS[city]
    
    const params = new URLSearchParams({
      per_page: '50',
      sw_lat: String(bounds.sw_lat),
      sw_lng: String(bounds.sw_lng),
      ne_lat: String(bounds.ne_lat),
      ne_lng: String(bounds.ne_lng),
    })
    
    if (propertyType === 'apartments') {
      params.append('project_type', 'apartment_building')
    } else if (propertyType === 'houses') {
      params.append('project_type', 'house_complex')
    }
    
    const response = await fetch(`${baseUrl}/api/v1/projects/?${params.toString()}`, {
      next: { revalidate: 60 }, // Cache for 60 seconds
      headers: { 'Content-Type': 'application/json' },
    })
    
    if (!response.ok) {
      console.error(`Failed to fetch initial properties: ${response.status}`)
      return []
    }
    
    const data = await response.json()
    
    // Transform to PropertyData format
    return (data.projects || []).map((project: any) => ({
      id: String(project.id),
      slug: project.slug || String(project.id),
      title: project.title || project.name || 'Project',
      priceRange: project.price_label || 'Price on request',
      shortPrice: project.price_label || 'Request price',
      location: project.neighborhood ? `${project.neighborhood}, ${project.city}` : project.city,
      image: project.cover_image_url || '/placeholder.svg',
      images: Array.isArray(project.images)
        ? project.images.map((img: any) => img?.urls?.card || img?.image_url).filter(Boolean)
        : [],
      description: project.description || '',
      lat: typeof project.latitude === 'number' ? project.latitude : 42.6977,
      lng: typeof project.longitude === 'number' ? project.longitude : 23.3219,
      type: project.project_type === 'apartment_building' ? 'Apartment Complex' : 'Residential Houses',
      status: 'Under Construction',
      developer: project.developer?.company_name || 'Unknown Developer',
      completionDate: project.expected_completion_date
        ? new Date(project.expected_completion_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
        : 'TBD',
      rating: 4.5 + Math.random() * 0.4,
      reviews: Math.floor(Math.random() * 30) + 5,
      features: project.amenities_list?.length > 0 ? project.amenities_list : ['Modern Design', 'Quality Construction'],
    }))
  } catch (error) {
    console.error('Error fetching initial properties:', error)
    return []
  }
}

export async function generateMetadata({ params }: ListingsPageProps): Promise<Metadata> {
  const { lang } = await params
  const baseUrl = getSiteUrl() // Hardcoded production domain for canonical URLs
  const socialImage = 'https://ik.imagekit.io/ts59gf2ul/Logo/mister-imot-waving-hi-with-bg.png?tr=w-1200,h-630,cm-pad_resize,bg-FFFFFF,fo-auto,q-85,f-auto&v=20241205'
  
  const isBg = lang === 'bg'
  const isRu = lang === 'ru'
  const brand = brandForLang(lang)
  
  const rawTitle = isBg
    ? `Обяви за Ново Строителство – ${brand} | Без Брокери, Без Комисиони`
    : isRu
      ? `Объявления новостроек – ${brand} | Без брокеров, 0% комиссии`
      : `New Construction Listings – ${brand} | No Brokers, 0% Commission`
  const title = formatTitleWithBrand(rawTitle, lang)
  
  const description = isBg
    ? `Открийте най-добрите обяви за ново строителство в България. Директна връзка със строители, без посредници. Апартаменти и къщи в София, Пловдив, Варна и други градове.`
    : isRu
      ? `Откройте лучшие объявления новостроек в Болгарии. Общайтесь напрямую с застройщиками, без посредников. Квартиры и дома в Софии, Пловдиве, Варне и других городах.`
      : `Discover the best new construction listings in Bulgaria. Connect directly with developers, no middlemen. Apartments and houses in Sofia, Plovdiv, Varna, and other cities.`
  
  // Use pretty URL for Bulgarian and Russian, canonical for English
  const canonicalUrl = isBg 
    ? `${baseUrl}/bg/obiavi`
    : isRu
      ? `${baseUrl}/ru/obyavleniya`
      : `${baseUrl}/listings`
  
  const ogLocale = isBg ? 'bg_BG' : isRu ? 'ru_RU' : 'en_US'
  
  return {
    title,
    description,
    robots: {
      index: true, // Explicitly allow indexing of listings page
      follow: true,
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}/listings`,
        bg: `${baseUrl}/bg/obiavi`,
        ru: `${baseUrl}/ru/obyavleniya`,
        el: `${baseUrl}/gr/aggelies`,
        'x-default': `${baseUrl}/listings`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: brand,
      locale: ogLocale,
      alternateLocale: ['en_US', 'bg_BG', 'ru_RU', 'el_GR'],
      type: 'website',
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: title,
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

export default async function ListingsPage({ params, searchParams }: ListingsPageProps) {
  const { lang } = await params
  const resolvedSearchParams = await searchParams
  const dict = await getDictionary(lang)
  
  // Extract initial filter values from URL
  const cityParam = resolvedSearchParams?.city
  const typeParam = resolvedSearchParams?.type
  
  const initialCity: CityType = 
    cityParam && ['Sofia', 'Plovdiv', 'Varna'].includes(cityParam) 
      ? cityParam as CityType 
      : 'Sofia'
  
  const initialType: PropertyTypeFilter = 
    typeParam && ['all', 'apartments', 'houses'].includes(typeParam)
      ? typeParam as PropertyTypeFilter
      : 'all'
  
  // Fetch initial properties on server (cached for 60s)
  const initialProperties = await fetchInitialProperties(initialCity, initialType)

  const baseUrl = getSiteUrl() // Hardcoded production domain for canonical URLs
  const isBg = lang === 'bg'
  const isRu = lang === 'ru'
  const canonicalUrl = isBg 
    ? `${baseUrl}/bg/obiavi`
    : isRu
      ? `${baseUrl}/ru/obyavleniya`
      : `${baseUrl}/listings`
  const brand = brandForLang(lang)
  const rawTitle = isBg
    ? `Обяви за Ново Строителство – ${brand} | Без Брокери, Без Комисиони`
    : isRu
      ? `Объявления новостроек – ${brand} | Без брокеров, 0% комиссии`
      : `New Construction Listings – ${brand} | No Brokers, 0% Commission`
  const title = formatTitleWithBrand(rawTitle, lang)
  const description = isBg
    ? `Открийте най-добрите обяви за ново строителство в България. Директна връзка със строители, без посредници. Апартаменти и къщи в София, Пловдив, Варна и други градове.`
    : isRu
      ? `Откройте лучшие объявления новостроек в Болгарии. Общайтесь напрямую с застройщиками, без посредников. Квартиры и дома в Софии, Пловдиве, Варне и других городах.`
      : `Discover the best new construction listings in Bulgaria. Connect directly with developers, no middlemen. Apartments and houses in Sofia, Plovdiv, Varna, and other cities.`
  const socialImage = 'https://ik.imagekit.io/ts59gf2ul/Logo/mister-imot-waving-hi-with-bg.png?tr=w-1200,h-630,cm-pad_resize,bg-FFFFFF,fo-auto,q-85,f-auto&v=20241205'

  return (
    <>
      <WebPageSchema
        name={title}
        description={description}
        url={canonicalUrl}
        lang={lang}
        baseUrl={baseUrl}
        primaryImageOfPage={socialImage}
      />
      <ListingsLayoutServer dict={dict} lang={lang}>
        <ListingsClientWrapper
          dict={dict}
          lang={lang}
          initialCity={initialCity}
          initialType={initialType}
          initialProperties={initialProperties}
        />
      </ListingsLayoutServer>
    </>
  )
}