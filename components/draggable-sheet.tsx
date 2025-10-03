"use client"

import { useEffect, useRef, useState, ReactNode } from "react"

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

  const handleStart = (clientY: number) => {
    setIsDragging(true)
    setStartY(clientY)
    setCurrentY(clientY)
  }

  const handleMove = (clientY: number) => {
    if (!isDragging) return
    setCurrentY(clientY)
  }

  const handleEnd = () => {
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
  }

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    handleStart(e.clientY)
  }

  const handleMouseMove = (e: MouseEvent) => handleMove(e.clientY)
  const handleMouseUp = () => handleEnd()

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientY)
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging) {
      handleMove(e.touches[0].clientY)
    }
  }

  const handleTouchEnd = () => handleEnd()

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove)
      window.addEventListener('touchend', handleTouchEnd)

      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
        window.removeEventListener('touchmove', handleTouchMove)
        window.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [isDragging, startY, currentY])

  const height = snapPoints[currentSnap]
  const dragOffset = isDragging ? Math.max(0, (startY - currentY) / 10) : 0

  return (
    <div
      ref={sheetRef}
      className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl transition-all duration-300 ease-out z-50"
      style={{
        height: `${Math.min(height + dragOffset, 100)}vh`,
        touchAction: 'none',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      {/* Drag Handle */}
      <div
        className="absolute top-0 left-0 right-0 h-16 flex items-center justify-center cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="w-14 h-2 bg-gray-300 rounded-full" />
      </div>

      {/* Content */}
      <div className="h-full pt-16 overflow-y-auto overscroll-contain">
        {children}
      </div>
    </div>
  )
}

