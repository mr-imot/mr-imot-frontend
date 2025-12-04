import ListingPageContent from "../../[id]/listing-page-content"
import { ModalClientWrapper, ModalNotFound } from "../(.)[id]/modal-client-wrapper"
import { getProjectData } from "../../[...slug]/page"

interface PageProps {
  params: Promise<{
    lang: 'en' | 'bg'
    slug: string[]
  }>
}

export default async function InterceptedListingModal({ params }: PageProps) {
  const { lang, slug } = await params
  const identifier = slug.join('/')
  
  // Handle empty slug - return null (modal won't show)
  if (!identifier || identifier.trim() === '') {
    return null
  }
  
  // Fetch project once
  let project = null
  try {
    project = await getProjectData(identifier, lang)
  } catch (error) {
    // Log error but don't throw - return graceful error UI
    console.error(`[InterceptedModal] Error fetching project ${identifier}:`, error)
  }
  
  // Project not found - return graceful error UI in modal (don't throw)
  if (!project) {
    return (
      <ModalClientWrapper>
        <ModalNotFound lang={lang} />
      </ModalClientWrapper>
    )
  }
  
  // Extract project ID for the content component
  const projectId = 'id' in project ? String(project.id) : identifier
  
  // Pass project data directly to avoid redundant fetches
  return (
    <ModalClientWrapper>
      <ListingPageContent lang={lang} id={projectId} initialProject={project} />
    </ModalClientWrapper>
  )
}

