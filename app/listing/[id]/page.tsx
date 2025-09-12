"use client"

import { notFound } from "next/navigation"
import { useEffect, useState, use } from "react"
import { useProjects } from "@/hooks/use-projects"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  MapPin,
  Star,
  Building,
  Home,
  Calendar,
  Users,
  Phone,
  Mail,
  ArrowLeft,
  Heart,
  Share2,
  CheckCircle,
  Wifi,
  Car,
  Dumbbell,
  Trees,
  Shield,
  Zap,
  Globe,
  Euro,
  Ruler,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react"
import { recordProjectView, recordProjectPhoneClick, recordProjectWebsiteClick } from "@/lib/api"
import Image from "next/image"
import { PropertyGallery } from "@/components/PropertyGallery"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

// Helper function to get high-quality ImageKit URLs
const getImageKitUrl = (originalUrl: string, width: number, height: number, quality: number = 85) => {
  if (!originalUrl || !originalUrl.includes('imagekit.io')) {
    return originalUrl
  }
  
  // Extract the base path from the original URL
  const urlParts = originalUrl.split('/')
  const imageName = urlParts[urlParts.length - 1]
  
  // Create high-quality transformation URL
  return `https://ik.imagekit.io/ts59gf2ul/tr:h-${height},w-${width},c-maintain_ratio,cm-focus,fo-auto,q-${quality},f-auto,pr-true,enhancement-true/${imageName}`
}

