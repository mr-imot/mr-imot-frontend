"use client"

import { useState, useEffect } from 'react'
import { testConnection, getProjects } from '@/lib/api'

export default function DebugPage() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...')
  const [projectsStatus, setProjectsStatus] = useState<string>('Not tested')
  const [projectsData, setProjectsData] = useState<any>(null)
  const [transformedData, setTransformedData] = useState<any>(null)

  useEffect(() => {
    testBackendConnection()
  }, [])

  const testBackendConnection = async () => {
    try {
      setConnectionStatus('Testing connection...')
      const result = await testConnection()
      setConnectionStatus(`${result.status}: ${result.message}`)
    } catch (error) {
      setConnectionStatus(`Error: ${error}`)
    }
  }

  const testProjectsEndpoint = async () => {
    try {
      setProjectsStatus('Testing projects endpoint...')
      const data = await getProjects()
      setProjectsData(data)
      
      // Test the transformation
      const { projects } = data
      if (projects && projects.length > 0) {
        const transformed = projects.map((project: any) => ({
          id: project.id,
          slug: project.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          title: project.title,
          priceRange: project.price_per_m2 ? `${project.price_per_m2}/m²` : 'Price on request',
          location: project.neighborhood ? `${project.neighborhood}, ${project.city}` : project.city,
          image: project.cover_image_url || '/placeholder.svg?height=300&width=400',
          description: project.description,
          lat: project.latitude || 42.6977,
          lng: project.longitude || 23.3219,
          type: project.project_type === 'APARTMENT' ? 'Apartment Complex' : 
                project.project_type === 'HOUSE' ? 'Residential Houses' : 'Mixed-Use Building',
          status: project.status === 'UNDER_CONSTRUCTION' ? 'Under Construction' : 
                 project.status === 'PLANNING' ? 'Foundation Laid' : 'Pre-Sales Open',
          developer: project.developer?.company_name || 'Unknown Developer',
          completionDate: project.expected_completion_date ? 
            new Date(project.expected_completion_date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short' 
            }) : 'TBD',
          features: project.amenities_list || ['Modern Design', 'Quality Construction'],
        }))
        setTransformedData(transformed)
      }
      
      setProjectsStatus('Success! Check console for details.')
    } catch (error) {
      setProjectsStatus(`Error: ${error}`)
      console.error('API Error Details:', error)
    }
  }

  const testRealAPI = async () => {
    try {
      setProjectsStatus('Testing REAL API endpoint...')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.mrimot.com'}/api/v1/projects/`)
      console.log('Real API Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Real API Error:', errorText)
        setProjectsStatus(`Real API Error: ${response.status} - ${errorText}`)
        return
      }
      
      const data = await response.json()
      console.log('Real API Data:', data)
      setProjectsData(data)
      setProjectsStatus(`Real API Success! Found ${data.projects?.length || 0} projects`)
    } catch (error) {
      console.error('Real API Fetch Error:', error)
      setProjectsStatus(`Real API Fetch Error: ${error}`)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">API Debug Page</h1>
      
      <div className="space-y-6">
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Backend Connection</h2>
          <p className="mb-2">Status: {connectionStatus}</p>
          <button 
            onClick={testBackendConnection}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test Connection
          </button>
        </div>

        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Projects Endpoint</h2>
          <p className="mb-2">Status: {projectsStatus}</p>
          <div className="space-x-2">
            <button 
              onClick={testProjectsEndpoint}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Test Projects API
            </button>
            <button 
              onClick={testRealAPI}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test Real API Directly
            </button>
          </div>
        </div>

        {projectsData && (
          <div className="border p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">Raw API Data</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm max-h-96">
              {JSON.stringify(projectsData, null, 2)}
            </pre>
          </div>
        )}

        {transformedData && (
          <div className="border p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">Transformed Data (Frontend Format)</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm max-h-96">
              {JSON.stringify(transformedData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
} 