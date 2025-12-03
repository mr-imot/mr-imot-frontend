import ListingPageContent from "../../[id]/listing-page-content"
import { ModalClientWrapper } from "./modal-client-wrapper"

interface PageProps {
  params: Promise<{
    lang: 'en' | 'bg'
    id: string
  }>
}

export default async function InterceptedListingModal({ params }: PageProps) {
  const { lang, id } = await params
  
  return (
    <ModalClientWrapper>
      <ListingPageContent lang={lang} id={id} />
    </ModalClientWrapper>
  )
}