export default function ListingPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const propertyId = resolvedParams.id
  const [hasTrackedView, setHasTrackedView] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })
  
  // Use real API data instead of mock data
  const { projects, loading, error } = useProjects({ per_page: 100 })

  // Track project view
  useEffect(() => {
    const property = projects?.find(p => p.id === propertyId)
    if (property && !hasTrackedView) {
      const trackView = async () => {
        try {
          await recordProjectView(property.id)
          setHasTrackedView(true)
        } catch (error) {
          console.warn('Analytics tracking failed:', error)
          setHasTrackedView(true)
        }
      }
      trackView()
    }
  }, [projects, propertyId, hasTrackedView])
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--brand-glass-light)'}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{borderColor: 'var(--brand-primary)'}}></div>
          <p style={{color: 'var(--brand-text-secondary)'}}>Loading property details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--brand-glass-light)'}}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{color: 'var(--brand-error)'}}>Error Loading Property</h1>
          <p style={{color: 'var(--brand-text-secondary)'}}>Unable to load property details. Please try again later.</p>
        </div>
      </div>
    )
  }

  const property = projects?.find(p => p.id === propertyId)

  if (!property) {
    notFound()
  }

  const amenityIcons: Record<string, any> = {
    "Fitness Center": Dumbbell,
    "Rooftop Terrace": Trees,
    "24/7 Concierge": Users,
    "Underground Parking": Car,
    "High-Speed Internet": Wifi,
    "Security System": Shield,
    "Smart Home System": Zap,
    "Private Beach Access": Trees,
    "Infinity Pool": Trees,
    "Spa & Wellness Center": Shield,
    "Full-Service Spa": Shield,
    "Rooftop Infinity Pool": Trees,
    "Valet Parking": Car,
    "Private Wine Cellar": Shield,
    "Solar Panel System": Zap,
    "Electric Car Charging": Car,
    "Modern Amenities": CheckCircle,
    "Parking": Car,
    "Quality Finishes": CheckCircle,
    "Great Location": MapPin,
    "Investment Potential": Euro,
  }

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    alert("Thank you for your inquiry! We'll contact you soon.")
    setShowContactForm(false)
    setFormData({ name: "", email: "", phone: "", message: "" })
  }


  const handlePhoneClick = async () => {
      try {
        await recordProjectPhoneClick(property.id)
      } catch (error) {
        console.warn('Analytics tracking failed:', error)
    }
  }

  const handleWebsiteClick = async () => {
      try {
        await recordProjectWebsiteClick(property.id)
      } catch (error) {
        console.warn('Analytics tracking failed:', error)
    }
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--brand-glass-light)'}}>

      <div className="container px-4 py-8">
        <div className="max-w-7xl mx-auto">

          {/* Property Gallery */}
          <div className="mb-8">
            <PropertyGallery 
              images={property.images || (property.image ? [property.image] : [])}
              title={property.title || property.name || 'Property'}
            />
          </div>

          {/* Property Header - After Images */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{color: 'var(--brand-text-primary)'}}>
                  {property.title || property.name}
                </h1>
                <div className="flex items-center space-x-6 mb-4" style={{color: 'var(--brand-text-secondary)'}}>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" style={{color: 'var(--brand-accent)'}} />
                    <span className="text-lg">{property.location || property.formatted_address || `${property.neighborhood}, ${property.city}`}</span>
                  </div>
                  <div className="flex items-center">
                    {property.type === "Residential Houses" ? (
                      <Home className="h-5 w-5 mr-2" style={{color: 'var(--brand-primary)'}} />
                    ) : (
                      <Building className="h-5 w-5 mr-2" style={{color: 'var(--brand-primary)'}} />
                    )}
                    <span className="text-lg">{property.type}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-baseline space-x-2 mb-2">
                  <span className="text-4xl md:text-5xl font-bold" style={{color: 'var(--brand-primary)'}}>
                    {property.priceRange || property.shortPrice || 'Request Price'}
                  </span>
                </div>
                <p className="text-lg" style={{color: 'var(--brand-text-secondary)'}}>Starting price</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <Card style={{backgroundColor: 'var(--brand-glass)', borderColor: 'var(--brand-border)'}}>
                <CardHeader>
                  <CardTitle className="flex items-center" style={{color: 'var(--brand-text-primary)'}}>
                    {property.type === "Residential Houses" ? (
                      <Home className="h-5 w-5 mr-2" style={{color: 'var(--brand-primary)'}} />
                    ) : (
                      <Building className="h-5 w-5 mr-2" style={{color: 'var(--brand-primary)'}} />
                    )}
                    About This Property
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed mb-6" style={{color: 'var(--brand-text-secondary)'}}>
                    {property.description || property.longDescription || 'No description available.'}
                  </p>

                  {/* Key Features */}
                  {property.features && property.features.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3" style={{color: 'var(--brand-text-primary)'}}>Key Features</h4>
                      <div className="flex flex-wrap gap-2">
                        {property.features.map((feature: string, index: number) => (
                          <Badge key={index} variant="outline" style={{borderColor: 'var(--brand-accent)', color: 'var(--brand-accent)'}}>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Highlights */}
                  {property.highlights && property.highlights.length > 0 && (
            <div>
                      <h4 className="font-semibold mb-3" style={{color: 'var(--brand-text-primary)'}}>Property Highlights</h4>
                      <ul className="space-y-2">
                        {property.highlights.map((highlight: string, index: number) => (
                          <li key={index} className="flex items-center" style={{color: 'var(--brand-text-secondary)'}}>
                            <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" style={{color: 'var(--brand-accent)'}} />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Location Map */}
              <Card style={{backgroundColor: 'var(--brand-glass)', borderColor: 'var(--brand-border)'}}>
                <CardHeader>
                  <CardTitle className="flex items-center" style={{color: 'var(--brand-text-primary)'}}>
                    <MapPin className="h-5 w-5 mr-2" style={{color: 'var(--brand-primary)'}} />
                    Location & Map
                  </CardTitle>
                </CardHeader>
                <CardContent>
              <div className="space-y-4">
                    {/* Address Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2" style={{color: 'var(--brand-text-primary)'}}>Property Location</h4>
                        <div className="space-y-2" style={{color: 'var(--brand-text-secondary)'}}>
                          <p>{property.location || property.formatted_address || 'Location not specified'}</p>
                          {property.city && <p>City: {property.city}</p>}
                          {property.neighborhood && <p>Neighborhood: {property.neighborhood}</p>}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2" style={{color: 'var(--brand-text-primary)'}}>Developer Office</h4>
                        <div className="space-y-2" style={{color: 'var(--brand-text-secondary)'}}>
                          <p>{property.developer || 'Unknown Developer'}</p>
                          <p>Contact for office location</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Interactive Google Maps */}
                    {property.lat && property.lng ? (
                      <div className="w-full h-80 rounded-lg overflow-hidden border" style={{borderColor: 'var(--brand-border)'}}>
                        <iframe
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                          src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${property.lat},${property.lng}&zoom=16&maptype=roadmap`}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-80 rounded-lg overflow-hidden flex items-center justify-center" style={{backgroundColor: 'var(--brand-glass-light)'}}>
                        <div className="text-center">
                          <MapPin className="h-12 w-12 mx-auto mb-2" style={{color: 'var(--brand-accent)'}} />
                          <p className="text-sm" style={{color: 'var(--brand-text-secondary)'}}>
                            Map coordinates not available
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Map Instructions */}
                    <div className="text-center pt-2">
                      <p className="text-xs" style={{color: 'var(--brand-text-secondary)'}}>
                        💡 Click and drag to pan around, use the + and - buttons to zoom in/out
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Specifications */}
              <Card style={{backgroundColor: 'var(--brand-glass)', borderColor: 'var(--brand-border)'}}>
                <CardHeader>
                  <CardTitle className="flex items-center" style={{color: 'var(--brand-text-primary)'}}>
                    <Ruler className="h-5 w-5 mr-2" style={{color: 'var(--brand-primary)'}} />
                    Property Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-lg" style={{backgroundColor: 'var(--brand-glass-light)'}}>
                      <div className="text-2xl font-bold mb-1" style={{color: 'var(--brand-primary)'}}>
                        {property.specifications?.totalUnits || 'N/A'}
                      </div>
                      <div className="text-sm" style={{color: 'var(--brand-text-secondary)'}}>Total Units</div>
                    </div>
                    <div className="text-center p-4 rounded-lg" style={{backgroundColor: 'var(--brand-glass-light)'}}>
                      <div className="text-2xl font-bold mb-1" style={{color: 'var(--brand-primary)'}}>
                        {property.specifications?.floors || 'N/A'}
                      </div>
                      <div className="text-sm" style={{color: 'var(--brand-text-secondary)'}}>Floors</div>
                    </div>
                    <div className="text-center p-4 rounded-lg" style={{backgroundColor: 'var(--brand-glass-light)'}}>
                      <div className="text-2xl font-bold mb-1" style={{color: 'var(--brand-primary)'}}>
                        {property.specifications?.parkingSpaces || 'N/A'}
                      </div>
                      <div className="text-sm" style={{color: 'var(--brand-text-secondary)'}}>Parking Spaces</div>
                    </div>
                    <div className="text-center p-4 rounded-lg" style={{backgroundColor: 'var(--brand-glass-light)'}}>
                      <div className="text-lg font-bold mb-1" style={{color: 'var(--brand-primary)'}}>
                        {property.specifications?.unitSizes || 'N/A'}
                      </div>
                      <div className="text-sm" style={{color: 'var(--brand-text-secondary)'}}>Unit Sizes</div>
                    </div>
                    <div className="text-center p-4 rounded-lg" style={{backgroundColor: 'var(--brand-glass-light)'}}>
                      <div className="text-lg font-bold mb-1" style={{color: 'var(--brand-primary)'}}>
                        {property.specifications?.bedrooms || 'N/A'}
                      </div>
                      <div className="text-sm" style={{color: 'var(--brand-text-secondary)'}}>Bedrooms</div>
                    </div>
                    <div className="text-center p-4 rounded-lg" style={{backgroundColor: 'var(--brand-glass-light)'}}>
                      <div className="text-lg font-bold mb-1" style={{color: 'var(--brand-primary)'}}>
                        {property.specifications?.bathrooms || 'N/A'}
                      </div>
                      <div className="text-sm" style={{color: 'var(--brand-text-secondary)'}}>Bathrooms</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <Card style={{backgroundColor: 'var(--brand-glass)', borderColor: 'var(--brand-border)'}}>
                  <CardHeader>
                    <CardTitle className="flex items-center" style={{color: 'var(--brand-text-primary)'}}>
                      <Zap className="h-5 w-5 mr-2" style={{color: 'var(--brand-primary)'}} />
                      Amenities & Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {property.amenities.map((amenity: string, index: number) => {
                        const IconComponent = amenityIcons[amenity] || CheckCircle
                        return (
                          <div key={index} className="flex items-center space-x-3 p-3 rounded-lg" style={{backgroundColor: 'var(--brand-glass-light)'}}>
                            <IconComponent className="h-5 w-5 flex-shrink-0" style={{color: 'var(--brand-accent)'}} />
                            <span className="font-medium" style={{color: 'var(--brand-text-primary)'}}>{amenity}</span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Nearby Attractions */}
              {property.nearbyAttractions && property.nearbyAttractions.length > 0 && (
                <Card style={{backgroundColor: 'var(--brand-glass)', borderColor: 'var(--brand-border)'}}>
                  <CardHeader>
                    <CardTitle className="flex items-center" style={{color: 'var(--brand-text-primary)'}}>
                      <MapPin className="h-5 w-5 mr-2" style={{color: 'var(--brand-primary)'}} />
                      Nearby Attractions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {property.nearbyAttractions.map((attraction: string, index: number) => (
                        <div key={index} className="flex items-center" style={{color: 'var(--brand-text-secondary)'}}>
                          <MapPin className="h-4 w-4 mr-3 flex-shrink-0" style={{color: 'var(--brand-accent)'}} />
                          {attraction}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Developer */}
              <Card style={{backgroundColor: 'var(--brand-glass)', borderColor: 'var(--brand-border)'}}>
                <CardHeader>
                  <CardTitle style={{color: 'var(--brand-text-primary)'}}>Contact Developer</CardTitle>
                  <p className="text-sm" style={{color: 'var(--brand-text-secondary)'}}>{property.developer || 'Unknown Developer'}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    className="w-full text-white"
                          onClick={handlePhoneClick}
                    style={{backgroundColor: 'var(--brand-primary)'}}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Developer
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full bg-transparent" 
                    onClick={() => setShowContactForm(true)}
                    style={{borderColor: 'var(--brand-border)', color: 'var(--brand-text-primary)'}}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Message
                      </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                          onClick={handleWebsiteClick}
                    style={{borderColor: 'var(--brand-border)', color: 'var(--brand-text-primary)'}}
                        >
                    <Globe className="h-4 w-4 mr-2" />
                          Visit Website
                      </Button>
                </CardContent>
              </Card>

              {/* Project Timeline */}
              <Card style={{backgroundColor: 'var(--brand-glass)', borderColor: 'var(--brand-border)'}}>
                <CardHeader>
                  <CardTitle className="flex items-center" style={{color: 'var(--brand-text-primary)'}}>
                    <Calendar className="h-5 w-5 mr-2" style={{color: 'var(--brand-primary)'}} />
                    Project Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium" style={{color: 'var(--brand-text-primary)'}}>Current Status</span>
                      <span className="text-sm font-medium" style={{color: 'var(--brand-text-secondary)'}}>{property.status}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium" style={{color: 'var(--brand-text-primary)'}}>Expected Completion</span>
                      <span className="text-sm" style={{color: 'var(--brand-text-secondary)'}}>{property.completionDate || 'TBD'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium" style={{color: 'var(--brand-text-primary)'}}>Building Type</span>
                      <span className="text-sm" style={{color: 'var(--brand-text-secondary)'}}>{property.type}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Price Information */}
              <Card style={{backgroundColor: 'var(--brand-glass)', borderColor: 'var(--brand-border)'}}>
                <CardHeader>
                  <CardTitle className="flex items-center" style={{color: 'var(--brand-text-primary)'}}>
                    <Euro className="h-5 w-5 mr-2" style={{color: 'var(--brand-primary)'}} />
                    Price Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium" style={{color: 'var(--brand-text-primary)'}}>Price Range</span>
                      <span className="text-sm font-bold" style={{color: 'var(--brand-primary)'}}>{property.priceRange || 'Request Price'}</span>
                    </div>
                    <div className="text-xs pt-2 border-t" style={{color: 'var(--brand-text-secondary)', borderColor: 'var(--brand-border)'}}>
                      Prices may vary based on unit size, floor, and view. Contact developer for detailed pricing and available units.
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card style={{backgroundColor: 'var(--brand-glass)', borderColor: 'var(--brand-border)'}}>
                <CardHeader>
                  <CardTitle style={{color: 'var(--brand-text-primary)'}}>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold" style={{color: 'var(--brand-primary)'}}>{property.specifications?.totalUnits || 'N/A'}</div>
                      <div className="text-xs" style={{color: 'var(--brand-text-secondary)'}}>Total Units</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold" style={{color: 'var(--brand-primary)'}}>{property.specifications?.floors || 'N/A'}</div>
                      <div className="text-xs" style={{color: 'var(--brand-text-secondary)'}}>Floors</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
                  </div>
              </div>
            </div>
          </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto" style={{backgroundColor: 'var(--brand-glass)'}}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold" style={{color: 'var(--brand-text-primary)'}}>Contact Developer</h3>
                <button
                  onClick={() => setShowContactForm(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-opacity-10 transition-colors"
                  style={{backgroundColor: 'var(--brand-glass-light)'}}
                >
                  <X className="h-4 w-4" style={{color: 'var(--brand-text-primary)'}} />
                </button>
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1" style={{color: 'var(--brand-text-primary)'}}>
                    Full Name *
                  </label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your full name"
                    className="w-full"
                    style={{backgroundColor: 'var(--brand-glass-light)', borderColor: 'var(--brand-border)', color: 'var(--brand-text-primary)'}}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1" style={{color: 'var(--brand-text-primary)'}}>
                    Email Address *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full"
                    style={{backgroundColor: 'var(--brand-glass-light)', borderColor: 'var(--brand-border)', color: 'var(--brand-text-primary)'}}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-1" style={{color: 'var(--brand-text-primary)'}}>
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+359 ..."
                    className="w-full"
                    style={{backgroundColor: 'var(--brand-glass-light)', borderColor: 'var(--brand-border)', color: 'var(--brand-text-primary)'}}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1" style={{color: 'var(--brand-text-primary)'}}>
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={`I'm interested in ${property.title || property.name}. Please provide more information about available units and pricing.`}
                    rows={4}
                    className="w-full"
                    style={{backgroundColor: 'var(--brand-glass-light)', borderColor: 'var(--brand-border)', color: 'var(--brand-text-primary)'}}
                    />
                  </div>

                <div className="flex space-x-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowContactForm(false)} 
                    className="flex-1"
                    style={{borderColor: 'var(--brand-border)', color: 'var(--brand-text-primary)'}}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 text-white"
                    style={{backgroundColor: 'var(--brand-primary)'}}
                  >
                    Send Message
                  </Button>
                </div>
              </form>
            </div>
              </div>
            </div>
          )}
    </div>
  )
}
