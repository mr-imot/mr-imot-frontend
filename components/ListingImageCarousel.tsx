import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ListingImageCarouselProps {
  images: string[]
  alt: string
  aspectRatio?: 'square' | 'wide' // square = 1:1, wide = 3:2
}

export default function ListingImageCarousel({ 
  images, 
  alt, 
  aspectRatio = 'wide' 
}: ListingImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const hasMultipleImages = images?.length > 1

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex(index)
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div
        className={cn(
          aspectRatio === 'wide' 
            ? "aspect-[3/2] lg:aspect-[3/2] sm:aspect-square"
            : "aspect-square"
        )}
      >
        <Image
          key={currentIndex}
          src={images[currentIndex] || '/placeholder.svg'}
          alt={alt}
          fill
          className="object-cover transition-transform duration-300 ease-soft group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
        />
      </div>

      {hasMultipleImages && (
        <>
          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, idx) => (
              <button
                key={idx}
                className={cn(
                  "h-1.5 w-1.5 rounded-full bg-white/60 transition-colors",
                  idx === currentIndex && "bg-white"
                )}
                onClick={(e) => goToImage(idx, e)}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>

          {/* Navigation arrows */}
          <button
            aria-label="Previous image"
            onClick={prevImage}
            className="absolute left-3 top-1/2 -translate-y-1/2 grid place-items-center h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-md text-ink font-bold text-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ‹
          </button>
          <button
            aria-label="Next image"
            onClick={nextImage}
            className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-md text-ink font-bold text-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ›
          </button>
        </>
      )}
    </div>
  )
}
