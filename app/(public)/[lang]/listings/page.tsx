import "@/styles/mobile-optimizations.css"
import "@/styles/maps.css"
import { getDictionary } from "../dictionaries"
import { ListingsLayoutServer, CITY_BOUNDS, CityType, PropertyTypeFilter } from "./listings-layout-server"
import { ListingsClientWrapper } from "./listings-client-wrapper"
import { brandForLang, formatTitleWithBrand, getSiteUrl } from "@/lib/seo"
import type { Metadata } from 'next'
import WebPageSchema from '@/components/seo/webpage-schema'
import { buildIkUrl } from "@/lib/imagekit"
import { redirect } from "next/navigation"
import { listingsHref, cityListingsHref, asLocale } from "@/lib/routes"
import { PaginationNav } from "./pagination-nav"
import { getListingsMode } from "@/lib/listings-mode"
import { getCityKeyFromCityType, getCityTypeFromKey } from "@/lib/city-registry"

interface ListingsPageProps {
  params: Promise<{ lang: 'en' | 'bg' | 'ru' | 'gr' }>
  searchParams?: Promise<{ 
    city?: string
    city_key?: string
    type?: string
    page?: string
    ne_lat?: string
    sw_lat?: string
    ne_lng?: string
    sw_lng?: string
    zoom?: string
    search_by_map?: string
  }>
}

// Server-side initial data fetch
async function fetchInitialProperties(
  cityKey: string | undefined,  // city_key from URL (e.g., "sofia-bg")
  propertyType: PropertyTypeFilter,
  page: number,  // Page number (for both city mode and mapMode pagination)
  bounds: { sw_lat: number; sw_lng: number; ne_lat: number; ne_lng: number } | undefined,
  searchByMap: boolean | undefined,
  hasAllBounds: boolean
): Promise<{ 
  properties: any[]
  page?: number
  per_page?: number
  total?: number
  total_pages?: number
}> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const baseUrl = apiUrl.replace(/\/$/, '')
    
    const params = new URLSearchParams()
    
    // Mode detection using shared utility
    const searchParamsObj = new URLSearchParams()
    if (searchByMap) searchParamsObj.set('search_by_map', 'true')
    if (bounds) {
      searchParamsObj.set('sw_lat', String(bounds.sw_lat))
      searchParamsObj.set('sw_lng', String(bounds.sw_lng))
      searchParamsObj.set('ne_lat', String(bounds.ne_lat))
      searchParamsObj.set('ne_lng', String(bounds.ne_lng))
    }
    const { isMapMode } = getListingsMode(searchParamsObj)
    const isBoundsMode = isMapMode
    
    if (isBoundsMode) {
      // BOUNDS MODE: Use per_page + bounds + optional page (for mapMode pagination)
      if (bounds) {
        params.append('sw_lat', String(bounds.sw_lat))
        params.append('sw_lng', String(bounds.sw_lng))
        params.append('ne_lat', String(bounds.ne_lat))
        params.append('ne_lng', String(bounds.ne_lng))
      }
      params.append('per_page', '12') // MapMode pagination uses per_page=12 (same as city mode)
      if (page > 1) {
        params.append('page', String(page)) // Support pagination in mapMode
      }
    } else {
      // CITY MODE: Use city_key + page + per_page=12
      if (cityKey) {
        params.append('city_key', cityKey)
      }
      params.append('page', String(page))
      params.append('per_page', '12') // City mode uses per_page for pagination
      params.append('sort_by', 'created_at') // Stable sort
    }
    
    // Apply property type filter (both modes)
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
      return { properties: [] }
    }
    
    const data = await response.json()
    
    // SSR comment: pagination info
    // page: data.page || 1
    // per_page: data.per_page || 12
    // total: data.total || 0
    // total_pages: data.total_pages || 1
    
    // Transform to PropertyData format
    const properties = (data.projects || []).map((project: any) => ({
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
      features: project.amenities_list?.length > 0 ? project.amenities_list : ['Modern Design', 'Quality Construction'],
    }))
    
    // Return pagination info (both city mode and mapMode support pagination)
    const result = { 
      properties,
      page: data.page || 1,
      per_page: data.per_page || (isBoundsMode ? 12 : 12),
      total: data.total || 0,
      total_pages: data.total_pages || 1
    }
    
    
    return result
  } catch (error) {
    console.error('Error fetching initial properties:', error)
    return { properties: [] }
  }
}

