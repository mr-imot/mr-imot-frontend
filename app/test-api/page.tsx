"use client"

import { useState } from 'react'
import { registerDeveloper, verifyEmail, resendVerification, loginDeveloper } from '@/lib/api'

export default function TestAPIPage() {
  const [status, setStatus] = useState<string>('Click to test')
  const [data, setData] = useState<any>(null)

  const testRealAPI = async () => {
    try {
      setStatus('Testing...')
      
      // Test 1: Basic connectivity
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.mrimot.com'}/api/v1/projects/`)
      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', errorText)
        setStatus(`Error ${response.status}: ${errorText}`)
        return
      }
      
      const jsonData = await response.json()
      console.log('API Data:', jsonData)
      setData(jsonData)
      setStatus(`Success! Found ${jsonData.projects?.length || 0} projects`)
      
    } catch (error) {
      console.error('Fetch Error:', error)
      setStatus(`Fetch Error: ${error}`)
    }
  }

  const testMockAPI = async () => {
    try {
      setStatus('Testing Mock API...')
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.mrimot.com'}/api/v1/mock-projects/`)
      console.log('Mock API Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        setStatus(`Mock API Error: ${response.status} - ${errorText}`)
        return
      }
      
      const jsonData = await response.json()
      console.log('Mock API Data:', jsonData)
      setData(jsonData)
      setStatus(`Mock API Success! Found ${jsonData.projects?.length || 0} projects`)
      
    } catch (error) {
      console.error('Mock API Fetch Error:', error)
      setStatus(`Mock API Fetch Error: ${error}`)
    }
  }

  const testRegistration = async () => {
    try {
      setStatus('Testing Registration...')
      
      const testData = {
        company_name: 'Test Company',
        contact_person: 'Test Person',
        email: `test${Date.now()}@example.com`,
        phone: '+359 88 123 4567',
        office_address: 'Sofia, Bulgaria',
        password: 'testpass123',
        accept_terms: true,
        website: 'https://test.com'
      }
      
      const result = await registerDeveloper(testData)
      console.log('Registration result:', result)
      setData(result)
      setStatus(`Registration Success! Check email: ${testData.email}`)
      
    } catch (error) {
      console.error('Registration Error:', error)
      setStatus(`Registration Error: ${error}`)
    }
  }

  const testLogin = async () => {
    try {
      setStatus('Testing Login...')
      
      // This will likely fail since the account needs to be verified and approved
      const result = await loginDeveloper('test@example.com', 'testpass123')
      console.log('Login result:', result)
      setData(result)
      setStatus('Login Success!')
      
    } catch (error) {
      console.error('Login Error:', error)
      setStatus(`Login Error: ${error}`)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">API Test Page</h1>
      
      <div className="space-y-4">
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">API Status</h2>
          <p className="mb-4">Status: {status}</p>
          <div className="space-x-2">
            <button 
              onClick={testRealAPI}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test Real API
            </button>
            <button 
              onClick={testMockAPI}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Test Mock API
            </button>
            <button 
              onClick={testRegistration}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Test Registration
            </button>
            <button 
              onClick={testLogin}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
            >
              Test Login
            </button>
          </div>
        </div>

        {data && (
          <div className="border p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">API Response</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm max-h-96">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
} 