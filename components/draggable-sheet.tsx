"use client"

import { useEffect, useRef, useState, ReactNode, useCallback } from "react"
import { cn } from "@/lib/utils"

interface DraggableSheetProps {
  children: ReactNode
  snapPoints?: number[] // Heights in vh (e.g., [30, 60, 90])
  initialSnap?: number // Index of initial snap point
  onSnapChange?: (snapIndex: number) => void
}

export function DraggableSheet({ 
  children, 
  snapPoints = [30, 70, 95], 
  initialSnap = 0,
  onSnapChange 
}: DraggableSheetProps) {
  const [currentSnap, setCurrentSnap] = useState(initialSnap)
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [currentY, setCurrentY] = useState(0)
  const [hasMounted, setHasMounted] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // CRITICAL: Only allow scrolling when at the LAST (highest) snap point
  const isFullyExpanded = currentSnap === snapPoints.length - 1

  const handleStart = useCallback((clientY: number) => {
    setIsDragging(true)
    setStartY(clientY)
    setCurrentY(clientY)
  }, [])

  const handleMove = useCallback((clientY: number) => {
    if (!isDragging) return
    setCurrentY(clientY)
  }, [isDragging])

  const handleEnd = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)

    const deltaY = startY - currentY
    const threshold = 50 // pixels

    let newSnap = currentSnap

    if (deltaY > threshold && currentSnap < snapPoints.length - 1) {
      // Swiped up - expand to next snap
      newSnap = currentSnap + 1
    } else if (deltaY < -threshold && currentSnap > 0) {
      // Swiped down - collapse to previous snap
      // But only if we're at the top of scroll (or not fully expanded)
      const content = contentRef.current
      const canCollapse = !isFullyExpanded || (content && content.scrollTop <= 1)
      if (canCollapse) {
        newSnap = currentSnap - 1
      }
    }

    setCurrentSnap(newSnap)
    onSnapChange?.(newSnap)
  }, [isDragging, startY, currentY, currentSnap, snapPoints.length, onSnapChange, isFullyExpanded])

  // Mouse events (desktop only)
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    handleStart(e.clientY)
  }

  const handleMouseMove = useCallback((e: MouseEvent) => handleMove(e.clientY), [handleMove])
  const handleMouseUp = useCallback(() => handleEnd(), [handleEnd])

  // Touch events - SIMPLE AIRBNB-LIKE BEHAVIOR:
  // - If NOT fully expanded: all touches are for dragging (expand/collapse)
  // - If fully expanded: content scrolls, can only collapse when at top AND dragging down
  const handleTouchStart = (e: React.TouchEvent) => {
    const touchY = e.touches[0].clientY
    const target = e.target as HTMLElement
    const content = contentRef.current
    
    // Always capture drag from handle area
    if (target.closest('[data-drag-handle]')) {
      e.preventDefault()
      handleStart(touchY)
      return
    }

    // If NOT fully expanded, capture ALL touches for drag (no scrolling allowed)
    if (!isFullyExpanded) {
      e.preventDefault()
      handleStart(touchY)
      return
    }

    // Fully expanded: check if at top of scroll
    const scrollTop = content?.scrollTop ?? 0
    const isAtTop = scrollTop <= 1
    
    if (isAtTop) {
      // At top - might be collapse gesture, start tracking
      handleStart(touchY)
    }
    // If not at top, don't start drag - let native scroll work
  }

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const content = contentRef.current
    const touchY = e.touches[0].clientY
    const deltaY = startY - touchY // Positive = swiping up, Negative = swiping down

    // If not fully expanded, always capture for dragging
    if (!isFullyExpanded) {
      e.preventDefault()
      handleMove(touchY)
      return
    }

    // Fully expanded - smart handling
    if (isDragging) {
      const scrollTop = content?.scrollTop ?? 0
      const isAtTop = scrollTop <= 1
      
      // At top and swiping DOWN = collapse gesture
      if (isAtTop && deltaY < 0) {
        e.preventDefault()
        handleMove(touchY)
        return
      }
      
      // Swiping UP or no longer at top = let scroll take over
      setIsDragging(false)
    }
  }, [isDragging, startY, isFullyExpanded, handleMove])

  const handleTouchEnd = useCallback(() => {
    handleEnd()
  }, [handleEnd])

  useEffect(() => {
    if (isDragging) {
      // Lock page scroll while dragging
      const body = document.body
      const prevOverflow = body.style.overflow
      const prevTouch = body.style.touchAction
      body.style.overflow = 'hidden'
      body.style.touchAction = 'none'

      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove, { passive: false })
      window.addEventListener('touchend', handleTouchEnd, { passive: false })

      return () => {
        body.style.overflow = prevOverflow
        body.style.touchAction = prevTouch
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
        window.removeEventListener('touchmove', handleTouchMove)
        window.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  // Mount animation
  useEffect(() => {
    setHasMounted(true)
  }, [])

  const height = snapPoints[currentSnap]
  const dragOffset = isDragging ? Math.max(0, (startY - currentY) / 10) : 0

  return (
    <div
      ref={sheetRef}
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-40",
        isDragging ? "transition-none" : "transition-all duration-300 ease-out"
      )}
      style={{
        height: `${Math.min(height + dragOffset, 100)}vh`,
        touchAction: isFullyExpanded ? 'pan-y' : 'none',
        paddingBottom: 'env(safe-area-inset-bottom)',
        overscrollBehavior: 'contain',
        boxShadow: isDragging 
          ? '0 -8px 32px rgba(0,0,0,0.2)' 
          : '0 4px 16px rgba(0,0,0,0.12)'
      }}
    >
      {/* Drag Handle - Enhanced for better visibility */}
      <div
        data-drag-handle
        className={cn(
          "absolute top-0 left-0 right-0 h-16 flex items-center justify-center cursor-grab active:cursor-grabbing z-10 bg-gradient-to-b from-white to-gray-50/50 rounded-t-3xl border-b border-gray-200/50",
          hasMounted && "animate-[pulse-once_1.5s_ease-in-out]"
        )}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Main handle bar - much more prominent */}
        <div 
          className={cn(
            "w-20 h-2.5 bg-gray-600 rounded-full shadow-sm transition-all duration-200",
            isDragging && "scale-110 bg-gray-700"
          )} 
        />
      </div>

      {/* Content - only scrollable when fully expanded */}
      <div 
        ref={contentRef}
        className="h-full pt-16 overscroll-contain"
        style={{ 
          overflowY: isFullyExpanded ? 'auto' : 'hidden', 
          WebkitOverflowScrolling: 'touch',
          touchAction: isFullyExpanded ? 'pan-y' : 'none'
        }}
        onTouchStart={handleTouchStart}
      >
        {children}
      </div>
    </div>
  )
}

