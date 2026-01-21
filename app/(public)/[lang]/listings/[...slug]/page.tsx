import { permanentRedirect } from "next/navigation"
import type { Metadata } from 'next'
import { Project, PausedProject, DeletedProject } from '@/lib/api'
import { listingHref, listingsHref, asLocale, type SupportedLocale } from '@/lib/routes'

interface PageProps {
  params: Promise<{
    lang: 'en' | 'bg' | 'ru' | 'gr'
    slug: string[]
  }>
}

// Server-side function to fetch project data for redirect
async function getProjectData(identifier: string): Promise<Project | PausedProject | DeletedProject | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const baseUrl = apiUrl.replace(/\/$/, '')
    const encodedIdentifier = encodeURIComponent(identifier)
    const response = await fetch(`${baseUrl}/api/v1/projects/${encodedIdentifier}`, {
      next: { revalidate: 300 },
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      return null
    }

    const data = await response.json()
    
    if (data.status === 'paused' || data.status === 'deleted') {
      return data as PausedProject | DeletedProject
    }
    
    return data as Project
  } catch (error) {
    console.error(`Error fetching project for redirect: ${identifier}`, error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // This route is redirect-only, never indexed
  return {
    title: 'Redirecting...',
    robots: {
      index: false,
      follow: true,
    },
  }
}

/**
 * Redirect-only route for legacy [...slug] URLs.
 * 
 * This route exists for backward compatibility and always redirects (301) to the canonical
 * /p/[slug] route.
 * 
 * Never renders listing content - only redirects.
 */
export default async function ListingRedirectPage({ params }: PageProps) {
  const { lang, slug } = await params
  const locale = asLocale(lang)
  
  // Use last slug segment as identifier (robust against extra segments)
  const identifier = slug.at(-1) ?? ''
  
  // Handle empty slug - redirect to listings page
  if (!identifier || identifier.trim() === '') {
    permanentRedirect(listingsHref(locale))
  }
  
  // Fetch project to get canonical slug
  const project = await getProjectData(identifier)
  
  if (!project) {
    // Project not found - redirect to listings page
    permanentRedirect(listingsHref(locale))
  }
  
  // Determine canonical identifier (prefer slug, fallback to identifier)
  let canonicalIdentifier: string
  if ('slug' in project && project.slug) {
    canonicalIdentifier = project.slug
  } else {
    // Use identifier (UUID or whatever was in URL)
    canonicalIdentifier = identifier
  }
  
  // Redirect to canonical /p/[slug] route (301 permanent redirect)
  permanentRedirect(listingHref(locale, canonicalIdentifier))
}
