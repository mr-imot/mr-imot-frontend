"use client"

import { useEffect, useState, use, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import ListingPage from "../../[id]/page"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function InterceptedListingModal({ params }: PageProps) {
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const scrollPositionRef = useRef<number>(0)

  // Share functionality
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Property Listing',
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        // You could add a toast notification here
      } catch (error) {
        console.log('Error copying to clipboard:', error)
      }
    }
  }

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle modal open/close animations and scroll preservation
  useEffect(() => {
    if (isMobile) {
      // Store current scroll position
      scrollPositionRef.current = window.scrollY
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollPositionRef.current}px`
      document.body.style.width = '100%'
    }

    return () => {
      // Restore body scroll
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      // Restore scroll position
      window.scrollTo(0, scrollPositionRef.current)
    }
  }, [isMobile])

  // Only show modal on mobile
  if (!isMobile) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col">
      {/* Modal Header with Back Button and Share Button */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-11 h-11 hover:bg-gray-100 active:bg-gray-200 rounded-full transition-colors touch-manipulation"
          aria-label="Back"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </div>

      {/* Existing Listing Page Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full">
          <ListingPage params={params} />
        </div>
      </div>
    </div>
  )
}
