'use client'

import React, { useState, useEffect } from 'react'
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

  const WrapperTag = floating ? 'div' : 'div'

  return (
    <WrapperTag
      className={cn(
        floating ? 'relative' : 'fixed z-50',
        'pointer-events-auto transition-transform duration-200 ease-out cursor-pointer',
        isClosing && 'opacity-0 scale-95',
        className
      )}
      style={positionStyles}
    >
      <div
        className={cn(
          "relative bg-white rounded-[20px] overflow-hidden cursor-pointer",
          // Mobile: full width, 1/2 screen height | Desktop: fixed width
          forceMobile 
            ? "w-full h-[50vh]" 
            : "w-full h-[50vh] lg:w-[20.4375rem] lg:h-auto"
        )}
        style={{
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        }}
        onClick={() => {
          // Check if this is desktop (screen width >= 768px)
          const isDesktop = window.innerWidth >= 768
          
          if (isDesktop) {
            // On desktop, open in new tab
            window.open(propertyUrl, '_blank')
          } else {
            // On mobile, use router.push (will be intercepted by modal)
            router.push(propertyUrl)
          }
        }}
      >
        {/* Close Button */}
        <button
          aria-label="Close"
          onClick={(e) => { e.stopPropagation(); handleClose() }}
          className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-[#222222] flex items-center justify-center shadow-sm cursor-pointer"
        >
          <X className="h-4 w-4 cursor-pointer" />
        </button>

        {/* Image Carousel */}
        <div className={cn(
          "relative w-full overflow-hidden",
          forceMobile 
            ? "h-[60%]" 
            : "h-[60%] lg:w-[20.4375rem] lg:h-[13.25rem]"
        )}>
          <div className="embla h-full" ref={emblaRef}>
            <div className="embla__container flex h-full">
              {imageUrls.map((image, index) => (
                <div key={index} className="embla__slide flex-[0_0_100%] min-w-0 h-full">
                  <div className="relative w-full h-full">
                    <Image
                      src={image}
                      alt={property.title}
                      fill
                      className="object-cover transition-transform duration-500 ease-out hover:scale-105 cursor-pointer"
                      sizes="(max-width: 64em) 100vw, 20.4375rem"
                      priority={false}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots */}
          {hasMultipleImages && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {imageUrls.map((_, idx) => (
                <button
                  key={idx}
                  aria-label={`Go to image ${idx + 1}`}
                  onClick={(e) => { e.stopPropagation(); scrollTo(idx) }}
                  className={idx === selectedIndex ? 'text-white' : 'text-white/70 hover:text-white'}
                >
                  <svg width="6" height="6" viewBox="0 0 6 6" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="3" cy="3" r="3" fill="currentColor" />
                  </svg>
                </button>
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

