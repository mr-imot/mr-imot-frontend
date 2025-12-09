"use client"

import { useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Building, Phone, Globe, Navigation } from "lucide-react"
import { ListingCard, Listing } from "@/components/ListingCard"
import { ensureGoogleMaps } from "@/lib/google-maps"
import { useTranslations } from "@/lib/locale-context"
import { DeveloperProfile } from "@/lib/api"

interface DeveloperDetailClientProps {
  developer: DeveloperProfile
}

// Office Map Component
const OfficeMap = ({ latitude, longitude, title }: { latitude: number, longitude: number, title: string }) => {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initMap = async () => {
      try {
        await ensureGoogleMaps()
        if (mapRef.current && window.google) {
          const map = new window.google.maps.Map(mapRef.current, {
            center: { lat: latitude, lng: longitude },
            zoom: 15,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            draggableCursor: "grab",
            draggingCursor: "grabbing",
            scrollwheel: true,
            gestureHandling: "greedy",
            mapId: 'e1ea25ce333a0b0deb34ff54', // Required for AdvancedMarkerElement
          })

          // Create marker pin element
          const pinElement = document.createElement('div')
          pinElement.innerHTML = '📍'
          pinElement.style.cursor = 'pointer'
          pinElement.style.fontSize = '24px'
          pinElement.style.textAlign = 'center'

          new window.google.maps.marker.AdvancedMarkerElement({
            position: { lat: latitude, lng: longitude },
            map,
            content: pinElement,
            title: title,
          })
        }
      } catch (error) {
        console.error('Failed to load Google Maps:', error)
      }
    }

    initMap()
  }, [latitude, longitude, title])

  return (
    <div className="mt-4 h-64 bg-gray-100 rounded-lg overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  )
}

// Adapter function to convert project data to Listing format
function projectToListing(project: any): Listing {
  return {
    id: project.id,
    slug: project.slug, // Include slug from API for SEO-friendly URLs
    title: project.name,
    city: project.city || project.neighborhood || 'Unknown',
    coordinates: { lat: project.latitude || 0, lng: project.longitude || 0 },
    price: null,
    priceLabel: project.price_label || 'Request price',
    description: project.description || null,
    rating: 0,
    reviewCount: 0,
    status: project.status || 'active',
    propertyType: project.project_type === 'house_complex' ? 'Residential Houses' : 'Apartment Complex',
    images: project.images?.map((img: any) => img.image_url) || ['/placeholder.jpg'],
  }
}

export default function DeveloperDetailClient({ developer }: DeveloperDetailClientProps) {
  const tDev = useTranslations('developersDetail') as any
  const tDevs = useTranslations('developers') as any
  const activeProjects = developer.projects_pagination?.total ?? developer.active_projects ?? developer.total_projects ?? developer.project_count ?? developer.projects?.length ?? 0

  const handleOfficeAddressClick = () => {
    const officeSection = document.getElementById('office-location-section')
    if (officeSection) {
      officeSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleGetDirections = (latitude: number, longitude: number) => {
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    window.open(directionsUrl, '_blank', 'noopener,noreferrer')
  }

  const handleWebsiteClick = (website: string) => {
    if (website && website.trim()) {
      let url = website.trim()
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`
      }
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const listings: Listing[] = developer.projects?.map(projectToListing) || []
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Developer Header */}
          <div className="mb-8">
            <div className="flex items-center gap-6 mb-4">
              {/* Profile Image */}
              <Avatar className="h-20 w-20">
                <AvatarImage src={developer.profile_image_url} alt={`${developer.company_name} profile`} className="object-cover" />
                <AvatarFallback className="text-2xl font-semibold bg-primary text-primary-foreground">
                  {developer.company_name?.charAt(0) || 'C'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground">{developer.company_name}</h1>
                {developer.is_verified && (
                  <Badge className="bg-green-500 text-white mt-2">
                    <Building className="w-3 h-3 mr-1" />
                    {tDevs?.verified ?? 'Verified'}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact Information */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    {tDev?.contactInformation ?? 'Contact Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">{tDev?.contactPerson ?? 'Contact Person'}</p>
                    <p className="text-base font-semibold text-foreground">{developer.contact_person}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">{tDev?.officeAddress ?? 'Office Address'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{developer.office_address}</p>
                    </div>
                  </div>
                  {developer.phone && (
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">{tDev?.phone ?? 'Phone'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground font-mono">{developer.phone}</p>
                      </div>
                    </div>
                  )}
                  {developer.website && (
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">{tDevs?.website ?? 'Website'}</p>
                      <div className="mt-1">
                        <Button variant="outline" size="sm" className="w-full text-xs cursor-pointer" onClick={() => handleWebsiteClick(developer.website!)}>
                          <Globe className="h-3 w-3 mr-1 cursor-pointer" />
                          {tDev?.visitWebsite ?? 'Visit Website'}
                        </Button>
                      </div>
                    </div>
                  )}
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full text-xs cursor-pointer" onClick={handleOfficeAddressClick}>
                      <MapPin className="h-3 w-3 mr-1 cursor-pointer" />
                      {tDev?.officeAddressButton ?? 'Office Address'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Company Details */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    {tDev?.companyDetails ?? 'Company Details'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">{tDev?.company ?? 'Company'}</p>
                      <p className="text-base font-semibold text-foreground">{developer.company_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">{tDevs?.activeProjects ?? 'Active Projects'}</p>
                      <p className="text-base font-semibold text-foreground">{activeProjects}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">{tDev?.verificationStatus ?? 'Verification Status'}</p>
                      <Badge className={`mt-1 ${developer.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {developer.is_verified ? (tDevs?.verified ?? 'Verified') : (tDev?.pendingVerification ?? 'Pending Verification')}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">{tDev?.memberSince ?? 'Member Since'}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(developer.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Developer Projects */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">{tDev?.projects ?? 'Projects'}</h2>
              <p className="text-muted-foreground">
                {developer.projects_pagination.total} {tDev?.totalProjects ?? 'total projects'}
              </p>
            </div>
            {listings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Building className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">{tDev?.noProjectsFound ?? 'No Projects Found'}</h3>
                  <p className="text-muted-foreground">{tDev?.noProjectsMessage ?? "This developer hasn't published any projects yet."}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Office Location Section */}
          {developer.office_latitude && developer.office_longitude && (
            <div className="mt-8" id="office-location-section">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    {tDev?.officeLocation ?? 'Office Location'}
                  </CardTitle>
                  <p className="text-muted-foreground mt-2">
                    {tDev?.officeVisitCta ?? 'Visit our office to discuss your investment and get personalized assistance.'}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <h4 className="font-medium mb-2 text-foreground">{tDev?.officeAddress ?? 'Office Address'}</h4>
                    <p className="text-muted-foreground">{developer.office_address || (tDev?.addressNotAvailable ?? 'Address not available')}</p>
                  </div>
                  <OfficeMap latitude={developer.office_latitude} longitude={developer.office_longitude} title={developer.company_name} />
                  <div className="mt-4">
                    <Button size="sm" className="w-full text-xs cursor-pointer" onClick={() => handleGetDirections(developer.office_latitude!, developer.office_longitude!)}>
                      <Navigation className="h-3 w-3 mr-1 cursor-pointer" />
                      {tDev?.getDirections ?? 'Get Directions to Office'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

