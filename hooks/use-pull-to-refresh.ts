import { useState, useRef, useCallback, useEffect } from 'react'

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void
  threshold?: number
  maxPullDistance?: number
  resistance?: number
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  maxPullDistance = 120,
  resistance = 2.5
}: UsePullToRefreshOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const startY = useRef<number>(0)
  const currentY = useRef<number>(0)
  const elementRef = useRef<HTMLDivElement>(null)
  const isPulling = useRef(false)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (elementRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY
      isPulling.current = true
    }
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling.current || isRefreshing) return

    currentY.current = e.touches[0].clientY
    const distance = currentY.current - startY.current

    if (distance > 0) {
      e.preventDefault()
      const pullDistance = Math.min(distance / resistance, maxPullDistance)
      setPullDistance(pullDistance)
    }
  }, [isRefreshing, maxPullDistance, resistance])

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current || isRefreshing) return

    if (pullDistance >= threshold) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }

    setPullDistance(0)
    isPulling.current = false
  }, [pullDistance, threshold, isRefreshing, onRefresh])

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd)

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  const refreshIndicatorStyle = {
    transform: `translateY(${Math.min(pullDistance, maxPullDistance)}px)`,
    opacity: Math.min(pullDistance / threshold, 1),
    transition: isRefreshing ? 'none' : 'transform 0.2s ease-out'
  }

  return {
    elementRef,
    isRefreshing,
    pullDistance,
    refreshIndicatorStyle,
    shouldShowIndicator: pullDistance > 0
  }
}
