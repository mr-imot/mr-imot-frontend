import { notFound } from "next/navigation"
import type { Metadata } from 'next'
import ListingPageContent from '../../[id]/listing-page-content'
import NotFoundPage from '../../[id]/not-found-page'
import { Project, PausedProject, DeletedProject } from '@/lib/api'
import { brandForLang, formatTitleWithBrand, getSiteUrl } from '@/lib/seo'
import { ModalClientWrapper } from '../../@modal/(.)[id]/modal-client-wrapper'
import { buildIkUrl } from '@/lib/imagekit'
import { asLocale, listingHref, type SupportedLocale } from '@/lib/routes'
import { getCityInfo, getCityTypeFromKey } from '@/lib/city-registry'

interface PageProps {
  params: Promise<{
    lang: 'en' | 'bg' | 'ru' | 'gr'
    slug: string
  }>
}

// Server-side function to fetch project data
export async function getProjectData(identifier: string): Promise<Project | PausedProject | DeletedProject | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const baseUrl = apiUrl.replace(/\/$/, '')
    const encodedIdentifier = encodeURIComponent(identifier)
    const response = await fetch(`${baseUrl}/api/v1/projects/${encodedIdentifier}`, {
      next: { revalidate: 300 }, // ISR - regenerate every 5 minutes
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      console.error(`Failed to fetch project ${identifier}: ${response.status} ${response.statusText}`)
      return null
    }

    const data = await response.json()
    
    if (data.status === 'paused' || data.status === 'deleted') {
      return data as PausedProject | DeletedProject
    }
    
    return data as Project
  } catch (error) {
    console.error(`Error fetching project ${identifier}:`, error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params
  const locale = asLocale(lang)
  const baseUrl = getSiteUrl()
  const socialFallback = buildIkUrl("/Logo/mister-imot-waving-hi-with-bg.png", [
    { width: 1200, height: 630, quality: 85, format: "webp", focus: "auto" },
  ])
  
  const project = await getProjectData(slug)
  
  // Project never existed - return 404 metadata
  if (!project) {
    return {
      title: formatTitleWithBrand('Project Not Found', lang),
      robots: {
        index: false,
        follow: false,
      },
    }
  }
  
  // Get project ID for canonical URLs
  const projectId = 'id' in project ? project.id : null
  
  // Paused project - return generic metadata with noindex
  if ('status' in project && project.status === 'paused') {
    const isBg = lang === 'bg'
    const title = formatTitleWithBrand(
      isBg ? 'Обявата е временно недостъпна' : 'Listing Temporarily Unavailable',
      lang
    )
    const urlPath = projectId || slug
    const canonicalPath = listingHref(locale, urlPath)
    return {
      title,
      description: isBg 
        ? 'Тази обява е временно поставена на пауза.'
        : 'This listing is currently unavailable.',
      robots: {
        index: false,
        follow: true,
      },
      alternates: {
        canonical: `${baseUrl}${canonicalPath}`,
      },
    }
  }
  
  // Deleted project - return generic metadata with noindex
  if ('status' in project && project.status === 'deleted') {
    const isBg = lang === 'bg'
    const title = formatTitleWithBrand(
      isBg ? 'Обявата е премахната' : 'Listing Removed',
      lang
    )
    const urlPath = projectId || slug
    const canonicalPath = listingHref(locale, urlPath)
    return {
      title,
      description: isBg 
        ? 'Тази обява вече не е налична.'
        : 'This listing is no longer available.',
      robots: {
        index: false,
        follow: true,
      },
      alternates: {
        canonical: `${baseUrl}${canonicalPath}`,
      },
    }
  }
  
  // Active project - return full SEO metadata
  const fullProject = project as Project
  const isBg = lang === 'bg'
  const isRu = lang === 'ru'
  const isGr = lang === 'gr'
  const brand = brandForLang(lang)
  const projectTitle = fullProject.title || fullProject.name || 'New Construction Project'
  
  // Get translated city name
  // Try to get city_key from project (if available) and use city-registry
  // Otherwise, parse and translate the city field
  let translatedCityName: string = 'Bulgaria'
  let cityNameForTitle: string = 'Bulgaria'
  
  // Check if project has city_key (from API response)
  const projectCityKey = fullProject.city_key
  if (projectCityKey) {
    const cityInfo = await getCityInfo(projectCityKey)
    if (cityInfo) {
      translatedCityName = cityInfo.displayNames[lang] || cityInfo.displayNames.en
      cityNameForTitle = translatedCityName
    }
  } else if (fullProject.city) {
    // Fallback: parse city field and translate common cities
    // Remove "Област" prefix if present
    let cityName = fullProject.city.replace(/^Област\s+/i, '').trim()
    
    // Translate common city names
    const cityTranslations: Record<string, Record<'bg' | 'en' | 'ru' | 'gr', string>> = {
      'София': { bg: 'София', en: 'Sofia', ru: 'София', gr: 'Σόφια' },
      'Sofia': { bg: 'София', en: 'Sofia', ru: 'София', gr: 'Σόφια' },
      'Пловдив': { bg: 'Пловдив', en: 'Plovdiv', ru: 'Пловдив', gr: 'Πλόβντιβ' },
      'Plovdiv': { bg: 'Пловдив', en: 'Plovdiv', ru: 'Пловдив', gr: 'Πλόβντιβ' },
      'Варна': { bg: 'Варна', en: 'Varna', ru: 'Варна', gr: 'Βάρνα' },
      'Varna': { bg: 'Варна', en: 'Varna', ru: 'Варна', gr: 'Βάρνα' },
    }
    
    if (cityTranslations[cityName]) {
      translatedCityName = cityTranslations[cityName][lang] || cityTranslations[cityName].en
      cityNameForTitle = translatedCityName
    } else {
      // If no translation found, use as-is for BG, fallback to city name for others
      translatedCityName = isBg ? cityName : cityName
      cityNameForTitle = translatedCityName
    }
  }
  
  // Always use language-specific description for metadata (not raw project.description which may be in wrong language)
  // For now, we'll use a language-specific fallback description
  // TODO: If project.description has a language field in the future, we can use it conditionally
  const projectDescription = isBg
    ? `Открийте ${projectTitle} в ${translatedCityName}. Директна връзка със строителя, без посредници.`
    : isRu
      ? `Откройте ${projectTitle} в ${translatedCityName}. Прямая связь со строителем, без посредников.`
      : isGr
        ? `Ανακαλύψτε ${projectTitle} στην ${translatedCityName}. Άμεση σύνδεση με τον κατασκευαστή, χωρίς μεσάζοντες.`
        : `Discover ${projectTitle} in ${translatedCityName}. Connect directly with the developer, no middlemen.`
  
  const rawTitle = isBg
    ? `${projectTitle} – ${brand} | Ново Строителство в ${cityNameForTitle}`
    : isRu
      ? `${projectTitle} – ${brand} | Новостройка в ${cityNameForTitle}`
      : isGr
        ? `${projectTitle} – ${brand} | Νέα Κατασκευή στη ${cityNameForTitle}`
        : `${projectTitle} – ${brand} | New Construction in ${cityNameForTitle}`
  const title = formatTitleWithBrand(rawTitle, lang)
  
  // Use slug for canonical URL (this is the canonical route)
  const canonicalIdentifier = fullProject.slug || fullProject.id || slug
  const canonicalPath = listingHref(locale, canonicalIdentifier)
  const canonicalUrl = `${baseUrl}${canonicalPath}`
  
  const ogLocale = isBg ? 'bg_BG' : isRu ? 'ru_RU' : 'en_US'
  const rawImage =
    fullProject.cover_image_url ||
    fullProject.images?.[0]?.image_url

  const ogImage = rawImage
    ? rawImage.startsWith('http')
      ? rawImage
      : `${baseUrl}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`
    : socialFallback
  
  return {
    title,
    description: projectDescription,
    metadataBase: new URL(baseUrl),
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}${listingHref('en', canonicalIdentifier)}`,
        bg: `${baseUrl}${listingHref('bg', canonicalIdentifier)}`,
        ru: `${baseUrl}${listingHref('ru', canonicalIdentifier)}`,
        el: `${baseUrl}${listingHref('gr', canonicalIdentifier)}`,
        'x-default': `${baseUrl}${listingHref('en', canonicalIdentifier)}`,
      },
    },
    openGraph: {
      title,
      description: projectDescription,
      url: canonicalUrl,
      siteName: brand,
      locale: ogLocale,
      alternateLocale: ['en_US', 'bg_BG', 'ru_RU', 'el_GR'],
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: projectTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: projectDescription,
      images: [ogImage],
    },
  }
}

/**
 * Canonical listing detail route: /{lang}/{listingsBase}/p/[slug]
 * 
 * This is the ONLY route that renders listing detail pages.
 * All other routes ([/...slug], [id]) redirect here.
 */
export default async function ListingPage({ params }: PageProps) {
  const { lang, slug } = await params
  const locale = asLocale(lang)
  
  // Handle empty slug
  if (!slug || slug.trim() === '') {
    notFound()
  }
  
  // Fetch project
  let project: Project | PausedProject | DeletedProject | null = null
  try {
    project = await getProjectData(slug)
  } catch (error) {
    console.error(`Error fetching project with slug "${slug}":`, error)
    return <NotFoundPage lang={locale === 'bg' ? 'bg' : 'en'} />
  }
  
  if (!project) {
    return <NotFoundPage lang={locale === 'bg' ? 'bg' : 'en'} />
  }
  
  // If project has a slug and it doesn't match the URL, redirect to canonical slug
  // This handles UUIDs or wrong slugs being accessed via /p/ route
  if ('slug' in project && project.slug && slug !== project.slug) {
    // Redirect to canonical slug URL (this route with correct slug)
    const { permanentRedirect } = await import('next/navigation')
    permanentRedirect(listingHref(locale, project.slug))
  }
  
  // Extract project ID for component
  const projectId = 'id' in project 
    ? String(project.id) 
    : (() => {
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            `[ListingPage] Project missing id field, using slug as fallback: ${slug}`
          )
        }
        return slug
      })()
  
  // Render listing page
  return (
    <ModalClientWrapper>
      <ListingPageContent lang={locale} id={projectId} initialProject={project} />
    </ModalClientWrapper>
  )
}
