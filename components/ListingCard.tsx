import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Home, Building, ExternalLink } from 'lucide-react'
import { recordProjectView } from '@/lib/api'

export interface Listing {
  id: string
  title: string
  city: string
  coordinates: { lat: number; lng: number }
  price: { amount: number; currency: string } | null
  priceLabel?: string | null
  description?: string | null
  rating: number
  reviewCount: number
  status: string
  propertyType?: "Apartment Complex" | "Residential Houses"
  images: string[]
}

interface ListingCardProps {
  listing: Listing
  isActive?: boolean
  onCardClick?: (listing: Listing) => void
  onCardHover?: (listingId: string | null) => void
}

// Format price using Intl.NumberFormat
function summarize(text: string | null | undefined, max = 100) {
  if (!text) return null
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (normalized.length <= max) return normalized
  return normalized.slice(0, max - 1) + '…'
}

export function ListingCard({ listing, isActive, onCardClick, onCardHover }: ListingCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [hasTrackedView, setHasTrackedView] = useState(false)
  const hasMultipleImages = listing.images?.length > 1
  const cardRef = useRef<HTMLElement>(null)

  const handleClick = (e: React.MouseEvent) => {
    // Call the parent click handler if provided (for map interactions)
    onCardClick?.(listing)
    
    // Let the link handle navigation naturally
    // No need to prevent default or handle manually
  }

  const handleMouseEnter = () => {
    onCardHover?.(listing.id)
  }

  const handleMouseLeave = () => {
    onCardHover?.(null)
  }

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev + 1) % listing.images.length)
  }

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length)
  }

  const goToImage = (index: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex(index)
  }

  // Track view when card becomes visible
  useEffect(() => {
    if (!cardRef.current || hasTrackedView) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTrackedView) {
            // Track view with debounce to avoid multiple calls
            setTimeout(async () => {
              try {
                await recordProjectView(listing.id)
                setHasTrackedView(true)
              } catch (error) {
                // Fail silently to not break user experience
                console.warn('Analytics tracking failed:', error)
                setHasTrackedView(true) // Mark as tracked to avoid retry
              }
            }, 1000) // 1 second delay to ensure user actually viewed it
          }
        })
      },
      { threshold: 0.5 } // Trigger when 50% of card is visible
    )

    observer.observe(cardRef.current)

    return () => {
      observer.disconnect()
    }
  }, [listing.id, hasTrackedView])

    return (
    <a
      href={`/listing/${listing.id}`}
      target={`listing_${listing.id}`}
      rel="noopener noreferrer nofollow"
      aria-labelledby={`title_${listing.id}`}
      className="block"
    >
      <article
        ref={cardRef}
        data-id={listing.id}
        className={cn(
          "group cursor-pointer bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 ease-out overflow-hidden hover:border-brand/30",
          isActive && "bg-gray-50 border-gray-200 shadow-lg"
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
      {/* Image Container - 60-65% of card height like Airbnb */}
      <div className="relative overflow-hidden">
        <div className="relative aspect-[4/3] w-full">
          <Image
            key={currentImageIndex}
            src={listing.images[currentImageIndex] || '/placeholder.svg'}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
          />
        </div>

        {/* Image Navigation (only if multiple images) */}
        {hasMultipleImages && (
          <>
                         {/* Dots - Balanced positioning */}
             <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
               {listing.images.map((_, idx) => (
                 <button
                   key={idx}
                   type="button"
                   className={cn(
                     "h-1.5 w-1.5 rounded-full transition-all duration-200",
                     idx === currentImageIndex ? "bg-white scale-110" : "bg-white/60 hover:bg-white/80"
                   )}
                   onClick={(e) => goToImage(idx, e)}
                   aria-label={`Go to image ${idx + 1}`}
                 />
               ))}
             </div>

                         {/* Previous/Next Arrows - Balanced size */}
             <button
               type="button"
               aria-label="Previous image"
               onClick={prevImage}
               className="absolute left-2 top-1/2 -translate-y-1/2 grid place-items-center h-8 w-8 rounded-full bg-white/95 hover:bg-white shadow-md text-[#222222] font-bold text-base opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
             >
               ‹
             </button>
             <button
               type="button"
               aria-label="Next image"
               onClick={nextImage}
               className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center h-8 w-8 rounded-full bg-white/95 hover:bg-white shadow-md text-[#222222] font-bold text-base opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
             >
               ›
             </button>
          </>
        )}
      </div>

      {/* Content - 35-40% of card height like Airbnb */}
      <div className="p-3 flex flex-col justify-between">
        {/* Project name - Premium typography */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 
            id={`title_${listing.id}`}
            className="font-outfit text-[#222222] text-[16px] font-semibold leading-tight line-clamp-2 tracking-[-0.01em] flex-1"
          >
            {listing.title}
          </h3>
          <ExternalLink className="h-3.5 w-3.5 text-gray-400 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>
        
        {/* Summary description */}
        {summarize(listing.description) && (
          <p className="font-source-sans text-[#717171] text-[13px] font-normal leading-snug mb-2 line-clamp-2">
            {summarize(listing.description)}
          </p>
        )}

        {/* City with property type icon */}
        <div className="flex items-center gap-2 mb-2">
          {listing.propertyType === 'Residential Houses' ? (
            <Home className="h-3.5 w-3.5 text-brand flex-shrink-0" />
          ) : (
            <Building className="h-3.5 w-3.5 text-brand flex-shrink-0" />
          )}
          <p className="font-source-sans text-[#717171] text-[14px] font-normal leading-tight truncate">
            {listing.city}
          </p>
        </div>
        
        {/* Price - Premium typography */}
        <div className="text-sm text-[#222222] leading-tight">
          {listing.priceLabel ? (
            <span className="font-outfit text-[15px] font-medium tracking-[-0.005em]">{listing.priceLabel}</span>
          ) : listing.price ? (
            <span className="font-outfit text-[15px] font-medium tracking-[-0.005em]">{`${listing.price.amount} ${listing.price.currency}`}</span>
          ) : (
            <span className="font-outfit text-[15px] font-medium text-brand tracking-[-0.005em]">Request price</span>
          )}
        </div>
               </div>
       </article>
     </a>
   )
 }
