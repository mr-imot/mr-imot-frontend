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
  
  // Fetch project to get ID
  const project = await getProjectData(identifier, lang)
  
  if (!project || 'status' in project) {
    // If project not found or paused/deleted, modal will handle it
    // Use identifier as projectId (could be UUID or slug)
    return (
      <ModalClientWrapper>
        <ListingPageContent lang={lang} id={identifier} />
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

