import { permanentRedirect } from "next/navigation"
import type { Metadata } from 'next'
import ListingPageContent from '../[id]/listing-page-content'
import NotFoundPage from '../[id]/not-found-page'
import { Project, PausedProject, DeletedProject } from '@/lib/api'
import { brandForLang, formatTitleWithBrand, getSiteUrl } from '@/lib/seo'
import { ModalClientWrapper } from '../@modal/(.)[id]/modal-client-wrapper'
import { buildIkUrl } from '@/lib/imagekit'
import { asLocale, listingHref, listingsHref, type SupportedLocale } from '@/lib/routes'

interface PageProps {
  params: Promise<{
    lang: 'en' | 'bg' | 'ru' | 'gr'
    slug: string[]
  }>
}

// Server-side function to fetch project data for metadata
export async function getProjectData(identifier: string): Promise<Project | PausedProject | DeletedProject | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const baseUrl = apiUrl.replace(/\/$/, '')
    // URL encode the identifier to handle special characters in slugs
    const encodedIdentifier = encodeURIComponent(identifier)
    // Use ISR for better performance - language variants are cached separately by URL
    const response = await fetch(`${baseUrl}/api/v1/projects/${encodedIdentifier}`, {
      next: { revalidate: 300 }, // ISR - regenerate every 5 minutes
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null // Project never existed
      }
      // Log error details for debugging
      console.error(`Failed to fetch project ${identifier}: ${response.status} ${response.statusText}`)
      return null
    }

    const data = await response.json()
    
    // Check if this is a status-only response (paused/deleted)
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
  const baseUrl = getSiteUrl() // Hardcoded production domain for canonical URLs
  const socialFallback = buildIkUrl("/Logo/mister-imot-waving-hi-with-bg.png", [
    { width: 1200, height: 630, quality: 85, format: "webp", focus: "auto" },
  ])
  
  // Use last slug segment as identifier (robust against extra segments)
  const identifier = slug.at(-1) ?? ''
  const project = await getProjectData(identifier)
  
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
  
  // Paused project - return generic metadata with noindex (NO project-specific data)
  if ('status' in project && project.status === 'paused') {
    const isBg = lang === 'bg'
    const title = formatTitleWithBrand(
      isBg ? 'Обявата е временно недостъпна' : 'Listing Temporarily Unavailable',
      lang
    )
    // PausedProject doesn't have slug, use projectId or identifier
    const urlPath = projectId || identifier
    const canonicalPath = listingHref(locale, urlPath)
    return {
      title,
      description: isBg 
        ? 'Тази обява е временно поставена на пауза.'
        : 'This listing is currently unavailable.',
      robots: {
        index: false, // CRITICAL: noindex
        follow: false,
      },
      alternates: {
        canonical: `${baseUrl}${canonicalPath}`,
      },
    }
  }
  
  // Deleted project - return generic metadata with noindex (NO project-specific data)
  if ('status' in project && project.status === 'deleted') {
    const isBg = lang === 'bg'
    const title = formatTitleWithBrand(
      isBg ? 'Обявата е премахната' : 'Listing Removed',
      lang
    )
    // DeletedProject doesn't have slug, use projectId or identifier
    const urlPath = projectId || identifier
    const canonicalPath = listingHref(locale, urlPath)
    return {
      title,
      description: isBg 
        ? 'Тази обява вече не е налична.'
        : 'This listing is no longer available.',
      robots: {
        index: false, // CRITICAL: noindex
        follow: false,
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
  const brand = brandForLang(lang)
  const projectTitle = fullProject.title || fullProject.name || 'New Construction Project'
  const projectDescription = fullProject.description 
    ? fullProject.description.substring(0, 160) 
    : (isBg 
      ? `Открийте ${projectTitle} в ${fullProject.city || 'България'}. Директна връзка със строителя, без посредници.`
      : `Discover ${projectTitle} in ${fullProject.city || 'Bulgaria'}. Connect directly with the developer, no middlemen.`)
  
  const rawTitle = isBg
    ? `${projectTitle} – ${brand} | Ново Строителство в ${fullProject.city || 'България'}`
    : `${projectTitle} – ${brand} | New Construction in ${fullProject.city || 'Bulgaria'}`
  const title = formatTitleWithBrand(rawTitle, lang)
  
  // Use slug-based URL if available, otherwise fallback to ID
  const canonicalIdentifier = fullProject.slug || fullProject.id || identifier
  const canonicalPath = listingHref(locale, canonicalIdentifier)
  const canonicalUrl = `${baseUrl}${canonicalPath}`
  
  const ogLocale = isBg ? 'bg_BG' : isRu ? 'ru_RU' : 'en_US'
  const rawImage =
    fullProject.cover_image_url ||
    fullProject.images?.[0]?.image_url

  // Ensure OG image is absolute; if missing, fallback to sitewide social image
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
      index: true, // Explicitly allow indexing of active listings
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

export default async function ListingPage({ params }: PageProps) {
  const { lang, slug } = await params
  const locale = asLocale(lang)
  
  // Use last slug segment as identifier (robust against extra segments)
  const identifier = slug.at(-1) ?? ''
  
  // Debug: Log slug parsing to identify truncation
  if (process.env.NODE_ENV === 'development') {
    console.log(`[ListingPage] Parsed slug array:`, slug)
    console.log(`[ListingPage] Identifier (last segment): "${identifier}" (length: ${identifier.length})`)
  }
  
  // Handle empty slug - redirect to listings page (URL normalization)
  if (!identifier || identifier.trim() === '') {
    permanentRedirect(listingsHref(locale))
  }
  
  // Fetch project once - handle errors gracefully (don't throw)
  let project: Project | PausedProject | DeletedProject | null = null
  try {
    project = await getProjectData(identifier)
  } catch (error) {
    console.error(`Error fetching project with identifier "${identifier}":`, error)
    // Return error page instead of throwing (prevents 500 on RSC prefetch)
    // NotFoundPage only accepts 'en' | 'bg', so use locale with fallback
    return <NotFoundPage lang={locale === 'bg' ? 'bg' : 'en'} />
  }
  
  if (!project) {
    // Project not found - return error page instead of throwing
    // NotFoundPage only accepts 'en' | 'bg', so use locale with fallback
    return <NotFoundPage lang={locale === 'bg' ? 'bg' : 'en'} />
  }
  
  // Canonical redirect: if project has slug and identifier doesn't match, redirect to canonical slug URL
  // This handles UUID, wrong slugs, and any non-canonical identifier
  if ('slug' in project && project.slug && identifier !== project.slug) {
    permanentRedirect(listingHref(locale, project.slug))
  }
  
  // For slug-based access, extract the UUID from the project object
  // This ensures we always use the UUID for subsequent fetches (analytics, etc.)
  // All project types (Project, PausedProject, DeletedProject) have an 'id' field
  const projectId = 'id' in project 
    ? String(project.id) 
    : (() => {
        // Fallback should never happen, but log warning if it does
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            `[ListingPage] Project missing id field, using identifier as fallback: ${identifier}`
          )
        }
        return identifier
      })()
  
  // Pass project data directly to avoid second fetch in ListingPageContent
  return (
    <ModalClientWrapper>
      <ListingPageContent lang={locale} id={projectId} initialProject={project} />
    </ModalClientWrapper>
  )
}

