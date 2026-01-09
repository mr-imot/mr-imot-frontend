import { useState, useEffect, useRef, memo } from 'react'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { cn, getListingUrl } from '@/lib/utils'
import { Home, Building, ExternalLink } from 'lucide-react'
import { trackProjectView } from '@/lib/analytics-batch'
import { translatePrice, PriceTranslations } from '@/lib/price-translator'
import { useEmblaCarouselWithPhysics } from '@/hooks/use-embla-carousel'

export interface Listing {
  id: string
  slug?: string
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
  priority?: boolean
  priceTranslations?: PriceTranslations
}

// Format price using Intl.NumberFormat
function summarize(text: string | null | undefined, max = 100) {
  if (!text) return null
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (normalized.length <= max) return normalized
  return normalized.slice(0, max - 1) + '…'
}

function ListingCardComponent({ listing, isActive, onCardClick, onCardHover, priority = false, priceTranslations }: ListingCardProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [hasTrackedView, setHasTrackedView] = useState(false)
  const hasMultipleImages = listing.images?.length > 1
  const cardRef = useRef<HTMLElement>(null)
  
  // Detect locale from pathname
  const lang = pathname.startsWith('/bg/') ? 'bg' : 'en'
  const listingUrl = getListingUrl(listing, lang)
  
  // Handle card click - Desktop: new tab, Mobile: modal
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on carousel controls
    const target = e.target as HTMLElement
    if (target.closest('button')) return
    
    // If onCardClick prop is provided, use it (allows parent to override behavior)
    if (onCardClick) {
      onCardClick(listing)
      return
    }
    
    // Default behavior: Desktop: new tab, Mobile: modal
    const isDesktop = window.innerWidth >= 1024
    
    if (isDesktop) {
      // Desktop: open in new tab for better UX (preserves listings page state)
      window.open(listingUrl, '_blank', 'noopener,noreferrer')
    } else {
      // Mobile: use router for modal interception (preserves map state)
      router.push(listingUrl)
    }
  }
  
  // Embla carousel hook with physics-based configuration
  const {
    emblaRef,
    selectedIndex,
    scrollPrev,
    scrollNext,
    scrollTo,
    canScrollPrev,
    canScrollNext
  } = useEmblaCarouselWithPhysics({
    options: {
      loop: hasMultipleImages,
      dragFree: false,
      containScroll: 'trimSnaps'
    }
  })

  // NOTE: Disabled prefetch - it was causing 500 errors during RSC streaming
  // The server components for listing detail pages have issues with RSC prefetch
  // Navigation will still work, just without prefetching
  // TODO: Re-enable once RSC prefetch issues are resolved

  const handleMouseEnter = () => {
    onCardHover?.(listing.id)
  }

  const handleMouseLeave = () => {
    onCardHover?.(null)
  }

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    scrollNext()
  }

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    scrollPrev()
  }

  const goToImage = (index: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    scrollTo(index)
  }

  // Track view when card becomes visible
  useEffect(() => {
    if (!cardRef.current || hasTrackedView) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTrackedView) {
            // Track view using batched analytics (debounced and batched)
            trackProjectView(listing.id)
            setHasTrackedView(true)
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
    <div
      onClick={handleCardClick}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') handleCardClick(e as unknown as React.MouseEvent) }}
      aria-labelledby={`title_${listing.id}`}
      className="block clickable cursor-pointer"
      style={{ transition: 'none', transform: 'translateZ(0)' }}
    >
      {/* Hidden SEO link for crawlers - they can't execute JavaScript */}
      <a href={listingUrl} className="sr-only" aria-hidden="true" tabIndex={-1}>
        {listing.title}
      </a>
      <article
        ref={cardRef}
        data-id={listing.id}
        className="group cursor-pointer transition-[filter] duration-300 ease-out"
        style={{
          filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))',
          touchAction: 'manipulation',
          transform: 'none',
          opacity: 1,
          willChange: 'auto',
          ...(isActive && { filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.15))' })
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
      {/* Image Container - Embla Carousel with smooth transitions */}
      <div className="relative overflow-hidden h-[240px] w-full cursor-pointer" style={{ 
        borderRadius: '20px',
        WebkitBorderRadius: '20px',
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
        isolation: 'isolate',
        cursor: 'pointer'
      }}>
        <div className="embla" ref={emblaRef}>
          <div className="embla__container flex">
            {listing.images.map((image, index) => (
              <div key={index} className="embla__slide flex-[0_0_100%] min-w-0">
                <div className="relative w-full h-[240px]">
                  <Image
                    src={image || '/placeholder.svg'}
                    alt={listing.title}
                    fill
                    className="object-cover cursor-pointer"
                    style={{ cursor: 'pointer' }}
                    sizes="(max-width: 40em) 100vw, (max-width: 64em) 50vw, 33vw"
                    loading={priority ? "eager" : "lazy"}
                    priority={priority}
                  />
                </div>
              </div>
            ))}
          </div>
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
                    "h-1 w-1 sm:h-1.5 sm:w-1.5 md:h-2 md:w-2 rounded-full transition-all duration-200 transform-none",
                    idx === selectedIndex ? "bg-white ring-2 ring-black/30 shadow-lg" : "bg-white/60 hover:bg-white/80 ring-2 ring-black/30 shadow-md"
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
              disabled={!canScrollPrev}
              className="hidden sm:grid absolute left-2 top-1/2 -translate-y-1/2 place-items-center h-8 w-8 rounded-full bg-white/95 hover:bg-white shadow-xl ring-2 ring-black/30 backdrop-blur-sm text-[#222222] font-bold text-base opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={nextImage}
              disabled={!canScrollNext}
              className="hidden sm:grid absolute right-2 top-1/2 -translate-y-1/2 place-items-center h-8 w-8 rounded-full bg-white/95 hover:bg-white shadow-xl ring-2 ring-black/30 backdrop-blur-sm text-[#222222] font-bold text-base opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed"
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
             {priceTranslations 
               ? translatePrice(listing.priceLabel, priceTranslations)
               : (listing.price?.amount && listing.price?.currency ? `${listing.price.amount} ${listing.price.currency}` : 'Request price')
             }
           </span>
         </div>
       </div>
       </article>
     </div>
   )
 }

// Memoized export to prevent unnecessary re-renders
// Only re-renders when listing.id, isActive, or priority changes
export const ListingCard = memo(ListingCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.listing.id === nextProps.listing.id &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.priority === nextProps.priority
  )
})
