'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { X, Phone, Globe } from 'lucide-react'
import { cn, getListingUrl } from '@/lib/utils'
import { trackProjectView } from '@/lib/analytics-batch'
import { recordProjectPhoneClick, recordProjectWebsiteClick } from '@/lib/api'
import { translatePrice, PriceTranslations } from '@/lib/price-translator'
import { useRouter, usePathname } from 'next/navigation'
import { useEmblaCarouselWithPhysics } from '@/hooks/use-embla-carousel'

interface PropertyData {
  id: string | number
  slug?: string
  title: string
  location: string
  image?: string | null
  images?: string[]
  price?: string | number | null
  priceLabel?: string
  type?: 'house' | 'apartment'
  developer?: {
    company_name?: string
    phone?: string
    website?: string
  }
}

interface PropertyMapCardProps {
  property: PropertyData | null
  onClose: () => void
  className?: string
  position?: {
    top?: number
    left?: number
    right?: number
    bottom?: number
  }
  floating?: boolean
  forceMobile?: boolean
  priceTranslations?: PriceTranslations
}

export function PropertyMapCard({ 
  property, 
  onClose, 
  className,
  position,
  floating = false,
  forceMobile = false,
  priceTranslations
}: PropertyMapCardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isClosing, setIsClosing] = useState(false)
  const [hasTrackedView, setHasTrackedView] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const touchStartY = useRef<number | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const scrollPositionRef = useRef<number>(0)
  
  if (!property) return null
  
  // Detect locale from pathname
  const lang = pathname.startsWith('/bg/') ? 'bg' : 'en'
  const propertyUrl = getListingUrl(property, lang)
  const imageUrls = (property.images && property.images.length > 0)
    ? property.images
    : (property.image ? [property.image] : [])
  
  const hasMultipleImages = imageUrls.length > 1
  
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

  const positionStyles = !floating && position ? {
    top: position.top,
    left: position.left,
    right: position.right,
    bottom: position.bottom,
  } : {}

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 180)
  }

  // Track view when map card opens (using batched analytics)
  useEffect(() => {
    if (!hasTrackedView && property) {
      trackProjectView(String(property.id))
      setHasTrackedView(true)
    }
  }, [property, hasTrackedView])

  // Prevent body scroll when card is open on mobile (like modal)
  useEffect(() => {
    if (forceMobile && floating && property) {
      // Store current scroll position
      scrollPositionRef.current = window.scrollY
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollPositionRef.current}px`
      document.body.style.width = '100%'
      document.body.style.touchAction = 'none' // Prevent all touch gestures on body
      
      return () => {
        // Restore body scroll
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.body.style.touchAction = ''
        // Restore scroll position
        window.scrollTo(0, scrollPositionRef.current)
      }
    }
  }, [forceMobile, floating, property])

  const handlePhoneClick = async () => {
    if (property?.developer?.phone) {
      try {
        await recordProjectPhoneClick(String(property.id))
      } catch (error) {
        console.warn('Analytics tracking failed:', error)
      }
    }
  }

  const handleWebsiteClick = async () => {
    if (property?.developer?.website) {
      try {
        await recordProjectWebsiteClick(String(property.id))
      } catch (error) {
        console.warn('Analytics tracking failed:', error)
      }
    }
  }

  const formatPrice = () => {
    if (priceTranslations) {
      return translatePrice(property.priceLabel, priceTranslations)
    }
    
    // Fallback to original logic if no translations provided
    if (property.priceLabel) {
      const isRequest = /request/i.test(property.priceLabel)
      if (isRequest) return 'Request price'
      return property.priceLabel
    }
    if (property.price && property.price !== 'Request price') {
      return typeof property.price === 'string' ? property.price : `${property.price.toLocaleString()} BGN`
    }
    return 'Request price'
  }

  // Handle touch events for drag prevention (Airbnb-style bounce-back)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!forceMobile || !floating) return
    
    const cardElement = cardRef.current
    if (!cardElement) return
    
    const touchY = e.touches[0].clientY
    const cardRect = cardElement.getBoundingClientRect()
    const touchRelativeY = touchY - cardRect.top
    
    // Only enable drag if touch is in the top 100px of the card (image area)
    if (touchRelativeY < 100) {
      touchStartY.current = touchY
      setIsDragging(true)
      e.preventDefault() // Prevent default scroll behavior
      e.stopPropagation()
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!forceMobile || !floating || touchStartY.current === null || !isDragging) return
    
    const currentY = e.touches[0].clientY
    const deltaY = currentY - touchStartY.current
    
    // Only allow upward drag (negative deltaY means dragging up)
    if (deltaY < 0) {
      // Limit the drag distance and apply resistance
      const maxDrag = 30 // Maximum pixels to allow dragging up
      const resistance = 0.3 // Resistance factor for smooth feel
      const dragAmount = Math.max(deltaY * resistance, -maxDrag)
      setDragOffset(dragAmount)
      e.preventDefault() // Prevent page scroll
      e.stopPropagation()
    } else {
      // Don't allow dragging down - reset immediately
      setDragOffset(0)
    }
  }

  const handleTouchEnd = () => {
    if (!forceMobile || !floating) return
    
    // Bounce back animation
    if (dragOffset < 0) {
      // Animate back to original position with spring effect
      setDragOffset(0)
    }
    
    touchStartY.current = null
    setIsDragging(false)
  }

  const WrapperTag = floating ? 'div' : 'div'

  return (
    <WrapperTag
      className={cn(
        // Use fixed positioning for floating cards on mobile, relative for desktop floating, fixed for positioned cards
        forceMobile && floating 
          ? 'fixed z-50 bottom-4 left-1/2' 
          : floating 
            ? 'relative' 
            : 'fixed z-50',
        'pointer-events-auto cursor-pointer',
        isClosing && 'opacity-0 scale-95',
        className
      )}
      style={{
        ...(forceMobile && floating ? {} : positionStyles),
        transform: forceMobile && floating 
          ? `translate(-50%, ${dragOffset}px)` 
          : undefined,
        transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease-out',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={(e) => {
        // Stop propagation so clicking anywhere on the card doesn't trigger map click
        e.stopPropagation()
      }}
    >
      <div
        ref={cardRef}
        className={cn(
          "relative bg-white rounded-[20px] overflow-hidden cursor-pointer",
          // Mobile: floating card style (not full-width, centered) | Desktop: fixed width
          // Hide scrollbar on mobile
          forceMobile 
            ? "w-[calc(100vw-2rem)] max-w-[400px] h-auto max-h-[60vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden" 
            : "w-full h-[50vh] lg:w-[20.4375rem] lg:h-auto"
        )}
        style={{
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          WebkitOverflowScrolling: 'touch',
          touchAction: forceMobile && floating ? 'pan-y' : undefined, // Allow vertical scroll inside card only
        }}
        onClick={(e) => {
          // Stop propagation so clicking the card doesn't trigger map click (which would close it)
          e.stopPropagation()
          
          // Check if this is desktop (screen width >= 1024px) - matches ListingCard breakpoint
          const isDesktop = window.innerWidth >= 1024
          
          if (isDesktop) {
            // On desktop, open in new tab with full page (header, nav, footer)
            window.open(propertyUrl, '_blank', 'noopener,noreferrer')
          } else {
            // On mobile, use router.push (will be intercepted by modal)
            router.push(propertyUrl)
          }
        }}
      >
        {/* Close Button - Enhanced for mobile visibility */}
        <button
          aria-label="Close"
          onClick={(e) => { e.stopPropagation(); handleClose() }}
          className={cn(
            "absolute z-20 rounded-full flex items-center justify-center shadow-xl cursor-pointer transition-all duration-200",
            forceMobile
              ? "top-3 right-3 w-10 h-10 bg-black/80 hover:bg-black text-white ring-2 ring-white/30"
              : "top-2 right-2 w-7 h-7 bg-white/90 hover:bg-white text-[#222222] shadow-sm"
          )}
        >
          <X className={cn("cursor-pointer", forceMobile ? "h-5 w-5" : "h-4 w-4")} />
        </button>

        {/* Image Carousel */}
        <div className={cn(
          "relative w-full overflow-hidden",
          forceMobile 
            ? "h-[200px] sm:h-[240px]" 
            : "h-[60%] lg:w-[20.4375rem] lg:h-[13.25rem]"
        )}>
          <div className="embla h-full" ref={emblaRef}>
            <div className="embla__container flex h-full">
              {imageUrls.map((image, index) => (
                <div key={index} className="embla__slide flex-[0_0_100%] min-w-0 h-full">
                  <div className="relative w-full h-full overflow-hidden">
                    <Image
                      src={image}
                      alt={property.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 64em) 100vw, 20.4375rem"
                      priority={false}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots - Half size on mobile, original size on web */}
          {hasMultipleImages && (
            <div className={cn(
              "absolute bottom-3 left-1/2 -translate-x-1/2 flex z-10 rounded-full bg-black/40 backdrop-blur-sm",
              forceMobile 
                ? "gap-1.5 px-2 py-1 scale-50 origin-center" 
                : "gap-1.5 px-2 py-1"
            )}>
              {imageUrls.map((_, idx) => (
                <button
                  key={idx}
                  aria-label={`Go to image ${idx + 1}`}
                  onClick={(e) => { e.stopPropagation(); scrollTo(idx) }}
                  className={cn(
                    "transition-all duration-200 rounded-full",
                    idx === selectedIndex 
                      ? "w-1.5 h-1.5 bg-white" 
                      : "w-1 h-1 bg-white/60 hover:bg-white/80"
                  )}
                />
              ))}
            </div>
          )}

          {/* Arrows - Hidden on mobile, visible on desktop */}
          {hasMultipleImages && (
            <>
              <button
                aria-label="Previous image"
                onClick={(e) => { e.stopPropagation(); scrollPrev() }}
                disabled={!canScrollPrev}
                className="hidden md:grid absolute left-2 top-1/2 -translate-y-1/2 place-items-center h-8 w-8 rounded-full bg-white/95 hover:bg-white shadow-xl ring-2 ring-black/30 backdrop-blur-sm text-[#222222] z-10 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="cursor-pointer" width="12" height="12" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                aria-label="Next image"
                onClick={(e) => { e.stopPropagation(); scrollNext() }}
                disabled={!canScrollNext}
                className="hidden md:grid absolute right-2 top-1/2 -translate-y-1/2 place-items-center h-8 w-8 rounded-full bg-white/95 hover:bg-white shadow-xl ring-2 ring-black/30 backdrop-blur-sm text-[#222222] z-10 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="cursor-pointer" width="12" height="12" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </>
          )}
          <div className="absolute inset-0 rounded-t-[20px] pointer-events-none ring-1 ring-black/5" />
        </div>

        {/* Content */}
        <div className="px-4 py-4">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h3 
                id={`map_title_${String(property.id)}`}
                className="font-outfit text-[#222222] text-[16px] font-semibold leading-snug line-clamp-2 tracking-[-0.01em] hover:text-blue-600 transition-colors cursor-pointer"
              >
                {property.title}
              </h3>
              <p className="font-source-sans text-[#717171] text-[14px] font-normal leading-relaxed mt-1.5 truncate">
                {property.location}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="font-outfit text-[#222222] text-[15px] font-medium leading-tight tracking-[-0.005em]">
              {formatPrice()}
            </span>
          </div>

          {/* Contact Buttons */}
          {(property.developer?.phone || property.developer?.website) && (
            <div className="mt-4 flex gap-2">
              {property.developer?.phone && (
                <a
                  href={`tel:${property.developer.phone}`}
                  onClick={handlePhoneClick}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                >
                  <Phone className="h-4 w-4" />
                  Call
                </a>
              )}
              {property.developer?.website && (
                <a
                  href={property.developer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleWebsiteClick}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                >
                  <Globe className="h-4 w-4" />
                  Website
                </a>
              )}
            </div>
          )}

          {/* Developer name */}
          {property.developer?.company_name && (
            <div className="mt-3 text-xs text-gray-500">
              By {property.developer.company_name}
            </div>
          )}
        </div>
      </div>
    </WrapperTag>
  )
}

