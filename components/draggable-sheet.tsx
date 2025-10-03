"use client"

import { useEffect, useRef, useState, ReactNode, useCallback } from "react"

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
  const sheetRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

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
      // Swiped up - expand
      newSnap = currentSnap + 1
    } else if (deltaY < -threshold && currentSnap > 0) {
      // Swiped down - collapse
      newSnap = currentSnap - 1
    }

    setCurrentSnap(newSnap)
    onSnapChange?.(newSnap)
  }, [isDragging, startY, currentY, currentSnap, snapPoints.length, onSnapChange])

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    handleStart(e.clientY)
  }

  const handleMouseMove = useCallback((e: MouseEvent) => handleMove(e.clientY), [handleMove])
  const handleMouseUp = useCallback(() => handleEnd(), [handleEnd])

  // Touch events - SMART DETECTION: drag vs scroll
  const handleTouchStart = (e: React.TouchEvent) => {
    const content = contentRef.current
    if (!content) return

    const touchY = e.touches[0].clientY
    const isScrollable = currentSnap >= 1 // Can potentially scroll when expanded
    const scrollTop = content.scrollTop
    const scrollHeight = content.scrollHeight
    const clientHeight = content.clientHeight
    const isAtTop = scrollTop <= 0
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1

    // CRITICAL FIX: Only allow scroll if:
    // 1. Sheet is expanded (currentSnap >= 1)
    // 2. Content is scrollable (scrollHeight > clientHeight)
    // 3. User is NOT at scroll boundary trying to drag
    
    if (isScrollable && scrollHeight > clientHeight) {
      // If at top and swiping down, OR at bottom and swiping up, allow dragging
      // Otherwise, allow native scroll
      const target = e.target as HTMLElement
      
      // Always capture drag from handle area
      if (target.closest('[data-drag-handle]')) {
        e.preventDefault()
        handleStart(touchY)
        return
      }

      // If at scroll boundary, prepare to capture drag on move
      if (isAtTop || isAtBottom) {
        // Don't prevent default yet, wait for move direction
        handleStart(touchY)
        return
      }
      
      // Middle of scroll, allow native scroll, don't start drag
      return
    } else {
      // Sheet is collapsed or content not scrollable, always capture for drag
      e.preventDefault()
      handleStart(touchY)
    }
  }

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return
    
    const content = contentRef.current
    if (!content) return

    const touchY = e.touches[0].clientY
    const deltaY = startY - touchY
    const isScrollable = currentSnap >= 1
    const scrollTop = content.scrollTop
    const scrollHeight = content.scrollHeight
    const clientHeight = content.clientHeight
    const isAtTop = scrollTop <= 0
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1

    // If expanded and scrollable, only prevent if at boundary
    if (isScrollable && scrollHeight > clientHeight) {
      if ((isAtTop && deltaY < 0) || (isAtBottom && deltaY > 0)) {
        // At boundary, prevent and allow drag
        e.preventDefault()
        handleMove(touchY)
      } else {
        // Not at boundary, release drag and allow scroll
        setIsDragging(false)
      }
    } else {
      // Collapsed or not scrollable, always drag
      e.preventDefault()
      handleMove(touchY)
    }
  }, [isDragging, startY, currentSnap, handleMove])

  const handleTouchEnd = useCallback(() => handleEnd(), [handleEnd])

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
      window.addEventListener('touchend', handleTouchEnd)

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

  const height = snapPoints[currentSnap]
  const dragOffset = isDragging ? Math.max(0, (startY - currentY) / 10) : 0
  const canScroll = currentSnap >= 1

  return (
    <div
      ref={sheetRef}
      className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl transition-all duration-300 ease-out z-50"
      style={{
        height: `${Math.min(height + dragOffset, 100)}vh`,
        touchAction: 'none',
        paddingBottom: 'env(safe-area-inset-bottom)',
        overscrollBehavior: 'contain'
      }}
    >
      {/* Drag Handle */}
      <div
        data-drag-handle
        className="absolute top-0 left-0 right-0 h-16 flex items-center justify-center cursor-grab active:cursor-grabbing z-10"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="w-14 h-2 bg-gray-300 rounded-full" />
      </div>

      {/* Content */}
      <div 
        ref={contentRef}
        className="h-full pt-16 overscroll-contain"
        style={{ 
          overflowY: canScroll ? 'auto' as const : 'hidden' as const, 
          WebkitOverflowScrolling: 'touch' 
        }}
        onTouchStart={handleTouchStart}
      >
        {children}
      </div>
    </div>
  )
}

