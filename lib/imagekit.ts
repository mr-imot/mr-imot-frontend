import { buildSrc, type Transformation } from "@imagekit/next"

const IK_ENDPOINT = "https://ik.imagekit.io/ts59gf2ul"

export const IK_URL_ENDPOINT = IK_ENDPOINT

/**
 * Normalize an ImageKit URL or path to a path that works with ImageKitProvider.
 * Accepts full https://ik.imagekit.io/ts59gf2ul/... URLs, or already-normalized paths.
 */
export function toIkPath(url: string | null | undefined): string {
  if (!url) return ""
  // Strip query params and leading endpoint if present
  const withoutQuery = url.split("?")[0]
  const matchedDomain = /^https?:\/\/ik\.imagekit\.io\/[^/]+/i.test(withoutQuery)
  if (!matchedDomain) {
    // Non-ImageKit URLs should be returned untouched
    return withoutQuery
  }
  const withoutDomain = withoutQuery.replace(/^https?:\/\/ik\.imagekit\.io\/[^/]+/i, "")
  if (withoutDomain.startsWith("/")) return withoutDomain
  return `/${withoutDomain}`
}

/**
 * Build a social/OG-safe URL using ImageKit SDK utilities.
 * Consumers can pass this to openGraph/twitter metadata.
 */
export function buildSocialPath(path: string, opts?: { width?: number; height?: number; quality?: number }) {
  const width = opts?.width ?? 1200
  const height = opts?.height ?? 630
  const quality = opts?.quality ?? 85
  return {
    src: toIkPath(path),
    transformation: [
      {
        width,
        height,
        quality,
        format: "webp",
        focus: "auto",
      },
    ],
  }
}

export function buildIkUrl(src: string, transformation?: Transformation[]) {
  return buildSrc({
    urlEndpoint: IK_URL_ENDPOINT,
    src: toIkPath(src),
    transformationPosition: "path",
    transformation,
  })
}
 /**
 * ImageKit Utilities
 * 
 * Centralized configuration and helpers for ImageKit image optimization.
 * Uses the @imagekit/next SDK for URL generation and transformations.
 */

import { buildSrc, Transformation } from '@imagekit/next';

export const IMAGEKIT_URL_ENDPOINT = 'https://ik.imagekit.io/ts59gf2ul';

/**
 * Preset transformations for common use cases across the app.
 * These ensure consistent image quality and dimensions.
 */
export const IMAGE_PRESETS = {
  // Hero section images (desktop) - display size ~400-500px wide for proper visibility
  // Aggressive compression for LCP (quality 20)
  hero: [{ width: 450, quality: 20, format: 'auto' }] as Transformation[],
  // Hero section images (mobile) - display size 115px wide
  // Max compression for mobile LCP (quality 20)
  heroMobile: [{ width: 115, quality: 20, format: 'auto' }] as Transformation[],
  // Listing cards in grids - desktop (~372x240 displayed)
  // Lower quality (60) acceptable for small cards, format auto for WebP/AVIF
  card: [{ width: 400, height: 260, quality: 60, format: 'auto' }] as Transformation[],
  // Mobile full-width cards (651x488 displayed)
  // Optimized for mobile - smaller dimensions, lower quality
  cardMobile: [{ width: 600, height: 450, quality: 55, format: 'auto' }] as Transformation[],
  // Small thumbnails - aggressive compression acceptable
  thumbnail: [{ width: 128, height: 128, quality: 50, format: 'auto' }] as Transformation[],
  // Gallery main images - balanced quality for detail viewing
  gallery: [{ width: 1200, height: 800, quality: 75, format: 'auto' }] as Transformation[],
  // Gallery mobile images - optimized for mobile performance
  // Reduced from 800x600 q80 to 480x360 q55 for ~60% smaller files
  galleryMobile: [{ width: 480, height: 360, quality: 55, format: 'auto' }] as Transformation[],
  // Gallery mobile hero (first image) - slightly better quality for LCP
  galleryMobileHero: [{ width: 600, height: 450, quality: 60, format: 'auto' }] as Transformation[],
  // Gallery thumbnails
  galleryThumbnail: [{ width: 100, height: 70, quality: 50, format: 'auto' }] as Transformation[],
  // Fullscreen/lightbox images - highest quality (on-demand)
  fullscreen: [{ quality: 85, format: 'auto' }] as Transformation[],
  // Developer join section mascot - NO height constraint, max compression
  // Width 400px for better visibility, quality 20 for aggressive compression
  mascot: [{ width: 400, quality: 20, format: 'auto' }] as Transformation[],
  // About page dashboard
  dashboard: [{ width: 1920, height: 1200, quality: 80, format: 'auto' }] as Transformation[],
  // Social sharing / OG images - keep higher quality for social previews
  social: [{ width: 1200, height: 630, quality: 75, format: 'auto' }] as Transformation[],
} as const;

