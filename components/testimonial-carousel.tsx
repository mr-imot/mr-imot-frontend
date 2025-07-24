"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { TestimonialCard } from "@/components/testimonial-card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface TestimonialCarouselProps {
  testimonials: Array<{
    quote: string
    author: string
    role: string
    imageSrc: string
    rating?: number
  }>
}

export function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; index: number } | null>(null)
  const [cardWidth, setCardWidth] = useState(0)
  const [cardsPerView, setCardsPerView] = useState(3)

  const containerRef = useRef<HTMLDivElement>(null)
  const autoPlayRef = useRef<NodeJS.Timeout>()

  // Calculate responsive cards per view
  const updateCardsPerView = useCallback(() => {
    if (typeof window === "undefined") return
    const width = window.innerWidth
    if (width < 768) {
      setCardsPerView(1)
    } else if (width < 1024) {
      setCardsPerView(2)
    } else {
      setCardsPerView(3)
    }
  }, [])

  // Calculate card width based on container and cards per view
  const updateCardWidth = useCallback(() => {
    if (!containerRef.current) return
    const containerWidth = containerRef.current.offsetWidth
    const gap = 24 // 1.5rem gap
    const availableWidth = containerWidth
    const calculatedWidth = (availableWidth - gap * (cardsPerView - 1)) / cardsPerView
    // Limit maximum card width to 400px for better readability
    const width = Math.min(Math.max(calculatedWidth, 320), 400)
    setCardWidth(width)
  }, [cardsPerView])

  // Extended testimonials for infinite loop
  const extendedTestimonials = useMemo(() => {
    if (testimonials.length === 0) return []
    const multiplier = Math.max(3, Math.ceil(12 / testimonials.length))
    return Array(multiplier).fill(testimonials).flat()
  }, [testimonials])

  // Handle resize
  useEffect(() => {
    updateCardsPerView()
    updateCardWidth()

    const handleResize = () => {
      updateCardsPerView()
      updateCardWidth()
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [updateCardsPerView, updateCardWidth])

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || isDragging) return

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % extendedTestimonials.length)
    }, 5000)

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [isAutoPlaying, isDragging, extendedTestimonials.length])

  // Navigation functions
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % extendedTestimonials.length)
  }, [extendedTestimonials.length])

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + extendedTestimonials.length) % extendedTestimonials.length)
  }, [extendedTestimonials.length])

  // Touch/Mouse handlers
  const handleStart = useCallback(
    (clientX: number) => {
      setIsDragging(true)
      setDragStart({ x: clientX, index: currentIndex })
    },
    [currentIndex],
  )

  const handleMove = useCallback(
    (clientX: number) => {
      if (!dragStart || !cardWidth) return

      const diff = clientX - dragStart.x
      const threshold = cardWidth * 0.3

      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          setCurrentIndex((prev) => (prev - 1 + extendedTestimonials.length) % extendedTestimonials.length)
        } else {
          setCurrentIndex((prev) => (prev + 1) % extendedTestimonials.length)
        }
        setDragStart({ x: clientX, index: currentIndex })
      }
    },
    [dragStart, cardWidth, currentIndex, extendedTestimonials.length],
  )

  const handleEnd = useCallback(() => {
    setIsDragging(false)
    setDragStart(null)
  }, [])

  // Mouse events
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      handleStart(e.clientX)
    },
    [handleStart],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return
      e.preventDefault()
      handleMove(e.clientX)
    },
    [isDragging, handleMove],
  )

  // Touch events
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      handleStart(e.touches[0].clientX)
    },
    [handleStart],
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return
      handleMove(e.touches[0].clientX)
    },
    [isDragging, handleMove],
  )

  // Global mouse events
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      handleMove(e.clientX)
    }

    const handleGlobalMouseUp = () => {
      handleEnd()
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleGlobalMouseMove)
      document.addEventListener("mouseup", handleGlobalMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove)
      document.removeEventListener("mouseup", handleGlobalMouseUp)
    }
  }, [isDragging, handleMove, handleEnd])

  if (extendedTestimonials.length === 0) return null

  return (
    <div
      className="relative select-none"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Enhanced Navigation Arrows */}
      <Button
        variant="outline"
        size="sm"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 p-0 bg-white/95 backdrop-blur-sm border-ds-neutral-200 hover:bg-white hover:border-ds-primary-600 shadow-lg rounded-full"
        onClick={goToPrev}
      >
        <ChevronLeft className="h-5 w-5 text-ds-neutral-600" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 p-0 bg-white/95 backdrop-blur-sm border-ds-neutral-200 hover:bg-white hover:border-ds-primary-600 shadow-lg rounded-full"
        onClick={goToNext}
      >
        <ChevronRight className="h-5 w-5 text-ds-neutral-600" />
      </Button>

      {/* Carousel Container with Enhanced Spacing */}
      <div className="overflow-hidden px-6 flex justify-center" ref={containerRef}>
        <div
          className={`flex gap-6 transition-transform duration-500 ease-out ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{
            transform: `translateX(-${currentIndex * (cardWidth + 24)}px)`,
            maxWidth: `${cardsPerView * (cardWidth + 24) - 24}px`, // Center the visible cards
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleEnd}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleEnd}
        >
          {extendedTestimonials.map((testimonial, index) => (
            <div
              key={`${testimonial.author}-${index}`}
              className="flex-shrink-0 flex justify-center"
              style={{ width: `${cardWidth}px` }}
            >
              <div style={{ maxWidth: "400px", width: "100%" }}>
                <TestimonialCard
                  quote={testimonial.quote}
                  author={testimonial.author}
                  role={testimonial.role}
                  imageSrc={testimonial.imageSrc}
                  rating={testimonial.rating || 5}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Dots Indicator */}
      <div className="flex justify-center mt-10 space-x-3">
        {testimonials.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex % testimonials.length
                ? "bg-ds-primary-600 w-8 shadow-md"
                : "bg-ds-neutral-300 hover:bg-ds-neutral-400"
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  )
}
