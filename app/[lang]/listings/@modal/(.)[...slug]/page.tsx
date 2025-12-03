import ListingPageContent from "../../[id]/listing-page-content"
import { ModalClientWrapper } from "../(.)[id]/modal-client-wrapper"
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
  
  // Handle empty slug - redirect to listings page
  if (!identifier || identifier.trim() === '') {
    const isBg = lang === 'bg'
    // For modal, we can't redirect, so just return not found
    // The modal will handle this gracefully
    return null
  }
  
  // Fetch project once
  const project = await getProjectData(identifier, lang)
  
  if (!project) {
    // Project not found - modal will handle it
    return (
      <ModalClientWrapper>
        <ListingPageContent lang={lang} id={identifier} />
      </ModalClientWrapper>
    )
  }
  
  // Extract project ID for the content component
  // All project types (Project, PausedProject, DeletedProject) have an 'id' field
  const projectId = 'id' in project 
    ? String(project.id) 
    : (() => {
        // Fallback should never happen, but log warning if it does
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            `[InterceptedListingModal] Project missing id field, using identifier as fallback: ${identifier}`
          )
        }
        return identifier
      })()
  
  // Pass project data directly to avoid redundant fetches
  return (
    <ModalClientWrapper>
      <ListingPageContent lang={lang} id={projectId} initialProject={project} />
    </ModalClientWrapper>
  )
}

