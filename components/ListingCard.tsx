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
      className="block clickable"
      style={{ transition: 'none', transform: 'translateZ(0)' }}
    >
      <article
        ref={cardRef}
        data-id={listing.id}
        className="group cursor-pointer transition-[filter] duration-300 ease-out"
        style={{
          filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))',
          touchAction: 'manipulation',
          transform: 'translateZ(0)',
          ...(isActive && { filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.15))' })
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
      {/* Image Container - Airbnb approach: container clips image with rounded corners */}
      <div className="relative overflow-hidden h-[240px] w-full cursor-pointer" style={{ 
        borderRadius: '20px',
        WebkitBorderRadius: '20px',
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
        isolation: 'isolate',
        cursor: 'pointer'
      }}>
        <div 
          className="relative w-full h-full cursor-pointer"
          style={{ cursor: 'pointer' }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <Image
            key={currentImageIndex}
            src={listing.images[currentImageIndex] || '/placeholder.svg'}
            alt={listing.title}
            fill
            className="object-cover cursor-pointer"
            style={{ cursor: 'pointer' }}
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

       {/* Text floating directly below image - Fixed heights for consistency */}
       <div className="pt-3 flex flex-col gap-1">
         {/* Title - Fixed height container, max 2 lines */}
         <div className="h-12 flex items-start justify-between gap-2">
           <h3 
             id={`title_${listing.id}`}
             className="font-semibold text-gray-900 text-[16px] leading-tight line-clamp-2 flex-1 text-left"
           >
             {listing.title}
           </h3>
           <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
         </div>
         
         {/* Description - Fixed height, max 1 line */}
         <div className="h-5 flex items-center">
           {summarize(listing.description, 60) && (
             <p className="text-gray-600 text-[14px] font-normal leading-relaxed line-clamp-1 text-left">
               {summarize(listing.description, 60)}
             </p>
           )}
         </div>

         {/* Location - Fixed height, max 1 line */}
         <div className="h-5 flex items-center gap-2">
           {listing.propertyType === 'Residential Houses' ? (
             <Home className="h-4 w-4 text-gray-500 flex-shrink-0" />
           ) : (
             <Building className="h-4 w-4 text-gray-500 flex-shrink-0" />
           )}
           <span className="text-gray-600 text-[14px] font-medium text-left truncate">
             {listing.city}
           </span>
         </div>
         
         {/* Price - Fixed height, max 1 line */}
         <div className="h-6 flex items-center">
           <span className="text-gray-900 font-semibold text-[15px] text-left">
             {listing.priceLabel || (listing.price?.amount && listing.price?.currency ? `${listing.price.amount} ${listing.price.currency}` : 'Request price')}
           </span>
         </div>
       </div>
       </article>
     </a>
   )
 }
