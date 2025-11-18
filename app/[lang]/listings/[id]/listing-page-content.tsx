import { notFound } from "next/navigation"
import ListingDetailClient from './listing-detail-client'
import PausedListingPage from './paused-listing-page'
import DeletedListingPage from './deleted-listing-page'
import { Project, PausedProject, DeletedProject } from '@/lib/api'
import ListingStructuredData from './listing-structured-data'

interface ListingPageContentProps {
  lang: 'en' | 'bg'
  id: string
}

// Server-side function to fetch project data
async function getProjectData(id: string, lang: string): Promise<Project | PausedProject | DeletedProject | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const baseUrl = apiUrl.replace(/\/$/, '')
    // Include lang in cache key to ensure re-fetch on language change
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
    console.error('Error fetching project:', error)
    return null
  }
}

export default async function ListingPageContent({ lang, id }: ListingPageContentProps) {
  const project = await getProjectData(id, lang)
  
  // Project never existed - return 404
  if (!project) {
    notFound()
  }
  
  // Paused project - return paused page with NO project data
  if ('status' in project && project.status === 'paused') {
    return <PausedListingPage listingId={id} lang={lang} />
  }
  
  // Deleted project - return deleted page with NO project data
  if ('status' in project && project.status === 'deleted') {
    return <DeletedListingPage listingId={id} lang={lang} />
  }
  
  // Active project - return full listing page with structured data
  const activeProject = project as Project
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mrimot.com'
  const baseUrl = siteUrl.replace(/\/$/, '')
  
  return (
    <>
      <ListingStructuredData project={activeProject} lang={lang} baseUrl={baseUrl} />
      <ListingDetailClient projectId={id} />
    </>
  )
}

