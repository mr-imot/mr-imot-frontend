import "@/styles/mobile-optimizations.css"
import "@/styles/maps.css"
import { getDictionary } from "../../../dictionaries"
import { ListingsLayoutServer, CityType, PropertyTypeFilter } from "../../listings-layout-server"
import { ListingsClientWrapper } from "../../listings-client-wrapper"
import { brandForLang, formatTitleWithBrand, getSiteUrl } from "@/lib/seo"
import type { Metadata } from 'next'
import WebPageSchema from '@/components/seo/webpage-schema'
import { buildIkUrl } from "@/lib/imagekit"
import { listingsHref, cityListingsHref, asLocale } from "@/lib/routes"
import { PaginationNav } from "../../pagination-nav"
import { getCityInfo, getCityTypeFromKey } from "@/lib/city-registry"
import { EmptyStateServer } from "../../listings-layout-server"
import { ListingsSSRGrid } from "../../listings-ssr-grid"

interface CityListingsPageProps {
  params: Promise<{ lang: 'en' | 'bg' | 'ru' | 'gr', cityKey: string }>
  searchParams?: Promise<{ 
    type?: string
    page?: string
  }>
}

// Server-side initial data fetch (same as main listings page)
async function fetchInitialProperties(
  cityKey: string,
  propertyType: PropertyTypeFilter,
  page: number
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
    params.append('city_key', cityKey)
    params.append('page', String(page))
    params.append('per_page', '12')
    params.append('sort_by', 'created_at')
    
    // Apply property type filter
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
      return { properties: [], total: 0 }
    }
    
    const data = await response.json()
    
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
    
    return { 
      properties,
      page: data.page || 1,
      per_page: data.per_page || 12,
      total: data.total || 0,
      total_pages: data.total_pages || 1
    }
  } catch (error) {
    console.error('Error fetching initial properties:', error)
    return { properties: [], total: 0 }
  }
}

