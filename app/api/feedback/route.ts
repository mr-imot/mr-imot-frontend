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

    // Forward to backend API
    const response = await fetch(`/api/v1/feedback`, {
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
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.detail || 'Failed to submit feedback' },
        { status: response.status }
      )
    }
  } catch (error) {
    console.error('Error processing feedback:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
