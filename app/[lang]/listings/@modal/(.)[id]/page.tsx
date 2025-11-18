import { headers } from "next/headers"
import ListingPageContent from "../../[id]/listing-page-content"
import { ModalClientWrapper } from "./modal-client-wrapper"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function InterceptedListingModal({ params }: PageProps) {
  const { id } = await params
  
  // Get lang from headers (set by middleware)
  const headersList = await headers()
  const locale = headersList.get('x-locale') || 'en'
  const lang = (locale === 'bg' || locale === 'en') ? locale : 'en'
  
  return (
    <ModalClientWrapper>
      <ListingPageContent lang={lang} id={id} />
    </ModalClientWrapper>
  )
}
