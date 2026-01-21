import { notFound, permanentRedirect } from "next/navigation"
import type { Metadata } from 'next'
import { Project, PausedProject, DeletedProject } from '@/lib/api'
import { listingHref, asLocale } from '@/lib/routes'

interface PageProps {
  params: Promise<{
    lang: 'en' | 'bg' | 'ru' | 'gr'
    id: string
  }>
}

// Server-side function to fetch project data for redirect
async function getProjectData(id: string): Promise<Project | PausedProject | DeletedProject | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const baseUrl = apiUrl.replace(/\/$/, '')
    const response = await fetch(`${baseUrl}/api/v1/projects/${encodeURIComponent(id)}`, {
      next: { revalidate: 300 },
      headers: { 'Content-Type': 'application/json' },
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
    console.error('Error fetching project for redirect:', error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // This route is redirect-only, never indexed
  // Use follow: true (not false) to allow link crawling if page ever renders
  return {
    title: 'Redirecting...',
    robots: {
      index: false,
      follow: true,
    },
  }
}

/**
 * Redirect-only route for legacy [id] URLs.
 * 
 * This route exists for backward compatibility and always redirects (301) to the canonical
 * /p/[slug] route.
 * 
 * The [id] folder must remain for @modal/(.)[id] intercept route to work.
 */
export default async function ListingPageRedirect({ params }: PageProps) {
  const { lang, id } = await params
  const locale = asLocale(lang)
  
  // Fetch project to get slug for redirect
  const project = await getProjectData(id)
  
  if (!project) {
    notFound()
  }
  
  // Always redirect to canonical /p/[slug] route (301 permanent redirect)
  // Prefer slug if available, otherwise use identifier
  const canonicalIdentifier = ('slug' in project && project.slug) ? project.slug : id
  permanentRedirect(listingHref(locale, canonicalIdentifier))
}
