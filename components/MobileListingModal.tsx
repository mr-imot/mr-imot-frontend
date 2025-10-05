"use client"

import { useEffect, useRef, useState } from "react"
import { X, ArrowLeft, Heart, Share2, MapPin, Star, Building, Home, Phone, Globe, Euro, Ruler, Navigation } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PropertyGallery } from "@/components/PropertyGallery"
import { FeaturesDisplay } from "@/components/FeaturesDisplay"
import { ensureGoogleMaps } from "@/lib/google-maps"
import { useTranslations } from "@/lib/locale-context"
import { translatePrice, PriceTranslations } from "@/lib/price-translator"
import { recordProjectView, recordProjectPhoneClick, recordProjectWebsiteClick } from "@/lib/api"

interface Property {
  id: string
  title: string
  description?: string
  location?: string
  coordinates?: { lat: number; lng: number }
  price?: { amount: number; currency: string } | null
  price_label?: string | null
  price_per_m2?: string | null
  area?: number
  rooms?: number
  bathrooms?: number
  floor?: number
  total_floors?: number
  year_built?: number
  status?: string
  property_type?: string
  images?: string[]
  features?: Array<{
    id: string
    name: string
    display_name: string
    category: string
  }>
  developer?: {
    id: string
    name: string
    logo?: string
    phone?: string
    website?: string
    email?: string
  }
  created_at?: string
  updated_at?: string
}

interface MobileListingModalProps {
  property: Property | null
  isOpen: boolean
  onClose: () => void
  priceTranslations?: PriceTranslations
  lang: 'en' | 'bg'
}

