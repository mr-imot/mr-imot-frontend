"use client"

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Maximize2, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import Image from 'next/image';
import { useEmblaCarouselWithPhysics } from '@/hooks/use-embla-carousel';
import { cn } from '@/lib/utils';

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

// Enhanced ImageKit transformation function - PROPER FULLSCREEN HANDLING
const getImageKitUrl = (originalUrl: string | undefined | null, width: number, height: number, quality: number = 90, imageType: 'main' | 'thumbnail' | 'fullscreen' = 'main') => {
  if (!originalUrl || typeof originalUrl !== 'string' || !originalUrl.includes('imagekit.io')) {
    return originalUrl || ''
  }
  
  // Extract the base path from the original URL
  const urlParts = originalUrl.split('/')
  const imageName = urlParts[urlParts.length - 1]
  
  // Smart transformations based on image type and usage
  let transformations = ''
  
  if (imageType === 'fullscreen') {
    // Fullscreen: NO cropping, NO focus, NO size constraints - only quality and format optimizations
    // This ensures the full image is shown without any pre-cropping by ImageKit
    transformations = `q-${quality},f-webp,pr-true,enhancement-true,sharpen-true,contrast-true`
  } else if (imageType === 'thumbnail') {
    // Thumbnails: Optimized for speed, smaller size
    transformations = `h-${height},w-${width},c-maintain_ratio,cm-focus,fo-auto,q-85,f-webp,pr-true`
  } else {
    // Main images: Balanced quality and performance
    transformations = `h-${height},w-${width},c-maintain_ratio,cm-focus,fo-auto,q-${quality},f-webp,pr-true,enhancement-true`
  }
  
  return `https://ik.imagekit.io/ts59gf2ul/tr:${transformations}/${imageName}`
}

