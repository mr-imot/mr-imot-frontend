"use client"

import { useEffect, useState, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { ArrowLeft, Share2, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-is-mobile"

interface ModalClientWrapperProps {
  children: React.ReactNode
}

// Error component for when listing is not found - used by modal routes
export function ModalNotFound({ lang }: { lang: 'en' | 'bg' }) {
  const router = useRouter()
  const isBg = lang === 'bg'
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Building className="w-10 h-10 text-gray-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-3">
        {isBg ? 'Имотът не е намерен' : 'Property Not Found'}
      </h2>
      <p className="text-gray-600 mb-6">
        {isBg 
          ? 'Имотът, който търсите, не съществува или е премахнат.' 
          : "The property you're looking for doesn't exist or has been removed."}
      </p>
      <Button onClick={() => router.back()}>
        {isBg ? 'Назад' : 'Go Back'}
      </Button>
    </div>
  )
}

export function ModalClientWrapper({ children }: ModalClientWrapperProps) {
  const router = useRouter()
  const pathname = usePathname()
  const scrollPositionRef = useRef<number>(0)
  // Track whether we actually applied body styles (only on mobile)
  const hasAppliedStylesRef = useRef<boolean>(false)
  
  // Mobile detection - SSR-safe hook to prevent hydration mismatch
  const isMobile = useIsMobile()
  
  // Use ref to track if we've determined desktop mode to prevent remounts
  // Once desktop is determined, lock it to prevent structure changes that cause remounts
  const isDesktopRef = useRef(!isMobile)

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

  const handleBack = () => {
    // Check history length only on client (after mount)
    const isInitialEntry = typeof window !== 'undefined' ? window.history.length <= 1 : false
    if (isInitialEntry) {
      const baseListingsPath = pathname?.startsWith('/bg')
        ? '/bg/obiavi'
        : pathname?.startsWith('/ru')
          ? '/ru/obyavleniya'
          : '/listings'
      router.push(baseListingsPath)
      return
    }
    router.back()
  }

  // Update desktop ref when mobile state changes (after mount)
  useEffect(() => {
    if (!isMobile && !isDesktopRef.current) {
      isDesktopRef.current = true
    }
  }, [isMobile])

  // Handle modal open/close animations and scroll preservation
  // FIX: Only apply/restore body styles on mobile to prevent desktop scroll reset
  useEffect(() => {
    if (isMobile) {
      // Store current scroll position
      scrollPositionRef.current = window.scrollY
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollPositionRef.current}px`
      document.body.style.width = '100%'
      // Mark that we've applied styles so cleanup knows to restore
      hasAppliedStylesRef.current = true
    } else {
      // On desktop, we don't apply styles, so mark that we haven't
      hasAppliedStylesRef.current = false
    }

    return () => {
      // Only restore body scroll and scroll position if we actually applied styles
      // This prevents the scroll reset bug on desktop where cleanup was running
      // even though we never modified body styles
      if (hasAppliedStylesRef.current) {
        // Restore body scroll
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        // Restore scroll position
        window.scrollTo(0, scrollPositionRef.current)
        // Reset the flag
        hasAppliedStylesRef.current = false
      }
    }
  }, [isMobile])

  // DESKTOP: Don't show modal wrapper - let the full page with header render
  // CRITICAL: Once desktop is determined, never change structure to prevent remounts
  // This prevents infinite _rsc request loops and scroll resets
  if (isDesktopRef.current || !isMobile) {
    // Lock desktop mode once determined
    if (!isDesktopRef.current) {
      isDesktopRef.current = true
    }
    return <>{children}</>
  }

  // MOBILE ONLY: Show modal with back button (Airbnb experience)
  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col">
      {/* Modal Header with Back Button and Share Button - Airbnb style */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <button
          onClick={handleBack}
          className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg ring-1 ring-black/10 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 touch-manipulation"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-800" />
        </button>
        
        <button
          onClick={handleShare}
          className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg ring-1 ring-black/10 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 touch-manipulation"
          aria-label="Share"
        >
          <Share2 className="w-5 h-5 text-gray-800" />
        </button>
      </div>

      {/* Existing Listing Page Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  )
}

