import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import type { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel'

interface UseEmblaCarouselProps {
  options?: EmblaOptionsType
  onSelect?: (emblaApi: EmblaCarouselType) => void
}

export function useEmblaCarouselWithPhysics({ 
  options = {}, 
  onSelect 
}: UseEmblaCarouselProps = {}) {
  // Default physics-based configuration for smooth Airbnb-like experience
  const defaultOptions: EmblaOptionsType = {
    loop: true,
    dragFree: false,
    containScroll: 'trimSnaps',
    skipSnaps: false,
    align: 'center',
    speed: 10, // Smooth, not too fast
    duration: 20, // Natural duration
    ...options
  }

  const [emblaRef, emblaApi] = useEmblaCarousel(defaultOptions)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index)
  }, [emblaApi])

  const onSelectCallback = useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedScrollSnap())
    onSelect?.(emblaApi)
  }, [onSelect])

  useEffect(() => {
    if (!emblaApi) return

    setScrollSnaps(emblaApi.scrollSnapList())
    onSelectCallback(emblaApi)

    emblaApi.on('select', onSelectCallback)
    emblaApi.on('reInit', onSelectCallback)

    return () => {
      emblaApi.off('select', onSelectCallback)
      emblaApi.off('reInit', onSelectCallback)
    }
  }, [emblaApi, onSelectCallback])

  return {
    emblaRef,
    emblaApi,
    selectedIndex,
    scrollSnaps,
    scrollPrev,
    scrollNext,
    scrollTo,
    canScrollPrev: emblaApi?.canScrollPrev() ?? false,
    canScrollNext: emblaApi?.canScrollNext() ?? false
  }
}
