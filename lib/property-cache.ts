// Airbnb-style bounds-based property caching system
// Cache keys = map bounds + property type
// Uses sessionStorage with TTL (2-5 minutes)

import { PropertyData } from './marker-manager'

interface BoundsCacheEntry {
  data: PropertyData[]
  timestamp: number
  boundsKey: string
  propertyType: string
}

interface CacheConfig {
  ttl: number // Time to live in milliseconds (2-5 minutes)
}

const CACHE_CONFIG: CacheConfig = {
  ttl: 30 * 60 * 1000, // 30 minutes – longer TTL reduces refetches; background refresh keeps data fresh
}

// Generate cache key from bounds and property type
function getBoundsCacheKey(
  sw_lat: number,
  sw_lng: number,
  ne_lat: number,
  ne_lng: number,
  propertyType: string
): string {
  // Round bounds to 0.05° precision (~5km tiles)
  // This ensures cache hits when returning to the same general area
  // Small pans within 5km will hit the same cache entry
  const rounded = {
    sw_lat: Math.round(sw_lat * 20) / 20,
    sw_lng: Math.round(sw_lng * 20) / 20,
    ne_lat: Math.round(ne_lat * 20) / 20,
    ne_lng: Math.round(ne_lng * 20) / 20,
  }
  return `bounds-${rounded.sw_lat}-${rounded.sw_lng}-${rounded.ne_lat}-${rounded.ne_lng}-${propertyType}`
}

class BoundsBasedCacheManager {
  private sessionCache = new Map<string, BoundsCacheEntry>()

  // Check if cache entry is valid (not expired)
  private isCacheValid(entry: BoundsCacheEntry): boolean {
    return Date.now() - entry.timestamp < CACHE_CONFIG.ttl
  }

  // Get cached data for bounds + property type
  getCachedEntry(
    sw_lat: number,
    sw_lng: number,
    ne_lat: number,
    ne_lng: number,
    propertyType: string
  ): BoundsCacheEntry | null {
    const key = getBoundsCacheKey(sw_lat, sw_lng, ne_lat, ne_lng, propertyType)
    
    // Try in-memory cache first (fastest)
    const memoryEntry = this.sessionCache.get(key)
    if (memoryEntry && this.isCacheValid(memoryEntry)) {
      return memoryEntry
    }

    // Try sessionStorage
    try {
      const stored = sessionStorage.getItem(key)
      if (stored) {
        const entry: BoundsCacheEntry = JSON.parse(stored)
        if (this.isCacheValid(entry)) {
          // Promote to memory cache for faster access
          this.sessionCache.set(key, entry)
          return entry
        } else {
          // Expired, remove it
          sessionStorage.removeItem(key)
        }
      }
    } catch (error) {
      console.warn('Failed to read from sessionStorage:', error)
    }

    return null
  }

  // Get cached data for bounds + property type
  getCachedData(
    sw_lat: number,
    sw_lng: number,
    ne_lat: number,
    ne_lng: number,
    propertyType: string
  ): PropertyData[] | null {
    const entry = this.getCachedEntry(sw_lat, sw_lng, ne_lat, ne_lng, propertyType)
    return entry ? entry.data : null
  }

  isEntryStale(entry: BoundsCacheEntry, staleMs: number): boolean {
    return Date.now() - entry.timestamp > staleMs
  }

  // Set cached data for bounds + property type
  setCachedData(
    sw_lat: number,
    sw_lng: number,
    ne_lat: number,
    ne_lng: number,
    propertyType: string,
    data: PropertyData[]
  ): void {
    const key = getBoundsCacheKey(sw_lat, sw_lng, ne_lat, ne_lng, propertyType)
    const entry: BoundsCacheEntry = {
      data,
      timestamp: Date.now(),
      boundsKey: key,
      propertyType,
    }

    // Store in memory
    this.sessionCache.set(key, entry)

    // Store in sessionStorage
    try {
      sessionStorage.setItem(key, JSON.stringify(entry))
    } catch (error) {
      console.warn('Failed to write to sessionStorage:', error)
      // If sessionStorage is full, clear oldest entries
      this.cleanupOldEntries()
    }
  }

  // Check if cache exists and is valid
  hasCachedData(
    sw_lat: number,
    sw_lng: number,
    ne_lat: number,
    ne_lng: number,
    propertyType: string
  ): boolean {
    return this.getCachedData(sw_lat, sw_lng, ne_lat, ne_lng, propertyType) !== null
  }

  // Cleanup expired entries from sessionStorage
  private cleanupOldEntries(): void {
    try {
      const keysToRemove: string[] = []
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && key.startsWith('bounds-')) {
          try {
            const stored = sessionStorage.getItem(key)
            if (stored) {
              const entry: BoundsCacheEntry = JSON.parse(stored)
              if (!this.isCacheValid(entry)) {
                keysToRemove.push(key)
              }
            }
          } catch {
            keysToRemove.push(key)
          }
        }
      }
      keysToRemove.forEach(key => {
        sessionStorage.removeItem(key)
        this.sessionCache.delete(key)
      })
    } catch (error) {
      console.warn('Failed to cleanup old entries:', error)
    }
  }

  // Clear all caches (use sparingly)
  clearAllCaches(): void {
    this.sessionCache.clear()
    try {
      const keysToRemove: string[] = []
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && key.startsWith('bounds-')) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => sessionStorage.removeItem(key))
    } catch (error) {
      console.warn('Failed to clear sessionStorage:', error)
    }
  }

  // Get cache statistics (for debugging)
  getCacheStats(): {
    memoryCacheSize: number
    sessionStorageKeys: string[]
  } {
    const sessionStorageKeys: string[] = []
    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && key.startsWith('bounds-')) {
          sessionStorageKeys.push(key)
        }
      }
    } catch (error) {
      console.warn('Failed to read sessionStorage keys:', error)
    }

    return {
      memoryCacheSize: this.sessionCache.size,
      sessionStorageKeys,
    }
  }
}

// Export singleton instance
export const boundsCache = new BoundsBasedCacheManager()

// Export types
export type { BoundsCacheEntry, CacheConfig }
