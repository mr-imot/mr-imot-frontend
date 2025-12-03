import ListingPageContent from "../../[id]/listing-page-content"
import { ModalClientWrapper } from "../(.)[id]/modal-client-wrapper"
import { Project, PausedProject, DeletedProject } from '@/lib/api'

// Helper to check if a string is a UUID
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

// Server-side function to fetch project data
async function getProjectData(identifier: string, lang: string): Promise<Project | PausedProject | DeletedProject | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const baseUrl = apiUrl.replace(/\/$/, '')
    const response = await fetch(`${baseUrl}/api/v1/projects/${identifier}`, {
      cache: 'no-store',
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

export default async function InterceptedListingModal({ params }: PageProps) {
  const { lang, slug } = await params
  const identifier = slug.join('/')
  
  // Fetch project to get ID
  const project = await getProjectData(identifier, lang)
  
  if (!project || 'status' in project) {
    // If project not found or paused/deleted, modal will handle it
    const projectId = isUUID(identifier) ? identifier : identifier
    return (
      <ModalClientWrapper>
        <ListingPageContent lang={lang} id={projectId} />
      </ModalClientWrapper>
    )
  }
  
  // Extract project ID for the content component
  const projectId = 'id' in project ? String(project.id) : identifier
  
  return (
    <ModalClientWrapper>
      <ListingPageContent lang={lang} id={projectId} />
    </ModalClientWrapper>
  )
}

