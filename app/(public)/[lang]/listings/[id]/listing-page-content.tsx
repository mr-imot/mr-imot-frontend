import ListingDetailClient from './listing-detail-client'
import PausedListingPage from './paused-listing-page'
import DeletedListingPage from './deleted-listing-page'
import NotFoundPage from './not-found-page'
import { Project, PausedProject, DeletedProject } from '@/lib/api'
import ListingStructuredData from './listing-structured-data'
import { getSiteUrl } from '@/lib/seo'
import { getDictionary } from '@/lib/dictionaries'

interface ListingPageContentProps {
  lang: 'en' | 'bg' | 'ru' | 'gr'
  id: string
  initialProject?: Project | PausedProject | DeletedProject
  isModal?: boolean // Indicates if rendered in modal context
}

// Server-side function to fetch project data with caching
async function getProjectData(id: string, lang: string): Promise<Project | PausedProject | DeletedProject | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const baseUrl = apiUrl.replace(/\/$/, '')
    const response = await fetch(`${baseUrl}/api/v1/projects/${encodeURIComponent(id)}`, {
      next: { revalidate: 60 }, // Cache for 60 seconds - fast page loads
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Failed to fetch project: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.status === 'paused' || data.status === 'deleted') {
      return data as PausedProject | DeletedProject
    }
    
    return data as Project
  } catch (error) {
    console.error('Error fetching project:', error)
    return null
  }
}

export default async function ListingPageContent({ 
  lang, 
  id, 
  initialProject,
  isModal = false
}: ListingPageContentProps) {
  // Use initial project if provided, otherwise fetch
  const project = initialProject || await getProjectData(id, lang)
  
  // Project never existed - return not found page (don't throw)
  if (!project) {
    return <NotFoundPage lang={lang} />
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
  const baseUrl = getSiteUrl() // Hardcoded production domain for SEO
  const dict = await getDictionary(lang)
  
  return (
    <>
      <ListingStructuredData project={activeProject} lang={lang} baseUrl={baseUrl} />
      <ListingDetailClient 
        key={activeProject.id} 
        projectId={id} 
        initialProject={activeProject}
        isModal={isModal}
        translations={{
          listingDetail: dict.listingDetail,
          price: dict.price,
          features: dict.features,
        }}
      />
    </>
  )
}

