import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { issueType, message, email } = body

    // Validate required fields
    if (!issueType || !message || !email) {
      return NextResponse.json(
        { error: 'Issue type, message, and email are required' },
        { status: 400 }
      )
    }

    // Get backend API URL from environment variable
    const backendUrl = process.env.NEXT_PUBLIC_API_URL
    if (!backendUrl) {
      console.error('NEXT_PUBLIC_API_URL environment variable is not set')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Forward to backend API using full URL
    const backendEndpoint = `${backendUrl}/api/v1/feedback`
    console.log(`Forwarding feedback to backend: ${backendEndpoint}`)

    const response = await fetch(backendEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        issueType,
        message,
        userEmail: email,
        email: 'feedback@mrimot.com'
      }),
    })

    if (response.ok) {
      return NextResponse.json(
        { message: 'Feedback submitted successfully' },
        { status: 200 }
      )
    } else {
      // Try to parse error response, but handle cases where response might not be JSON
      let errorMessage = 'Failed to submit feedback'
      try {
        const errorData = await response.json()
        errorMessage = errorData.detail || errorData.message || errorMessage
      } catch (parseError) {
        // If JSON parsing fails, use status text
        errorMessage = response.statusText || errorMessage
        console.error(`Backend returned non-JSON error response: ${response.status} ${response.statusText}`)
      }

      console.error(`Backend feedback endpoint error: ${response.status} - ${errorMessage}`)
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      )
    }
  } catch (error) {
    // Distinguish between network errors and other errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error connecting to backend:', error)
      return NextResponse.json(
        { error: 'Unable to connect to backend server' },
        { status: 503 }
      )
    }

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      console.error('JSON parsing error:', error)
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      )
    }

    // Generic error handling
    console.error('Error processing feedback:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
