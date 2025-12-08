import { redirect } from "next/navigation"
import type { Metadata } from 'next'
import ListingPageContent from '../[id]/listing-page-content'
import NotFoundPage from '../[id]/not-found-page'
import { Project, PausedProject, DeletedProject } from '@/lib/api'
import { brandForLang, formatTitleWithBrand } from '@/lib/seo'

interface PageProps {
  params: Promise<{
    lang: 'en' | 'bg'
    slug: string[]
  }>
}

// Helper to check if a string is a UUID
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

// Extract ID from slug - could be UUID or slug format
function extractProjectId(slugParts: string[]): string {
  // Join all parts back together
  const fullSlug = slugParts.join('/')
  
  // If it's a UUID, return it directly
  if (isUUID(fullSlug)) {
    return fullSlug
  }
  
  // If it's a slug format, extract the ID from the end
  // Format: {name-slug}-{city-slug}-{id}
  // The ID is the last segment after splitting by '-'
  const parts = fullSlug.split('-')
  // The last 8 characters should be the short ID, but we need the full UUID
  // For now, we'll use the full slug to look up the project
  return fullSlug
}

// Server-side function to fetch project data for metadata
export async function getProjectData(identifier: string, lang: string): Promise<Project | PausedProject | DeletedProject | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const baseUrl = apiUrl.replace(/\/$/, '')
    // URL encode the identifier to handle special characters in slugs
    const encodedIdentifier = encodeURIComponent(identifier)
    // Use no-store to prevent stale cache when switching languages
    const response = await fetch(`${baseUrl}/api/v1/projects/${encodedIdentifier}`, {
      cache: 'no-store', // Disable cache to ensure fresh data on language switch
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mrimot.com'
  const baseUrl = siteUrl.replace(/\/$/, '')
  const socialFallback = 'https://ik.imagekit.io/ts59gf2ul/Logo/mister-imot-waving-hi-with-bg.png?tr=w-1200,h-630,cm-pad_resize,bg-FFFFFF,fo-auto,q-85,f-auto&v=20241205'
  
  // Join slug parts to get full identifier
  const identifier = slug.join('/')
  const project = await getProjectData(identifier, lang)
  
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
        canonical: `${baseUrl}/${lang === 'bg' ? 'bg/obiavi' : 'listings'}/${urlPath}`,
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
        canonical: `${baseUrl}/${lang === 'bg' ? 'bg/obiavi' : 'listings'}/${urlPath}`,
      },
    }
  }
  
  // Active project - return full SEO metadata
  const fullProject = project as Project
  const isBg = lang === 'bg'
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
  const urlPath = fullProject.slug || projectId || identifier
  const canonicalUrl = isBg 
    ? `${baseUrl}/bg/obiavi/${urlPath}`
    : `${baseUrl}/listings/${urlPath}`
  
  const ogLocale = isBg ? 'bg_BG' : 'en_US'
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
        en: `${baseUrl}/listings/${urlPath}`,
        bg: `${baseUrl}/bg/obiavi/${urlPath}`,
        'x-default': `${baseUrl}/listings/${urlPath}`,
      },
    },
    openGraph: {
      title,
      description: projectDescription,
      url: canonicalUrl,
      siteName: brand,
      locale: ogLocale,
      alternateLocale: ['en_US', 'bg_BG'],
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
  // Join all slug parts - this preserves the full slug including hyphens
  // For URL: /bg/obiavi/vista-park-oblast-sofiia-71448713
  // Next.js will parse slug as: ['vista-park-oblast-sofiia-71448713']
  // So slug.join('/') will correctly return the full slug
  const identifier = slug.join('/')
  
  // Debug: Log slug parsing to identify truncation
  if (process.env.NODE_ENV === 'development') {
    console.log(`[ListingPage] Parsed slug array:`, slug)
    console.log(`[ListingPage] Joined identifier: "${identifier}" (length: ${identifier.length})`)
  }
  
  // Handle empty slug - redirect to listings page
  if (!identifier || identifier.trim() === '') {
    const isBg = lang === 'bg'
    redirect(isBg ? '/bg/obiavi' : '/listings')
  }
  
  // Fetch project once - handle errors gracefully (don't throw)
  let project: Project | PausedProject | DeletedProject | null = null
  try {
    project = await getProjectData(identifier, lang)
  } catch (error) {
    console.error(`Error fetching project with identifier "${identifier}":`, error)
    // Return error page instead of throwing (prevents 500 on RSC prefetch)
    return <NotFoundPage lang={lang} />
  }
  
  if (!project) {
    // Project not found - return error page instead of throwing
    return <NotFoundPage lang={lang} />
  }
  
  // Only redirect if accessing via old UUID format AND project has a slug
  // This maintains backward compatibility for old UUID links
  if (isUUID(identifier) && 'slug' in project && project.slug) {
    const isBg = lang === 'bg'
    const newUrl = isBg 
      ? `/bg/obiavi/${project.slug}`
      : `/listings/${project.slug}`
    redirect(newUrl)
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
  return <ListingPageContent lang={lang} id={projectId} initialProject={project} />
}

