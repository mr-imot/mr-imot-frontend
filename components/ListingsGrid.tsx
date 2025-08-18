import { ListingCard, Listing } from './ListingCard'

interface ListingsGridProps {
  listings: Listing[]
  onListingClick?: (listing: Listing) => void
  onListingHover?: (listingId: number | null) => void
  selectedListingId?: number | null
  hoveredListingId?: number | null
}

export function ListingsGrid({ 
  listings, 
  onListingClick, 
  onListingHover,
  selectedListingId,
  hoveredListingId
}: ListingsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          isActive={selectedListingId === listing.id || hoveredListingId === listing.id}
          onCardClick={onListingClick}
          onCardHover={onListingHover}
        />
      ))}
    </div>
  )
}
