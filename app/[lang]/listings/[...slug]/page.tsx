import { notFound, redirect } from "next/navigation"
import type { Metadata } from 'next'
import ListingPageContent from '../[id]/listing-page-content'
import { Project, PausedProject, DeletedProject } from '@/lib/api'

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
    // Use no-store to prevent stale cache when switching languages
    const response = await fetch(`${baseUrl}/api/v1/projects/${identifier}`, {
      cache: 'no-store', // Disable cache to ensure fresh data on language switch
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null // Project never existed
      }
      throw new Error(`Failed to fetch project: ${response.statusText}`)
    }

    const data = await response.json()
    
    // Check if this is a status-only response (paused/deleted)
    if (data.status === 'paused' || data.status === 'deleted') {
      return data as PausedProject | DeletedProject
    }
    
    return data as Project
  } catch (error) {
    console.error('Error fetching project for metadata:', error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mrimot.com'
  const baseUrl = siteUrl.replace(/\/$/, '')
  
  // Join slug parts to get full identifier
  const identifier = slug.join('/')
  const project = await getProjectData(identifier, lang)
  
  // Project never existed - return 404 metadata
  if (!project) {
    return {
      title: 'Project Not Found',
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
    // PausedProject doesn't have slug, use projectId or identifier
    const urlPath = projectId || identifier
    return {
      title: isBg ? 'Обявата е временно недостъпна' : 'Listing Temporarily Unavailable',
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
    // DeletedProject doesn't have slug, use projectId or identifier
    const urlPath = projectId || identifier
    return {
      title: isBg ? 'Обявата е премахната' : 'Listing Removed',
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
  const brand = isBg ? 'Мистър Имот' : 'Mister Imot'
  const projectTitle = fullProject.title || fullProject.name || 'New Construction Project'
  const projectDescription = fullProject.description 
    ? fullProject.description.substring(0, 160) 
    : (isBg 
      ? `Открийте ${projectTitle} в ${fullProject.city || 'България'}. Директна връзка със строителя, без посредници.`
      : `Discover ${projectTitle} in ${fullProject.city || 'Bulgaria'}. Connect directly with the developer, no middlemen.`)
  
  const title = isBg
    ? `${projectTitle} – ${brand} | Ново Строителство в ${fullProject.city || 'България'}`
    : `${projectTitle} – ${brand} | New Construction in ${fullProject.city || 'Bulgaria'}`
  
  // Use slug-based URL if available, otherwise fallback to ID
  const urlPath = fullProject.slug || projectId || identifier
  const canonicalUrl = isBg 
    ? `${baseUrl}/bg/obiavi/${urlPath}`
    : `${baseUrl}/listings/${urlPath}`
  
  const ogLocale = isBg ? 'bg_BG' : 'en_US'
  const ogImage = fullProject.cover_image_url || fullProject.images?.[0]?.image_url
  
  return {
    title,
    description: projectDescription,
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
      ...(ogImage && { images: [{ url: ogImage }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: projectDescription,
      ...(ogImage && { images: [ogImage] }),
    },
  }
}

export default async function ListingPage({ params }: PageProps) {
  const { lang, slug } = await params
  const identifier = slug.join('/')
  
  // Handle empty slug - redirect to listings page
  if (!identifier || identifier.trim() === '') {
    const isBg = lang === 'bg'
    redirect(isBg ? '/bg/obiavi' : '/listings')
  }
  
  // Fetch project once
  const project = await getProjectData(identifier, lang)
  
  if (!project) {
    notFound()
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
  // This ensures we always use the UUID for subsequent fetches
  const projectId = 'id' in project ? String(project.id) : identifier
  
  // Pass project data directly to avoid second fetch in ListingPageContent
  return <ListingPageContent lang={lang} id={projectId} initialProject={project} />
}

