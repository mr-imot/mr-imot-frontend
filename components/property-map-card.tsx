'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, Phone, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { recordProjectView, recordProjectPhoneClick, recordProjectWebsiteClick } from '@/lib/api'

interface PropertyData {
  id: string | number
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
}

export function PropertyMapCard({ 
  property, 
  onClose, 
  className,
  position,
  floating = false
}: PropertyMapCardProps) {
  const [isClosing, setIsClosing] = useState(false)
  const [hasTrackedView, setHasTrackedView] = useState(false)
  if (!property) return null
  const imageUrls = (property.images && property.images.length > 0)
    ? property.images
    : (property.image ? [property.image] : [])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

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

  // Track view when map card opens
  useEffect(() => {
    if (!hasTrackedView && property) {
      const trackView = async () => {
        try {
          await recordProjectView(String(property.id))
          setHasTrackedView(true)
        } catch (error) {
          // Fail silently to not break user experience
          console.warn('Analytics tracking failed:', error)
          setHasTrackedView(true) // Mark as tracked to avoid retry
        }
      }
      
      trackView()
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
        'pointer-events-auto transition-transform duration-200 ease-out',
        isClosing && 'opacity-0 scale-95',
        className
      )}
      style={positionStyles}
    >
      <div
        className="relative w-[327px] bg-white rounded-[20px] overflow-hidden hover:translate-y-[-2px]"
        style={{
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        }}
      >
        {/* Close Button */}
        <button
          aria-label="Close"
          onClick={handleClose}
          className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-[#222222] flex items-center justify-center shadow-sm"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Image Carousel */}
        <div className="relative w-[327px] h-[212px]">
          <Link 
            href={`/listing/${String(property.id)}`} 
            target={`listing_${String(property.id)}`}
            rel="noopener noreferrer nofollow"
            aria-labelledby={`map_title_${String(property.id)}`}
            className="block w-full h-full"
          >
            {imageUrls.length > 0 ? (
              <Image
                key={currentImageIndex}
                src={imageUrls[currentImageIndex]}
                alt={property.title}
                fill
                className="object-cover transition-transform duration-500 ease-out hover:scale-105"
                sizes="327px"
                priority={false}
              />
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}
          </Link>

          {/* Dots */}
          {imageUrls.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {imageUrls.map((_, idx) => (
                <button
                  key={idx}
                  aria-label={`Go to image ${idx + 1}`}
                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx) }}
                  className={idx === currentImageIndex ? 'text-white' : 'text-white/70 hover:text-white'}
                >
                  <svg width="6" height="6" viewBox="0 0 6 6" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="3" cy="3" r="3" fill="currentColor" />
                  </svg>
                </button>
              ))}
            </div>
          )}

          {/* Arrows */}
          {imageUrls.length > 1 && (
            <>
              <button
                aria-label="Previous image"
                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length) }}
                className="absolute left-2 top-1/2 -translate-y-1/2 grid place-items-center h-8 w-8 rounded-full bg-white/95 hover:bg-white shadow-md text-[#222222] z-10"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                aria-label="Next image"
                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length) }}
                className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center h-8 w-8 rounded-full bg-white/95 hover:bg-white shadow-md text-[#222222] z-10"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
              <Link 
                href={`/listing/${String(property.id)}`}
                target={`listing_${String(property.id)}`}
                rel="noopener noreferrer nofollow"
              >
                <h3 
                  id={`map_title_${String(property.id)}`}
                  className="font-outfit text-[#222222] text-[16px] font-semibold leading-snug line-clamp-2 tracking-[-0.01em] hover:text-blue-600 transition-colors cursor-pointer"
                >
                  {property.title}
                </h3>
              </Link>
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

