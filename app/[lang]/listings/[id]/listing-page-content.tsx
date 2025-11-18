import { notFound } from "next/navigation"
import ListingDetailClient from './listing-detail-client'
import PausedListingPage from './paused-listing-page'
import DeletedListingPage from './deleted-listing-page'
import { Project, PausedProject, DeletedProject } from '@/lib/api'

interface ListingPageContentProps {
  lang: 'en' | 'bg'
  id: string
}

// Server-side function to fetch project data
async function getProjectData(id: string): Promise<Project | PausedProject | DeletedProject | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const baseUrl = apiUrl.replace(/\/$/, '')
    const response = await fetch(`${baseUrl}/api/v1/projects/${id}`, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
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
  const project = await getProjectData(id)
  
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
  
  // Active project - return full listing page
  return <ListingDetailClient projectId={id} />
}

