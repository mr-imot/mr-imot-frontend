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
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={onClose}
          className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-full transition-colors">
            <Heart className="w-5 h-5 text-gray-700" />
          </button>
          <button className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-full transition-colors">
            <Share2 className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Image Gallery */}
        <div className="relative h-[50vh] min-h-[300px]">
          {property.images && property.images.length > 0 ? (
            <PropertyGallery 
              images={property.images}
              propertyId={property.id}
              showThumbnails={false}
              isMobile={true}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <Building className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>

        {/* Property Details */}
        <div className="p-4 space-y-6">
          {/* Title and Location */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {property.title}
            </h1>
            {property.location && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{property.location}</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-gray-900">
                {formatPrice()}
              </div>
              {property.price_per_m2 && (
                <div className="text-sm text-gray-600">
                  {property.price_per_m2}
                </div>
              )}
            </div>
            <Badge variant="secondary" className="text-sm">
              {property.status || 'Available'}
            </Badge>
          </div>

          {/* Property Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            {property.area && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Ruler className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="text-sm text-gray-600">{t.listingDetail?.area || 'Area'}</div>
                  <div className="font-semibold">{property.area} m²</div>
                </div>
              </div>
            )}
            
            {property.rooms && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Home className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="text-sm text-gray-600">{t.listingDetail?.rooms || 'Rooms'}</div>
                  <div className="font-semibold">{property.rooms}</div>
                </div>
              </div>
            )}
            
            {property.bathrooms && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Building className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="text-sm text-gray-600">{t.listingDetail?.bathrooms || 'Bathrooms'}</div>
                  <div className="font-semibold">{property.bathrooms}</div>
                </div>
              </div>
            )}
            
            {property.floor && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Navigation className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="text-sm text-gray-600">{t.listingDetail?.floor || 'Floor'}</div>
                  <div className="font-semibold">
                    {property.floor}{property.total_floors ? `/${property.total_floors}` : ''}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {property.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {t.listingDetail?.description || 'Description'}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {property.description}
              </p>
            </div>
          )}

          {/* Features */}
          {property.features && property.features.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {t.listingDetail?.features || 'Features'}
              </h3>
              <FeaturesDisplay 
                features={property.features}
                maxFeatures={20}
                showAll={true}
              />
            </div>
          )}

          {/* Developer Info */}
          {property.developer && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t.listingDetail?.developer || 'Developer'}
              </h3>
              <div className="flex items-start gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={property.developer.logo} alt={property.developer.name} />
                  <AvatarFallback>
                    {property.developer.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{property.developer.name}</h4>
                  {property.developer.email && (
                    <p className="text-sm text-gray-600">{property.developer.email}</p>
                  )}
                </div>
              </div>
              
              {/* Contact Buttons */}
              <div className="flex gap-3 mt-4">
                {property.developer.phone && (
                  <Button 
                    onClick={handlePhoneClick}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    {t.listingDetail?.call || 'Call'}
                  </Button>
                )}
                {property.developer.website && (
                  <Button 
                    onClick={handleWebsiteClick}
                    variant="outline"
                    className="flex-1"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    {t.listingDetail?.website || 'Website'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
