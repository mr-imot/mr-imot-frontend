import ListingPageContent from "../../[id]/listing-page-content"
import { ModalClientWrapper, ModalNotFound } from "./modal-client-wrapper"
import { Project, PausedProject, DeletedProject } from "@/lib/api"

interface PageProps {
  params: Promise<{
    lang: 'en' | 'bg'
    id: string
  }>
}

// Server-side fetch to pre-validate the project exists
async function getProjectData(id: string): Promise<Project | PausedProject | DeletedProject | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const baseUrl = apiUrl.replace(/\/$/, '')
    const response = await fetch(`${baseUrl}/api/v1/projects/${encodeURIComponent(id)}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error(`[InterceptedModal] Error fetching project ${id}:`, error)
    return null
  }
}

export default async function InterceptedListingModal({ params }: PageProps) {
  const { lang, id } = await params
  
  // Pre-fetch to avoid errors during RSC prefetch
  let project = null
  try {
    project = await getProjectData(id)
  } catch {
    // Error already logged in getProjectData
  }
  
  // If project not found, return graceful error (don't throw)
  if (!project) {
    return (
      <ModalClientWrapper>
        <ModalNotFound lang={lang} />
      </ModalClientWrapper>
    )
  }
  
  const projectId = 'id' in project ? String(project.id) : id
  
  return (
    <ModalClientWrapper>
      <ListingPageContent lang={lang} id={projectId} initialProject={project} />
    </ModalClientWrapper>
  )
}