export async function generateMetadata({ params, searchParams }: CityListingsPageProps): Promise<Metadata> {
  const { lang, cityKey } = await params
  const sp = await searchParams
  const type = sp?.type?.toString()
  const page = sp?.page?.toString()
  
  const cityInfo = await getCityInfo(cityKey)
  const baseUrl = getSiteUrl()
  const socialImage = buildIkUrl("/Logo/mister-imot-waving-hi-with-bg.png", [
    { width: 1200, height: 630, quality: 85, format: "webp", focus: "auto" },
  ])
  
  const isBg = lang === 'bg'
  const isRu = lang === 'ru'
  const brand = brandForLang(lang)
  
  // Hub route canonical rules
  const hasParams = !!(type && type !== 'all') || !!(page && parseInt(page, 10) > 1)
  const hubBase = cityListingsHref(lang, cityKey)
  const hubBaseUrl = `${baseUrl}${hubBase}`
  
  // If city not found or no projects, use generic metadata
  if (!cityInfo) {
    return {
      title: formatTitleWithBrand(
        isBg 
          ? `Обяви за Ново Строителство – ${brand} | Без Брокери, Без Комисиони`
          : `New Construction Listings – ${brand} | No Brokers, 0% Commission`,
        lang
      ),
      description: isBg
        ? `Открийте най-добрите обяви за ново строителство в България.`
        : `Discover the best new construction listings in Bulgaria.`,
      robots: {
        index: false,
        follow: true,
      },
      alternates: {
        canonical: hubBaseUrl,
      },
    }
  }
  
  const cityName = cityInfo.displayNames[lang] || cityInfo.displayNames.en
  
  const rawTitle = isBg
    ? `Обяви за Ново Строителство в ${cityName} – ${brand} | Без Брокери, Без Комисиони`
    : isRu
      ? `Объявления новостроек в ${cityName} – ${brand} | Без брокеров, 0% комиссии`
      : `New Construction Listings in ${cityName} – ${brand} | No Brokers, 0% Commission`
  const title = formatTitleWithBrand(rawTitle, lang)
  
  const description = isBg
    ? `Открийте най-добрите обяви за ново строителство в ${cityName}. Директна връзка със строители, без посредници. Апартаменти и къщи в ${cityName}.`
    : isRu
      ? `Откройте лучшие объявления новостроек в ${cityName}. Общайтесь напрямую с застройщиками, без посредников. Квартиры и дома в ${cityName}.`
      : `Discover the best new construction listings in ${cityName}. Connect directly with developers, no middlemen. Apartments and houses in ${cityName}.`
  
  const ogLocale = isBg ? 'bg_BG' : isRu ? 'ru_RU' : 'en_US'
  
  // Hub with params: noindex, follow, canonical to hub base
  // Hub base: index, follow, self-canonical
  if (hasParams) {
    return {
      title,
      description,
      robots: {
        index: false,
        follow: true,
      },
      alternates: {
        canonical: hubBaseUrl, // Canonical to hub base (no params)
        languages: {
          en: `${baseUrl}${cityListingsHref('en', cityKey)}`,
          bg: `${baseUrl}${cityListingsHref('bg', cityKey)}`,
          ru: `${baseUrl}${cityListingsHref('ru', cityKey)}`,
          el: `${baseUrl}${cityListingsHref('gr', cityKey)}`,
          'x-default': `${baseUrl}${cityListingsHref('en', cityKey)}`,
        },
      },
      openGraph: {
        title,
        description,
        url: hubBaseUrl,
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
  
  // Hub base: index, follow, self-canonical
  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: hubBaseUrl,
      languages: {
        en: `${baseUrl}${cityListingsHref('en', cityKey)}`,
        bg: `${baseUrl}${cityListingsHref('bg', cityKey)}`,
        ru: `${baseUrl}${cityListingsHref('ru', cityKey)}`,
        el: `${baseUrl}${cityListingsHref('gr', cityKey)}`,
        'x-default': `${baseUrl}${cityListingsHref('en', cityKey)}`,
      },
    },
    openGraph: {
      title,
      description,
      url: hubBaseUrl,
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

export default async function CityListingsPage({ params, searchParams }: CityListingsPageProps) {
  const { lang, cityKey } = await params
  const resolvedSearchParams = await searchParams
  const dict = await getDictionary(lang)
  
  const cityInfo = await getCityInfo(cityKey)
  
  // Unknown cityKey: Don't redirect - render "no listings yet" page
  if (!cityInfo) {
    const baseUrl = getSiteUrl()
    const hubBase = cityListingsHref(lang, cityKey)
    const hubBaseUrl = `${baseUrl}${hubBase}`
    const isBg = lang === 'bg'
    const brand = brandForLang(lang)
    
    return (
      <>
        <WebPageSchema
          name={formatTitleWithBrand(
            isBg 
              ? `Обяви за Ново Строителство – ${brand} | Без Брокери, Без Комисиони`
              : `New Construction Listings – ${brand} | No Brokers, 0% Commission`,
            lang
          )}
          description={isBg
            ? `Открийте най-добрите обяви за ново строителство в България.`
            : `Discover the best new construction listings in Bulgaria.`}
          url={hubBaseUrl}
          lang={lang}
          baseUrl={baseUrl}
          primaryImageOfPage={buildIkUrl("/Logo/mister-imot-waving-hi-with-bg.png", [
            { width: 1200, height: 630, quality: 85, format: "webp", focus: "auto" },
          ])}
        />
        <ListingsLayoutServer dict={dict} lang={lang}>
          <EmptyStateServer 
            title={isBg ? "Градът не е намерен" : "City Not Found"}
            description={isBg 
              ? "Няма налични обяви за този град все още."
              : "No listings available for this city yet."}
          />
        </ListingsLayoutServer>
      </>
    )
  }
  
  const typeParam = resolvedSearchParams?.type
  const pageParam = resolvedSearchParams?.page
  
  const initialType: PropertyTypeFilter = 
    typeParam && ['all', 'apartments', 'houses'].includes(typeParam)
      ? typeParam as PropertyTypeFilter
      : 'all'
  
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1
  const validPage = currentPage > 0 ? currentPage : 1
  
  // Fetch initial properties on server
  const { properties: initialProperties, page, per_page, total, total_pages } = await fetchInitialProperties(
    cityKey,
    initialType,
    validPage
  )
  
  // 0 projects: Render "no listings yet" with noindex
  if (total === 0) {
    const baseUrl = getSiteUrl()
    const hubBase = cityListingsHref(lang, cityKey)
    const hubBaseUrl = `${baseUrl}${hubBase}`
    const isBg = lang === 'bg'
    const cityName = cityInfo.displayNames[lang] || cityInfo.displayNames.en
    const brand = brandForLang(lang)
    
    return (
      <>
        <WebPageSchema
          name={formatTitleWithBrand(
            isBg
              ? `Обяви за Ново Строителство в ${cityName} – ${brand} | Без Брокери, Без Комисиони`
              : `New Construction Listings in ${cityName} – ${brand} | No Brokers, 0% Commission`,
            lang
          )}
          description={isBg
            ? `Открийте най-добрите обяви за ново строителство в ${cityName}.`
            : `Discover the best new construction listings in ${cityName}.`}
          url={hubBaseUrl}
          lang={lang}
          baseUrl={baseUrl}
          primaryImageOfPage={buildIkUrl("/Logo/mister-imot-waving-hi-with-bg.png", [
            { width: 1200, height: 630, quality: 85, format: "webp", focus: "auto" },
          ])}
        />
        <ListingsLayoutServer dict={dict} lang={lang}>
          <EmptyStateServer 
            title={isBg 
              ? `Няма обяви в ${cityName} все още`
              : `No listings in ${cityName} yet`}
            description={isBg
              ? "Проверете отново скоро за нови проекти за ново строителство."
              : "Check back soon for new construction projects."}
          />
        </ListingsLayoutServer>
      </>
    )
  }
  
  // Map city_key to CityType for UI
  const cityType = getCityTypeFromKey(cityKey) || 'Sofia'
  
  const baseUrl = getSiteUrl()
  const isBg = lang === 'bg'
  const cityName = cityInfo.displayNames[lang] || cityInfo.displayNames.en
  const brand = brandForLang(lang)
  const rawTitle = isBg
    ? `Обяви за Ново Строителство в ${cityName} – ${brand} | Без Брокери, Без Комисиони`
    : `New Construction Listings in ${cityName} – ${brand} | No Brokers, 0% Commission`
  const title = formatTitleWithBrand(rawTitle, lang)
  const description = isBg
    ? `Открийте най-добрите обяви за ново строителство в ${cityName}. Директна връзка със строители, без посредници.`
    : `Discover the best new construction listings in ${cityName}. Connect directly with developers, no middlemen.`
  
  const hubBase = cityListingsHref(lang, cityKey)
  const hubBaseUrl = `${baseUrl}${hubBase}`
  
  return (
    <>
      <WebPageSchema
        name={title}
        description={description}
        url={hubBaseUrl}
        lang={lang}
        baseUrl={baseUrl}
        primaryImageOfPage={buildIkUrl("/Logo/mister-imot-waving-hi-with-bg.png", [
          { width: 1200, height: 630, quality: 85, format: "webp", focus: "auto" },
        ])}
      />
      <ListingsLayoutServer dict={dict} lang={lang}>
        {/* SSR listing links for SEO crawlability - visible in View Page Source */}
        <ListingsSSRGrid properties={initialProperties} lang={lang} />
        
        {/* Client-side interactive wrapper - replaces SSR grid after hydration */}
        <ListingsClientWrapper
          dict={dict}
          lang={lang}
          initialCity={cityType}
          initialType={initialType}
          initialProperties={initialProperties}
        />
        {page && total_pages && total_pages > 1 && (
          <PaginationNav
            lang={lang}
            cityKey={cityKey}
            cityType={cityType}
            propertyType={initialType}
            currentPage={page}
            totalPages={total_pages}
            isMapMode={false}
            bounds={undefined}
          />
        )}
      </ListingsLayoutServer>
    </>
  )
}
