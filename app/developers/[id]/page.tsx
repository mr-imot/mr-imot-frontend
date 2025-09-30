"use client"

import { use, useRef, useEffect } from "react"
import { notFound } from "next/navigation"
import { useDeveloper } from "@/hooks/use-developer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Building, Phone, Globe, Navigation } from "lucide-react"
import { ListingCard, Listing } from "@/components/ListingCard"
import { ensureGoogleMaps } from "@/lib/google-maps"

interface PageProps {
  params: Promise<{
    id: string
  }>
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
          })

          new window.google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            map,
            title: title,
            cursor: "pointer"
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
  // Debug: Log the project images structure
  console.log('Project images structure:', project.images);
  
  return {
    id: project.id,
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

export default function DeveloperPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const developerId = resolvedParams.id
  
  if (!developerId) {
    notFound()
  }

  const { developer, loading, error } = useDeveloper(developerId, { per_page: 12 })

  const handleOfficeAddressClick = () => {
    const officeSection = document.getElementById('office-location-section')
    if (officeSection) {
      officeSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  const handleGetDirections = (latitude: number, longitude: number, title: string) => {
    // Create Google Maps directions URL
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    
    // Open in new tab
    window.open(directionsUrl, '_blank', 'noopener,noreferrer')
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading developer details...</p>
        </div>
      </div>
    )
  }

  if (error || !developer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Error Loading Developer</h1>
          <p className="text-muted-foreground">Unable to load developer details. Please try again later.</p>
        </div>
      </div>
    )
  }

  // Convert projects to Listing format
  const listings: Listing[] = developer.projects?.map(projectToListing) || []
  
  // Debug: Log the final listings with images
  console.log('Final listings with images:', listings.map(l => ({ id: l.id, title: l.title, images: l.images })));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Developer Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-3xl font-bold text-foreground">{developer.company_name}</h1>
              {developer.is_verified && (
                <Badge className="bg-green-500 text-white">
                  <Building className="w-3 h-3 mr-1" />
                  Verified Developer
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact Information */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">Contact Person</p>
                    <p className="text-base font-semibold text-foreground">{developer.contact_person}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">Office Address</p>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{developer.office_address}</p>
                    </div>
                  </div>
                  
                  {developer.phone && (
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">Phone</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground font-mono">{developer.phone}</p>
                      </div>
                    </div>
                  )}
                  
                          {developer.website && (
                            <div>
                              <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">Website</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Globe className="h-4 w-4 text-muted-foreground" />
                                <a 
                                  href={developer.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-primary hover:text-primary/80 hover:underline text-sm"
                                >
                                  Visit Website
                                </a>
                              </div>
                            </div>
                          )}
                          
                          <div className="pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-xs cursor-pointer"
                              onClick={handleOfficeAddressClick}
                            >
                              <MapPin className="h-3 w-3 mr-1 cursor-pointer" />
                              Office Address
                            </Button>
                          </div>
                </CardContent>
              </Card>
              
              {/* Company Details */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Company Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">Company</p>
                      <p className="text-base font-semibold text-foreground">{developer.company_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">Active Projects</p>
                      <p className="text-base font-semibold text-foreground">{developer.total_projects}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">Verification Status</p>
                      <Badge className={`mt-1 ${developer.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {developer.is_verified ? 'Verified' : 'Pending Verification'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">Member Since</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(developer.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long' 
                        })}
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
              <h2 className="text-2xl font-bold text-foreground">Projects</h2>
              <p className="text-muted-foreground">
                {developer.projects_pagination.total} total projects
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
                          <h3 className="text-lg font-semibold text-foreground mb-2">No Projects Found</h3>
                          <p className="text-muted-foreground">This developer hasn't published any projects yet.</p>
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
                            Office Location
                          </CardTitle>
                          <p className="text-muted-foreground mt-2">
                            Visit our office to discuss your investment and get personalized assistance.
                          </p>
                        </CardHeader>
                        <CardContent>
                          <div className="mb-6">
                            <h4 className="font-medium mb-2 text-foreground">Office Address</h4>
                            <p className="text-muted-foreground">{developer.office_address || 'Address not available'}</p>
                          </div>
                          
                          <OfficeMap 
                            latitude={developer.office_latitude} 
                            longitude={developer.office_longitude} 
                            title={developer.company_name}
                          />
                          <div className="mt-4">
                            <Button 
                              size="sm"
                              className="w-full text-xs cursor-pointer"
                              onClick={() => handleGetDirections(developer.office_latitude, developer.office_longitude, developer.company_name)}
                            >
                              <Navigation className="h-3 w-3 mr-1 cursor-pointer" />
                              Get Directions to Office
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
