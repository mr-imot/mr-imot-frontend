"use client"

import { notFound } from "next/navigation"
import { useProjects } from "@/hooks/use-projects"

interface PageProps {
  params: {
    id: string
  }
}

export default function ListingPage({ params }: PageProps) {
  const propertyId = parseInt(params.id)
  
  if (isNaN(propertyId)) {
    notFound()
  }

  // Use real API data instead of mock data
  const { projects, loading, error } = useProjects({ per_page: 100 })
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Property</h1>
          <p className="text-gray-600">Unable to load property details. Please try again later.</p>
        </div>
      </div>
    )
  }

  const property = projects?.find(p => p.id === propertyId)

  if (!property) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">{property.name}</h1>
          <p className="text-gray-600 mb-6">{property.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Property Details</h2>
              <div className="space-y-2">
                <p><strong>Location:</strong> {property.formatted_address || `${property.neighborhood}, ${property.city}`}</p>
                <p><strong>City:</strong> {property.city}</p>
                <p><strong>Type:</strong> {property.project_type}</p>
                <p><strong>Price:</strong> {property.price_label}</p>
                {property.completion_note && (
                  <p><strong>Completion:</strong> {property.completion_note}</p>
                )}
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Developer</h2>
              <div className="space-y-2">
                <p><strong>Developer:</strong> {property.developer?.company_name}</p>
                {property.developer?.description && (
                  <p className="text-gray-600">{property.developer.description}</p>
                )}
              </div>
            </div>
          </div>

          {property.images && property.images.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Images</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {property.images.map((image: any, index: number) => (
                  <div key={index} className="aspect-video bg-gray-100 rounded-lg">
                    <img 
                      src={image.imagekit_url || '/placeholder.jpg'} 
                      alt={`Property image ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