export const PropertyGallery = ({ images, title }: PropertyGalleryProps) => {
  // Filter out non-string values and ensure we have valid images
  const validImages = images.filter((img): img is string => typeof img === 'string' && img.length > 0)
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  const hasMultipleImages = validImages.length > 1
  
  // Embla carousel hook for main gallery
  const {
    emblaRef: mainEmblaRef,
    selectedIndex: mainSelectedIndex,
    scrollPrev: mainScrollPrev,
    scrollNext: mainScrollNext,
    scrollTo: mainScrollTo,
    canScrollPrev: mainCanScrollPrev,
    canScrollNext: mainCanScrollNext
  } = useEmblaCarouselWithPhysics({
    options: {
      loop: hasMultipleImages,
      dragFree: false,
      containScroll: 'trimSnaps'
    }
  })
  
  // Embla carousel hook for fullscreen gallery
  const {
    emblaRef: fullscreenEmblaRef,
    selectedIndex: fullscreenSelectedIndex,
    scrollPrev: fullscreenScrollPrev,
    scrollNext: fullscreenScrollNext,
    scrollTo: fullscreenScrollTo,
    canScrollPrev: fullscreenCanScrollPrev,
    canScrollNext: fullscreenCanScrollNext
  } = useEmblaCarouselWithPhysics({
    options: {
      loop: hasMultipleImages,
      dragFree: false,
      containScroll: 'trimSnaps'
    }
  })
  
  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const nextImage = useCallback(() => {
    mainScrollNext();
    setImageDimensions(null); // Reset dimensions for new image
  }, [mainScrollNext]);

  const prevImage = useCallback(() => {
    mainScrollPrev();
    setImageDimensions(null); // Reset dimensions for new image
  }, [mainScrollPrev]);

  const openFullscreen = (index: number) => {
    fullscreenScrollTo(index);
    setIsFullscreen(true);
    
    // Prevent body scrolling when in fullscreen
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    
    // Restore body scrolling
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.height = '';
  };

  // Image fitting is now handled by CSS classes directly

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    setIsLoading(false);
  };

  // Enhanced keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isFullscreen) {
        switch (event.key) {
          case 'ArrowRight':
          case ' ':
            event.preventDefault();
            fullscreenScrollNext();
            break;
          case 'ArrowLeft':
            event.preventDefault();
            fullscreenScrollPrev();
            break;
          case 'Escape':
            event.preventDefault();
            closeFullscreen();
            break;
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
          case '7':
          case '8':
          case '9':
            event.preventDefault();
            const num = parseInt(event.key) - 1;
            if (num < validImages.length) {
              fullscreenScrollTo(num);
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, fullscreenScrollNext, fullscreenScrollPrev, validImages.length, fullscreenScrollTo]);

  // Cleanup effect to restore body styles when component unmounts
  useEffect(() => {
    return () => {
      // Restore body scrolling when component unmounts
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, []);

  if (!validImages || validImages.length === 0) {
    return (
      <div className="relative h-[60vh] md:h-[70vh] bg-muted rounded-2xl overflow-hidden flex items-center justify-center">
        <span className="text-muted-foreground text-lg">No images available</span>
      </div>
    );
  }

  return (
    <>
      <div className="relative animate-fade-in">
        {/* Main large image with Embla carousel - Mobile Optimized */}
        <div 
          className="relative h-[50vh] sm:h-[55vh] md:h-[60vh] lg:h-[70vh] bg-muted rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer group shadow-lg sm:shadow-elegant"
          onClick={() => openFullscreen(mainSelectedIndex)}
        >
          <div className="embla h-full" ref={mainEmblaRef}>
            <div className="embla__container flex h-full">
              {validImages.map((image, index) => (
                <div key={index} className="embla__slide flex-[0_0_100%] min-w-0 h-full">
                  <div className="relative w-full h-full">
                    <Image
                      src={getImageKitUrl(image, isMobile ? 800 : 1400, isMobile ? 600 : 900, 95, 'main')}
                      alt={`${title} - View ${index + 1}`}
                      fill
                      className="object-cover transition-all duration-500 group-hover:scale-110 cursor-pointer"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                      priority={index === 0}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Enhanced overlay with expand icon */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="bg-white/20 backdrop-blur-md rounded-full p-3 md:p-4 text-white transform scale-90 group-hover:scale-100 transition-transform duration-300 cursor-pointer">
              <Maximize2 className="h-6 w-6 md:h-8 md:w-8 cursor-pointer" />
            </div>
          </div>
          
          {/* Enhanced photo counter */}
          <div className="absolute bottom-4 md:bottom-6 right-4 md:right-6 bg-black/70 text-white px-3 md:px-4 py-1 md:py-2 rounded-full backdrop-blur-md flex items-center gap-2">
            <Grid3X3 className="h-3 w-3 md:h-4 md:w-4" />
            <span className="font-medium text-sm md:text-base">{validImages.length} photos</span>
          </div>

          {/* Keyboard hint - Hidden on mobile */}
          <div className="absolute top-4 md:top-6 left-4 md:left-6 bg-white/20 backdrop-blur-md text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block">
            Click to view gallery
          </div>
        </div>

        {/* Enhanced thumbnail grid - Mobile Optimized */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-4 md:mt-6">
          {validImages.slice(0, 4).map((image, index) => (
            <div
              key={index}
              className={cn(
                "relative h-20 md:h-24 lg:h-32 bg-muted rounded-xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-lg transition-all duration-300",
                index === mainSelectedIndex && "ring-2 ring-blue-500"
              )}
              onClick={() => mainScrollTo(index)}
            >
              <Image
                src={getImageKitUrl(image, 500, 400, 90, 'thumbnail')}
                alt={`${title} - View ${index + 1}`}
                fill
                className="object-cover transition-all duration-300 group-hover:scale-110 cursor-pointer"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/30 backdrop-blur-sm rounded-full p-1 md:p-2 cursor-pointer">
                  <Maximize2 className="h-3 w-3 md:h-4 md:w-4 text-white cursor-pointer" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TRUE FULLSCREEN GALLERY - BYPASSES BROWSER UI */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-[9999] bg-black"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100dvh', // Dynamic viewport height for mobile
            margin: 0,
            padding: 0,
            overflow: 'hidden'
          }}
        >
          {/* Mobile-Optimized Header Bar */}
          <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 via-black/50 to-transparent backdrop-blur-xl">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                <div className="bg-white/10 backdrop-blur-md rounded-full p-1.5 sm:p-2 flex-shrink-0">
                  <Grid3X3 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-white font-semibold text-sm sm:text-lg truncate">{title}</h2>
                  <p className="text-white/70 text-xs sm:text-sm">Property Gallery • {fullscreenSelectedIndex + 1} of {validImages.length}</p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 sm:w-12 sm:h-12 text-white hover:bg-white/20 transition-all duration-300 rounded-full backdrop-blur-md border border-white/20 flex-shrink-0 cursor-pointer"
                onClick={closeFullscreen}
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6 cursor-pointer" />
              </Button>
            </div>
          </div>

          {/* TRUE FULLSCREEN IMAGE CONTAINER */}
          <div 
            className="absolute inset-0 w-full h-full"
            style={{
              top: '80px', // Space for header
              left: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              height: 'calc(100dvh - 80px)', // Dynamic viewport height for mobile
            }}
          >
            {/* Mobile-Optimized Navigation Arrows */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-40 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-white hover:bg-white/20 transition-all duration-300 rounded-full backdrop-blur-md border border-white/20 shadow-2xl disabled:opacity-30 disabled:cursor-not-allowed"
              onClick={fullscreenScrollPrev}
              disabled={!fullscreenCanScrollPrev}
            >
              <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-40 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-white hover:bg-white/20 transition-all duration-300 rounded-full backdrop-blur-md border border-white/20 shadow-2xl disabled:opacity-30 disabled:cursor-not-allowed"
              onClick={fullscreenScrollNext}
              disabled={!fullscreenCanScrollNext}
            >
              <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
            </Button>

            {/* PERFECT FULLSCREEN IMAGE CAROUSEL - NO CROPPING, FULL IMAGE VISIBLE */}
            <div className="absolute inset-0 w-full h-full">
              <div className="embla" ref={fullscreenEmblaRef}>
                <div className="embla__container flex">
                  {validImages.map((image, index) => (
                    <div key={index} className="embla__slide flex-[0_0_100%] min-w-0">
                      <div className="w-full h-full flex items-center justify-center">
                        <Image
                          src={getImageKitUrl(image, 2560, 1440, 98, 'fullscreen')}
                          alt={`${title} - View ${index + 1}`}
                          width={2560}
                          height={1440}
                          className="transition-all duration-500 ease-out max-w-full max-h-full"
                          style={{
                            objectFit: 'contain',
                            objectPosition: 'center',
                            width: 'auto',
                            height: 'auto',
                            maxWidth: '100%',
                            maxHeight: '100%'
                          }}
                          onLoad={handleImageLoad}
                          onLoadStart={() => setIsLoading(true)}
                          priority={index === 0}
                          sizes="100vw"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Modern Loading State */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-white/20 rounded-full animate-spin"></div>
                      <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
                    </div>
                    <p className="text-white/80 text-sm font-medium">Loading image...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
