import { notFound, redirect } from "next/navigation"
import type { Metadata } from 'next'
import ListingPageContent from './listing-page-content'
import { Project, PausedProject, DeletedProject } from '@/lib/api'
import { brandForLang, formatTitleWithBrand, getSiteUrl } from '@/lib/seo'
import { ModalClientWrapper } from '../@modal/(.)[id]/modal-client-wrapper'

interface PageProps {
  params: Promise<{
    lang: 'en' | 'bg' | 'ru' | 'gr'
    id: string
  }>
}

// Server-side function to fetch project data for metadata
async function getProjectData(id: string, lang: string): Promise<Project | PausedProject | DeletedProject | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const baseUrl = apiUrl.replace(/\/$/, '')
    // Use no-store to prevent stale cache when switching languages
    const response = await fetch(`${baseUrl}/api/v1/projects/${id}`, {
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
  const { lang, id } = await params
  const baseUrl = getSiteUrl() // Hardcoded production domain for canonical URLs
  
  const project = await getProjectData(id, lang)
  
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
  
  // Paused project - return generic metadata with noindex (NO project-specific data)
  if ('status' in project && project.status === 'paused') {
    const isBg = lang === 'bg'
    const title = formatTitleWithBrand(
      isBg ? 'Обявата е временно недостъпна' : 'Listing Temporarily Unavailable',
      lang
    )
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
        canonical: `${baseUrl}/${lang === 'bg' ? 'bg/obiavi' : 'en/listings'}/${id}`,
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
        canonical: `${baseUrl}/${lang === 'bg' ? 'bg/obiavi' : 'en/listings'}/${id}`,
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
  
  // Use pretty URL for Bulgarian, canonical for English
  const canonicalUrl = isBg 
    ? `${baseUrl}/bg/obiavi/${id}`
    : `${baseUrl}/listings/${id}`
  
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
        en: `${baseUrl}/listings/${id}`,
        bg: `${baseUrl}/bg/obiavi/${id}`,
        ru: `${baseUrl}/ru/obyavleniya/${id}`,
        el: `${baseUrl}/gr/aggelies/${id}`,
        'x-default': `${baseUrl}/listings/${id}`,
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
  const { lang, id } = await params
  
  // Check if this is a UUID format - if so, redirect to slug route immediately
  // This route only exists for backward compatibility with old UUID URLs
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const isUUIDFormat = uuidRegex.test(id)
  
  if (isUUIDFormat) {
    // For UUIDs, fetch project to get slug and redirect immediately
    // This prevents the [id] route from rendering before redirect
    const project = await getProjectData(id, lang)
    
    if (!project) {
      notFound()
    }
    
    // If project has a slug, redirect to slug-based URL immediately (301 permanent redirect for SEO)
    if ('slug' in project && project.slug) {
      const isBg = lang === 'bg'
      const newUrl = isBg 
        ? `/bg/obiavi/${project.slug}`
        : `/listings/${project.slug}`
      redirect(newUrl)
    }
  }
  
  // For non-UUID IDs or projects without slugs, fetch and render
  const project = await getProjectData(id, lang)
  
  if (!project) {
    notFound()
  }
  
  // Fallback: if no slug exists (legacy projects), render with ID
  return (
    <ModalClientWrapper>
      <ListingPageContent lang={lang} id={id} />
    </ModalClientWrapper>
  )
}
