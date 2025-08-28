import { useRef, useCallback, useEffect } from 'react'

interface UseSwipeGesturesOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
  minSwipeDistance?: number
}

export function useSwipeGestures({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  minSwipeDistance = 100
}: UseSwipeGesturesOptions = {}) {
  const startX = useRef<number>(0)
  const startY = useRef<number>(0)
  const endX = useRef<number>(0)
  const endY = useRef<number>(0)
  const isSwiping = useRef(false)
  const elementRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    isSwiping.current = true
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isSwiping.current) return
    endX.current = e.touches[0].clientX
    endY.current = e.touches[0].clientY
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping.current) return

    const deltaX = endX.current - startX.current
    const deltaY = endY.current - startY.current
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)

    // Check if swipe distance meets minimum threshold
    if (Math.max(absDeltaX, absDeltaY) < minSwipeDistance) {
      isSwiping.current = false
      return
    }

    // Determine swipe direction
    if (absDeltaX > absDeltaY) {
      // Horizontal swipe
      if (deltaX > threshold && onSwipeRight) {
        onSwipeRight()
      } else if (deltaX < -threshold && onSwipeLeft) {
        onSwipeLeft()
      }
    } else {
      // Vertical swipe
      if (deltaY > threshold && onSwipeDown) {
        onSwipeDown()
      } else if (deltaY < -threshold && onSwipeUp) {
        onSwipeUp()
      }
    }

    isSwiping.current = false
  }, [threshold, minSwipeDistance, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown])

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: true })
    element.addEventListener('touchend', handleTouchEnd)

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return { elementRef }
}
