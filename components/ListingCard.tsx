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
  
  // Touch/swipe functionality for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  
  // Minimum swipe distance
  const minSwipeDistance = 50

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
  
  // Touch event handlers for mobile swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }
  
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    
    if (isLeftSwipe && hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.images.length)
    }
    if (isRightSwipe && hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length)
    }
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
          "group cursor-pointer bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 ease-out overflow-hidden hover:border-brand/30 h-[420px] flex flex-col",
          isActive && "bg-gray-50 border-gray-200 shadow-lg"
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
      {/* Image Container - Fixed height like card 2 */}
      <div className="relative overflow-hidden h-[240px] flex-shrink-0">
        <div 
          className="relative w-full h-full"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <Image
            key={currentImageIndex}
            src={listing.images[currentImageIndex] || '/placeholder.svg'}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 40em) 100vw, (max-width: 64em) 50vw, 33vw"
            loading="lazy"
          />
        </div>

        {/* Image Navigation (only if multiple images) */}
        {hasMultipleImages && (
          <>
                         {/* Dots - Mobile-optimized positioning */}
             <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 mobile-dots">
               {listing.images.map((_, idx) => (
                 <button
                   key={idx}
                   type="button"
                   className={cn(
                     "h-1 w-1 xs:h-1 xs:w-1 sm:h-1.5 sm:w-1.5 md:h-2 md:w-2 rounded-full transition-all duration-200 transform-none",
                     idx === currentImageIndex ? "bg-white" : "bg-white/60 hover:bg-white/80"
                   )}
                   onClick={(e) => goToImage(idx, e)}
                   aria-label={`Go to image ${idx + 1}`}
                 />
               ))}
             </div>

                                                  {/* Previous/Next Arrows - Hidden on mobile, visible on desktop */}
                         <button
                           type="button"
                           aria-label="Previous image"
                           onClick={prevImage}
                           className="hidden sm:grid absolute left-2 top-1/2 -translate-y-1/2 place-items-center h-8 w-8 rounded-full bg-white/95 hover:bg-white shadow-md text-[#222222] font-bold text-base opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                         >
                           ‹
                         </button>
                         <button
                           type="button"
                           aria-label="Next image"
                           onClick={nextImage}
                           className="hidden sm:grid absolute right-2 top-1/2 -translate-y-1/2 place-items-center h-8 w-8 rounded-full bg-white/95 hover:bg-white shadow-md text-[#222222] font-bold text-base opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                         >
                           ›
                         </button>
          </>
        )}
      </div>

      {/* Content - Fixed height like card 2 */}
      <div className="p-3 h-[180px] flex flex-col justify-between">
        {/* Top section - Title and description with fixed height */}
        <div className="h-[120px] flex flex-col justify-start">
          {/* Project name - Premium typography with fixed height */}
          <div className="h-[48px] flex items-start justify-between gap-2 mb-2">
            <h3 
              id={`title_${listing.id}`}
              className="font-outfit text-[#222222] text-[16px] font-semibold leading-tight line-clamp-2 tracking-[-0.01em] flex-1"
            >
              {listing.title}
            </h3>
            <ExternalLink className="h-3.5 w-3.5 text-gray-400 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
          
          {/* Summary description with fixed height */}
          <div className="h-[48px] flex items-start">
            {summarize(listing.description) && (
              <p className="font-source-sans text-[#717171] text-[13px] font-normal leading-snug line-clamp-2">
                {summarize(listing.description)}
              </p>
            )}
          </div>
        </div>

        {/* Bottom section - Location and price with fixed height */}
        <div className="h-[60px] flex flex-col justify-end">
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
      </div>
       </article>
     </a>
   )
 }