export async function generateMetadata({ params, searchParams }: ListingsPageProps): Promise<Metadata> {
  const { lang } = await params
  const sp = await searchParams
  const city = sp?.city?.toString()  // May be city_key format (e.g., "sofia-bg")
  const cityKey = sp?.city_key?.toString()  // Preferred: city_key format
  const type = sp?.type?.toString()
  const page = sp?.page?.toString()
  const ne_lat = sp?.ne_lat?.toString()
  const sw_lat = sp?.sw_lat?.toString()
  const ne_lng = sp?.ne_lng?.toString()
  const sw_lng = sp?.sw_lng?.toString()
  const search_by_map = sp?.search_by_map?.toString()
  
  // Check if URL has bounds params (map-driven search) using shared utility
  const searchParamsObj = new URLSearchParams()
  if (sw_lat) searchParamsObj.set('sw_lat', sw_lat)
  if (sw_lng) searchParamsObj.set('sw_lng', sw_lng)
  if (ne_lat) searchParamsObj.set('ne_lat', ne_lat)
  if (ne_lng) searchParamsObj.set('ne_lng', ne_lng)
  if (search_by_map) searchParamsObj.set('search_by_map', search_by_map)
  const { hasAllBounds, isMapMode } = getListingsMode(searchParamsObj)
  const hasBoundsParams = isMapMode
  
  const baseUrl = getSiteUrl() // Hardcoded production domain for canonical URLs
  const socialImage = buildIkUrl("/Logo/mister-imot-waving-hi-with-bg.png", [
    { width: 1200, height: 630, quality: 85, format: "webp", focus: "auto" },
  ])
  
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
  
  // Base canonical URL
  const baseCanonical = isBg 
    ? `${baseUrl}/bg/obiavi`
    : isRu
      ? `${baseUrl}/ru/obyavleniya`
      : `${baseUrl}/listings`
  
  // Canonical rules (clarified):
  // - Hub base /obiavi/[cityKey]: index,follow, self-canonical (handled in hub route)
  // - Hub with ?page>1 or ?type=...: noindex,follow, canonical to hub base (handled in hub route)
  // - Query /obiavi?city=: noindex,follow, canonical to hub base
  // - Map mode (bounds): noindex,follow, canonical to base or hub
  
  let canonicalUrl = baseCanonical
  let shouldIndex = true
  
  if (hasBoundsParams) {
    // MapMode: noindex, canonical to base or hub
    shouldIndex = false
    if (cityKey || city) {
      const effectiveKey = cityKey || (city && ['Sofia', 'Plovdiv', 'Varna'].includes(city) ? getCityKeyFromCityType(city as 'Sofia' | 'Plovdiv' | 'Varna') : city)
      if (effectiveKey) {
        canonicalUrl = `${baseUrl}${cityListingsHref(lang, effectiveKey)}` // Hub base
      }
    }
  } else if (cityKey || city) {
    // Query param ?city= present
    const effectiveKey = cityKey || (city && ['Sofia', 'Plovdiv', 'Varna'].includes(city) ? getCityKeyFromCityType(city as 'Sofia' | 'Plovdiv' | 'Varna') : city)
    
    if (effectiveKey) {
      // Query ?city=: noindex, follow, canonical to hub base
      shouldIndex = false
      canonicalUrl = `${baseUrl}${cityListingsHref(lang, effectiveKey)}` // Hub base: /bg/obiavi/c/[cityKey] or /listings/c/[cityKey]
    }
  }
  
  const ogLocale = isBg ? 'bg_BG' : isRu ? 'ru_RU' : 'en_US'
  
  return {
    title,
    description,
    robots: {
      index: shouldIndex && !hasBoundsParams,
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
  const cityParam = resolvedSearchParams?.city  // May be city_key format (e.g., "sofia-bg") or old city name
  const cityKeyParam = resolvedSearchParams?.city_key  // Preferred format
  const typeParam = resolvedSearchParams?.type
  const pageParam = resolvedSearchParams?.page
  const ne_lat = resolvedSearchParams?.ne_lat
  const sw_lat = resolvedSearchParams?.sw_lat
  const ne_lng = resolvedSearchParams?.ne_lng
  const sw_lng = resolvedSearchParams?.sw_lng
  const searchByMap = resolvedSearchParams?.search_by_map === 'true'
  
  // Mode detection using shared utility
  // Convert searchParams object to URLSearchParams for utility
  const searchParamsObj = new URLSearchParams()
  if (cityParam) searchParamsObj.set('city', cityParam)
  if (cityKeyParam) searchParamsObj.set('city_key', cityKeyParam)
  if (sw_lat) searchParamsObj.set('sw_lat', sw_lat)
  if (sw_lng) searchParamsObj.set('sw_lng', sw_lng)
  if (ne_lat) searchParamsObj.set('ne_lat', ne_lat)
  if (ne_lng) searchParamsObj.set('ne_lng', ne_lng)
  if (searchByMap) searchParamsObj.set('search_by_map', 'true')
  
  const { isMapMode, hasAllBounds } = getListingsMode(searchParamsObj)
  const isBoundsMode = isMapMode
  
  // Parse bounds if all params exist
  const bounds = hasAllBounds ? {
    sw_lat: parseFloat(sw_lat!),
    sw_lng: parseFloat(sw_lng!),
    ne_lat: parseFloat(ne_lat!),
    ne_lng: parseFloat(ne_lng!),
  } : undefined
  
  // Extract city_key from URL (value comes from city= param)
  // cityParam may be "sofia-bg" (city_key format) or "Sofia" (old format)
  
  // Get city_key from URL (prefer city_key param, fallback to city param if it's city_key format)
  const effectiveCityKey = cityKeyParam || (cityParam && getCityTypeFromKey(cityParam) ? cityParam : undefined)
  
  // Map city_key to CityType for UI (fallback to Sofia if no city specified)
  const initialCity: CityType = 
    (effectiveCityKey && getCityTypeFromKey(effectiveCityKey)) ||
    (cityParam && ['Sofia', 'Plovdiv', 'Varna'].includes(cityParam) ? cityParam as CityType : 'Sofia')
  
  const initialType: PropertyTypeFilter = 
    typeParam && ['all', 'apartments', 'houses'].includes(typeParam)
      ? typeParam as PropertyTypeFilter
      : 'all'
  
  // Parse page number (default to 1)
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1
  const validPage = currentPage > 0 ? currentPage : 1
  
  // Fetch initial properties on server (cached for 60s)
  // Pass city_key directly from URL, not CityType
  const { properties: initialProperties, page, per_page, total, total_pages } = await fetchInitialProperties(
    effectiveCityKey,  // city_key from URL (e.g., "sofia-bg")
    initialType,
    validPage,  // Page number for city mode
    bounds,
    searchByMap,
    hasAllBounds
  )

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
  const socialImage = buildIkUrl("/Logo/mister-imot-waving-hi-with-bg.png", [
    { width: 1200, height: 630, quality: 85, format: "webp", focus: "auto" },
  ])


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
        {/* Server-rendered pagination - both city mode and mapMode support pagination */}
        {page && total_pages && total_pages > 1 && (
          <PaginationNav
            lang={lang}
            cityKey={effectiveCityKey}
            cityType={initialCity}
            propertyType={initialType}
            currentPage={page}
            totalPages={total_pages}
            isMapMode={isBoundsMode}
            bounds={bounds}
          />
        )}
      </ListingsLayoutServer>
    </>
  )
}