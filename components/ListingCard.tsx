import { useState } from 'react'
import Image from 'next/image'
import { Star, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export interface Listing {
  id: number
  title: string
  city: string
  coordinates: { lat: number; lng: number }
  price: { amount: number; currency: string } | null
  rating: number
  reviewCount: number
  status: string
  images: string[]
}

interface ListingCardProps {
  listing: Listing
  isActive?: boolean
  onCardClick?: (listing: Listing) => void
  onCardHover?: (listingId: number | null) => void
}

// Format price using Intl.NumberFormat
function formatPrice(price: { amount: number; currency: string } | null) {
  if (!price) return null
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price.amount)
  } catch {
    return `${price.currency}${price.amount}`
  }
}

export function ListingCard({ listing, isActive, onCardClick, onCardHover }: ListingCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const hasMultipleImages = listing.images?.length > 1

  const handleClick = () => {
    onCardClick?.(listing)
  }

  const handleMouseEnter = () => {
    onCardHover?.(listing.id)
  }

  const handleMouseLeave = () => {
    onCardHover?.(null)
  }

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev + 1) % listing.images.length)
  }

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length)
  }

  const goToImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex(index)
  }

  return (
    <article
      data-id={listing.id}
      className={cn(
        "group cursor-pointer bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 ease-out overflow-hidden",
        isActive && "ring-2 ring-brand shadow-lg"
      )}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image Container - 60-65% of card height like Airbnb */}
      <div className="relative overflow-hidden">
        <div className="aspect-[4/3] w-full">
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
              aria-label="Previous image"
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 grid place-items-center h-8 w-8 rounded-full bg-white/95 hover:bg-white shadow-md text-[#222222] font-bold text-base opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
            >
              ‹
            </button>
            <button
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
        {/* Project name - Balanced typography */}
        <h3 className="text-sm font-semibold text-[#222222] leading-tight mb-1 line-clamp-2">
          {listing.title}
        </h3>
        
        {/* City - Balanced secondary text */}
        <p className="text-xs text-[#717171] leading-tight mb-1 flex items-center gap-1.5">
          <span className="w-1 h-1 bg-brand rounded-full"></span>
          {listing.city}
        </p>
        
        {/* Price - Balanced styling */}
        <div className="text-sm text-[#222222] leading-tight">
          {listing.price ? (
            <span className="font-bold text-base">{formatPrice(listing.price)}</span>
          ) : (
            <span className="font-bold text-base text-brand">Request price</span>
          )}
        </div>
      </div>
    </article>
  )
}
