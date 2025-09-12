"use client"

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Maximize2, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import Image from 'next/image';

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

// Helper function to get high-quality ImageKit URLs
const getImageKitUrl = (originalUrl: string, width: number, height: number, quality: number = 85) => {
  if (!originalUrl || !originalUrl.includes('imagekit.io')) {
    return originalUrl
  }
  
  // Extract the base path from the original URL
  const urlParts = originalUrl.split('/')
  const imageName = urlParts[urlParts.length - 1]
  
  // Create high-quality transformation URL
  return `https://ik.imagekit.io/ts59gf2ul/tr:h-${height},w-${width},c-maintain_ratio,cm-focus,fo-auto,q-${quality},f-auto,pr-true,enhancement-true/${imageName}`
}

export const PropertyGallery = ({ images, title }: PropertyGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const openFullscreen = (index: number) => {
    setCurrentIndex(index);
    setIsFullscreen(true);
  };

  // Enhanced keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isFullscreen) {
        switch (event.key) {
          case 'ArrowRight':
          case ' ':
            event.preventDefault();
            nextImage();
            break;
          case 'ArrowLeft':
            event.preventDefault();
            prevImage();
            break;
          case 'Escape':
            event.preventDefault();
            setIsFullscreen(false);
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
            if (num < images.length) {
              setCurrentIndex(num);
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, nextImage, prevImage, images.length]);

  if (!images || images.length === 0) {
    return (
      <div className="relative h-[60vh] md:h-[70vh] bg-muted rounded-2xl overflow-hidden flex items-center justify-center">
        <span className="text-muted-foreground text-lg">No images available</span>
      </div>
    );
  }

  return (
    <>
      <div className="relative animate-fade-in">
        {/* Main large image with enhanced hover effects - Mobile Optimized */}
        <div 
          className="relative h-[60vh] md:h-[70vh] bg-muted rounded-2xl overflow-hidden cursor-pointer group shadow-elegant"
          onClick={() => openFullscreen(0)}
        >
          <Image
            src={getImageKitUrl(images[0], 1200, 800, 90)}
            alt={`${title} - Main view`}
            fill
            className="object-cover transition-all duration-500 group-hover:scale-110"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Enhanced overlay with expand icon */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="bg-white/20 backdrop-blur-md rounded-full p-3 md:p-4 text-white transform scale-90 group-hover:scale-100 transition-transform duration-300">
              <Maximize2 className="h-6 w-6 md:h-8 md:w-8" />
            </div>
          </div>
          
          {/* Enhanced photo counter */}
          <div className="absolute bottom-4 md:bottom-6 right-4 md:right-6 bg-black/70 text-white px-3 md:px-4 py-1 md:py-2 rounded-full backdrop-blur-md flex items-center gap-2">
            <Grid3X3 className="h-3 w-3 md:h-4 md:w-4" />
            <span className="font-medium text-sm md:text-base">{images.length} photos</span>
          </div>

          {/* Keyboard hint - Hidden on mobile */}
          <div className="absolute top-4 md:top-6 left-4 md:left-6 bg-white/20 backdrop-blur-md text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block">
            Click to view gallery
          </div>
        </div>

        {/* Enhanced thumbnail grid - Mobile Optimized */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-4 md:mt-6">
          {images.slice(1, 5).map((image, index) => (
            <div
              key={index + 1}
              className="relative h-20 md:h-24 lg:h-32 bg-muted rounded-xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-lg transition-all duration-300"
              onClick={() => openFullscreen(index + 1)}
            >
              <Image
                src={getImageKitUrl(image, 400, 300, 85)}
                alt={`${title} - View ${index + 2}`}
                fill
                className="object-cover transition-all duration-300 group-hover:scale-110"
                sizes="(max-width: 64em) 25vw, 16vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/30 backdrop-blur-sm rounded-full p-1 md:p-2">
                  <Maximize2 className="h-3 w-3 md:h-4 md:w-4 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Fullscreen Gallery Modal - Mobile Optimized */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-screen-xl max-h-screen w-screen h-screen p-0 bg-black/98 backdrop-blur-sm">
          <DialogTitle className="sr-only">Property Gallery - {title}</DialogTitle>
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Enhanced close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 md:top-6 right-4 md:right-6 z-50 text-white hover:bg-white/20 transition-all duration-300 rounded-full backdrop-blur-sm"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="h-5 w-5 md:h-6 md:w-6" />
            </Button>

            {/* Enhanced navigation buttons */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 transition-all duration-300 rounded-full backdrop-blur-sm disabled:opacity-50"
              onClick={prevImage}
              disabled={images.length <= 1}
            >
              <ChevronLeft className="h-8 w-8 md:h-10 md:w-10" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 transition-all duration-300 rounded-full backdrop-blur-sm disabled:opacity-50"
              onClick={nextImage}
              disabled={images.length <= 1}
            >
              <ChevronRight className="h-8 w-8 md:h-10 md:w-10" />
            </Button>

            {/* Main image with loading state */}
            <div className="relative max-w-full max-h-full flex items-center justify-center px-4 md:px-8">
              <Image
                src={getImageKitUrl(images[currentIndex], 1920, 1080, 95)}
                alt={`${title} - View ${currentIndex + 1}`}
                width={1920}
                height={1080}
                className="max-w-full max-h-full object-contain transition-opacity duration-300 rounded-lg shadow-2xl"
                onLoad={() => setIsLoading(false)}
                onLoadStart={() => setIsLoading(true)}
                priority
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                  <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>

            {/* Enhanced image counter and navigation */}
            <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
              <div className="bg-black/70 text-white px-4 md:px-6 py-2 md:py-3 rounded-full backdrop-blur-md font-medium text-sm md:text-base">
                {currentIndex + 1} of {images.length}
              </div>
            </div>


            {/* Thumbnail strip - Mobile Optimized */}
            <div className="absolute bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 flex gap-2 max-w-xs md:max-w-md overflow-x-auto scrollbar-hide px-4">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`relative w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 flex-shrink-0 ${
                    index === currentIndex
                      ? 'ring-2 ring-white shadow-lg scale-110'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  onClick={() => setCurrentIndex(index)}
                >
                  <Image
                    src={getImageKitUrl(image, 200, 200, 80)}
                    alt={`Thumbnail ${index + 1}`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
