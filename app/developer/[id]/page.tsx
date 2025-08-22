"use client"

import { notFound } from "next/navigation"
import { useDevelopers } from "@/hooks/use-developers"
import { useProjects } from "@/hooks/use-projects"

interface PageProps {
  params: {
    id: string
  }
}

export default function DeveloperPage({ params }: PageProps) {
  const developerId = parseInt(params.id)
  
  if (isNaN(developerId)) {
    notFound()
  }

  const { developers, loading: developersLoading, error: developersError } = useDevelopers()
  const { projects, loading: projectsLoading, error: projectsError } = useProjects({ per_page: 100 })
  
  if (developersLoading || projectsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading developer details...</p>
        </div>
      </div>
    )
  }

  if (developersError || projectsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Developer</h1>
          <p className="text-gray-600">Unable to load developer details. Please try again later.</p>
        </div>
      </div>
    )
  }

  const developer = developers?.find(d => d.id === developerId)

  if (!developer) {
    notFound()
  }

  // Filter projects by this developer
  const developerProjects = projects?.filter(p => p.developer_id === developer.id) || []

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Developer Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">{developer.company_name}</h1>
            {developer.description && (
              <p className="text-gray-600 mb-4">{developer.description}</p>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                <div className="space-y-2">
                  <p><strong>City:</strong> {developer.city}</p>
                  {developer.phone && <p><strong>Phone:</strong> {developer.phone}</p>}
                  {developer.email && <p><strong>Email:</strong> {developer.email}</p>}
                  {developer.website && (
                    <p><strong>Website:</strong> 
                      <a href={developer.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                        {developer.website}
                      </a>
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Company Details</h2>
                <div className="space-y-2">
                  <p><strong>Verification Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-sm ${developer.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {developer.is_verified ? 'Verified' : 'Pending Verification'}
                    </span>
                  </p>
                  <p><strong>Active Projects:</strong> {developerProjects.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Developer Projects */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Projects</h2>
            {developerProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {developerProjects.map((project) => (
                  <div key={project.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
                    {project.description && (
                      <p className="text-gray-600 mb-4">{project.description}</p>
                    )}
                    
                    <div className="space-y-2 text-sm">
                      <p><strong>Location:</strong> {project.formatted_address || `${project.neighborhood}, ${project.city}`}</p>
                      <p><strong>Type:</strong> {project.project_type}</p>
                      {project.price_label && <p><strong>Price:</strong> {project.price_label}</p>}
                      {project.completion_note && <p><strong>Completion:</strong> {project.completion_note}</p>}
                    </div>

                    {project.images && project.images.length > 0 && (
                      <div className="mt-4">
                        <img 
                          src={project.images[0].imagekit_url || '/placeholder.jpg'} 
                          alt={project.name}
                          className="w-full h-48 object-cover rounded"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No projects found for this developer.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