/**
 * Generate an optimized ImageKit URL for non-component contexts.
 * Use this for:
 * - OG/social images in metadata
 * - CSS background images
 * - Any place where you can't use the Image component
 * 
 * @param src - The image path (relative to urlEndpoint) or full ImageKit URL
 * @param transformation - Array of transformation objects
 * @returns Fully qualified ImageKit URL with transformations
 * 
 * @example
 * // Using relative path
 * getImageUrl('/Logo/mascot.png', IMAGE_PRESETS.hero)
 * 
 * // Using full URL (will extract path)
 * getImageUrl('https://ik.imagekit.io/ts59gf2ul/Logo/mascot.png', [{ width: 200 }])
 */
export function getImageUrl(src: string, transformation?: Transformation[]): string {
  if (!src) return '';
  
  // Extract path from full ImageKit URL if provided
  const imagePath = extractImagePath(src);
  
  return buildSrc({
    urlEndpoint: IMAGEKIT_URL_ENDPOINT,
    src: imagePath,
    transformation,
  });
}

/**
 * Extract the image path from a full ImageKit URL.
 * Handles URLs with transformations in query params OR path format.
 * 
 * @param url - Full ImageKit URL or relative path
 * @returns The clean image path (starting with /, no transformations)
 * 
 * @example
 * // Query-based transformations
 * extractImagePath('https://ik.imagekit.io/ts59gf2ul/Logo/image.png?tr=w-100')
 * // Returns: '/Logo/image.png'
 * 
 * // Path-based transformations (from backend)
 * extractImagePath('https://ik.imagekit.io/ts59gf2ul/tr:h-600,w-800/Logo/image.png')
 * // Returns: '/Logo/image.png'
 */
export function extractImagePath(url: string): string {
  if (!url) return '';
  
  // If it's already a relative path, clean it up
  if (url.startsWith('/') && !url.includes('://')) {
    // Remove query parameters and path-based transformations
    let path = url.split('?')[0];
    // Remove path-based transformation prefix like /tr:h-600,w-800/
    path = path.replace(/^\/tr:[^/]+\//, '/');
    return path;
  }
  
  // If it's not an ImageKit URL, return as-is
  if (!url.includes('imagekit.io')) {
    return url;
  }
  
  try {
    // Parse the URL and extract the pathname after the ImageKit ID
    const urlObj = new URL(url);
    let pathname = urlObj.pathname;
    
    // The pathname format is: /imagekit_id/path/to/image.ext
    // OR with transformations: /imagekit_id/tr:h-600,w-800/path/to/image.ext
    const parts = pathname.split('/').filter(Boolean);
    
    if (parts.length > 1) {
      // Skip the first part (imagekit_id)
      let pathParts = parts.slice(1);
      
      // If second part starts with 'tr:' (transformation), skip it too
      if (pathParts[0]?.startsWith('tr:')) {
        pathParts = pathParts.slice(1);
      }
      
      return '/' + pathParts.join('/');
    }
    
    return pathname;
  } catch {
    // If URL parsing fails, try regex extraction
    // Handle both: imagekit.io/id/path and imagekit.io/id/tr:xxx/path
    const match = url.match(/imagekit\.io\/[^/]+(?:\/tr:[^/]+)?(.+?)(?:\?|$)/);
    return match ? match[1] : url;
  }
}

/**
 * Check if a URL is an ImageKit URL.
 * 
 * @param url - URL to check
 * @returns true if it's an ImageKit URL
 */
export function isImageKitUrl(url: string): boolean {
  return url?.includes('imagekit.io') ?? false;
}

/**
 * Generate a Low Quality Image Placeholder (LQIP) URL.
 * Creates a tiny (~200-500 bytes) blurred version of the image
 * that can be shown while the full image loads.
 * 
 * @param src - The image path (relative to urlEndpoint) or full ImageKit URL
 * @returns Fully qualified ImageKit URL with LQIP transformations
 * 
 * @example
 * getLqipUrl('/properties/image.jpg')
 * // Returns: 'https://ik.imagekit.io/ts59gf2ul/properties/image.jpg?tr=w-20,q-10,bl-90'
 */
export function getLqipUrl(src: string): string {
  if (!src) return '';
  
  const imagePath = extractImagePath(src);
  
  return buildSrc({
    urlEndpoint: IMAGEKIT_URL_ENDPOINT,
    src: imagePath,
    transformation: [{ width: 20, quality: 10, blur: 90 }],
  });
}