export function MobileListingModal({ 
  property, 
  isOpen, 
  onClose, 
  priceTranslations,
  lang 
}: MobileListingModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const scrollPositionRef = useRef<number>(0)
  
  const t = useTranslations()
  const tPrice = useTranslations('price')

  // Track view when modal opens
  useEffect(() => {
    if (isOpen && property) {
      recordProjectView(property.id)
    }
  }, [isOpen, property])

  // Handle modal open/close animations
  useEffect(() => {
    if (isOpen) {
      // Store current scroll position
      scrollPositionRef.current = window.scrollY
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollPositionRef.current}px`
      document.body.style.width = '100%'
      
      // Start animation
      setIsVisible(true)
      setTimeout(() => setIsAnimating(true), 10)
    } else {
      // Start close animation
      setIsAnimating(false)
      setTimeout(() => {
        setIsVisible(false)
        // Restore body scroll
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        // Restore scroll position
        window.scrollTo(0, scrollPositionRef.current)
      }, 300)
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isVisible || !property) return null

  const formatPrice = () => {
    if (property.price?.amount && property.price?.currency) {
      return `${property.price.amount} ${property.price.currency}`
    }
    return translatePrice(property.price_label || property.price_per_m2, tPrice)
  }

  const handlePhoneClick = () => {
    if (property.developer?.phone) {
      recordProjectPhoneClick(property.id)
      window.open(`tel:${property.developer.phone}`)
    }
  }

  const handleWebsiteClick = () => {
    if (property.developer?.website) {
      recordProjectWebsiteClick(property.id)
      window.open(property.developer.website, '_blank')
    }
  }

  return (
    <div
      ref={modalRef}
      className={`fixed inset-0 z-[100] bg-white transition-transform duration-300 ease-out ${
        isAnimating ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={onClose}
          className="flex items-center justify-center w-11 h-11 hover:bg-gray-100 active:bg-gray-200 rounded-full transition-colors touch-manipulation"
          aria-label="Back"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        
        <div className="flex items-center gap-1">
          <button 
            className="flex items-center justify-center w-11 h-11 hover:bg-gray-100 active:bg-gray-200 rounded-full transition-colors touch-manipulation"
            aria-label="Save to favorites"
          >
            <Heart className="w-5 h-5 text-gray-700" />
          </button>
          <button 
            className="flex items-center justify-center w-11 h-11 hover:bg-gray-100 active:bg-gray-200 rounded-full transition-colors touch-manipulation"
            aria-label="Share"
          >
            <Share2 className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Image Gallery */}
        <div className="relative h-[55vh] min-h-[320px] bg-gray-100">
          {property.images && property.images.length > 0 ? (
            <PropertyGallery 
              images={property.images}
              propertyId={property.id}
              showThumbnails={false}
              isMobile={true}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-center">
                <Building className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">No images available</p>
              </div>
            </div>
          )}
        </div>

        {/* Property Details */}
        <div className="px-5 py-6 space-y-7">
          {/* Title and Location */}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              {property.title}
            </h1>
            {property.location && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="text-base">{property.location}</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-5">
            <div className="space-y-1">
              <div className="text-3xl font-bold text-gray-900">
                {formatPrice()}
              </div>
              {property.price_per_m2 && (
                <div className="text-sm text-gray-600 font-medium">
                  {property.price_per_m2}
                </div>
              )}
            </div>
            <Badge variant="secondary" className="text-sm font-semibold px-3 py-1.5">
              {property.status || 'Available'}
            </Badge>
          </div>

          {/* Property Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            {property.area && (
              <div className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Ruler className="w-5 h-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">{t.listingDetail?.area || 'Area'}</div>
                  <div className="font-bold text-gray-900 text-lg">{property.area} m²</div>
                </div>
              </div>
            )}
            
            {property.rooms && (
              <div className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">{t.listingDetail?.rooms || 'Rooms'}</div>
                  <div className="font-bold text-gray-900 text-lg">{property.rooms}</div>
                </div>
              </div>
            )}
            
            {property.bathrooms && (
              <div className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">{t.listingDetail?.bathrooms || 'Bathrooms'}</div>
                  <div className="font-bold text-gray-900 text-lg">{property.bathrooms}</div>
                </div>
              </div>
            )}
            
            {property.floor && (
              <div className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-orange-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">{t.listingDetail?.floor || 'Floor'}</div>
                  <div className="font-bold text-gray-900 text-lg">
                    {property.floor}{property.total_floors ? `/${property.total_floors}` : ''}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {property.description && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">
                {t.listingDetail?.description || 'Description'}
              </h3>
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="text-gray-700 leading-relaxed text-base">
                  {property.description}
                </p>
              </div>
            </div>
          )}

          {/* Features */}
          {property.features && property.features.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">
                {t.listingDetail?.features || 'Features'}
              </h3>
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <FeaturesDisplay 
                  features={property.features}
                  maxFeatures={20}
                  showAll={true}
                />
              </div>
            </div>
          )}

          {/* Developer Info */}
          {property.developer && (
            <div className="space-y-5">
              <h3 className="text-xl font-bold text-gray-900">
                {t.listingDetail?.developer || 'Developer'}
              </h3>
              <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
                <div className="flex items-start gap-4">
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={property.developer.logo} alt={property.developer.name} />
                    <AvatarFallback className="bg-gray-100 text-gray-600 font-semibold text-lg">
                      {property.developer.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 text-lg">{property.developer.name}</h4>
                    {property.developer.email && (
                      <p className="text-sm text-gray-600 mt-1">{property.developer.email}</p>
                    )}
                  </div>
                </div>
                
                {/* Contact Buttons */}
                <div className="flex gap-3">
                  {property.developer.phone && (
                    <Button 
                      onClick={handlePhoneClick}
                      className="flex-1 bg-green-600 hover:bg-green-700 active:bg-green-800 h-12 text-base font-semibold rounded-xl"
                    >
                      <Phone className="w-5 h-5 mr-2" />
                      {t.listingDetail?.call || 'Call'}
                    </Button>
                  )}
                  {property.developer.website && (
                    <Button 
                      onClick={handleWebsiteClick}
                      variant="outline"
                      className="flex-1 h-12 text-base font-semibold rounded-xl border-2"
                    >
                      <Globe className="w-5 h-5 mr-2" />
                      {t.listingDetail?.website || 'Website'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Bottom padding for safe scrolling */}
        <div className="h-6" />
      </div>
    </div>
  )
}
