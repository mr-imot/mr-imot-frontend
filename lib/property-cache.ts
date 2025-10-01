// Airbnb-quality property caching system
// Three-tier caching: Session Cache + localStorage + Smart API calls

import { PropertyData } from './marker-manager'

interface CacheEntry {
  data: PropertyData[]
  timestamp: number
  city: string
  propertyType: string
}

interface CacheConfig {
  sessionDuration: number // 2 hours
  localStorageDuration: number // 24 hours
  backgroundRefreshInterval: number // 3 minutes
}

const CACHE_CONFIG: CacheConfig = {
  sessionDuration: 2 * 60 * 60 * 1000, // 2 hours
  localStorageDuration: 24 * 60 * 60 * 1000, // 24 hours
  backgroundRefreshInterval: 3 * 60 * 1000, // 3 minutes
}

class PropertyCacheManager {
  private sessionCache = new Map<string, CacheEntry>()
  private lastRefreshTimes = new Map<string, number>()
  private backgroundRefreshTimer: NodeJS.Timeout | null = null

  // Generate cache key
  private getCacheKey(city: string, propertyType: string): string {
    return `${city}-${propertyType}`
  }

  // Check if cache entry is valid
  private isCacheValid(entry: CacheEntry, maxAge: number): boolean {
    return Date.now() - entry.timestamp < maxAge
  }

  // Get data from session cache (fastest)
  getFromSessionCache(city: string, propertyType: string): PropertyData[] | null {
    const key = this.getCacheKey(city, propertyType)
    const entry = this.sessionCache.get(key)
    
    if (entry && this.isCacheValid(entry, CACHE_CONFIG.sessionDuration)) {
      return entry.data
    }
    
    return null
  }

  // Get data from localStorage (fast)
  getFromLocalStorage(city: string, propertyType: string): PropertyData[] | null {
    try {
      const key = `properties-${this.getCacheKey(city, propertyType)}`
      const stored = localStorage.getItem(key)
      
      if (stored) {
        const entry: CacheEntry = JSON.parse(stored)
        if (this.isCacheValid(entry, CACHE_CONFIG.localStorageDuration)) {
          return entry.data
        } else {
          // Remove expired entry
          localStorage.removeItem(key)
        }
      }
    } catch (error) {
      console.warn('Failed to read from localStorage:', error)
    }
    
    return null
  }

  // Get cached data (tries session first, then localStorage)
  getCachedData(city: string, propertyType: string): PropertyData[] | null {
    // Try session cache first (fastest)
    const sessionData = this.getFromSessionCache(city, propertyType)
    if (sessionData) {
      return sessionData
    }

    // Try localStorage (fast)
    const localStorageData = this.getFromLocalStorage(city, propertyType)
    if (localStorageData) {
      // Promote to session cache for faster future access
      this.setSessionCache(city, propertyType, localStorageData)
      return localStorageData
    }

    return null
  }

  // Set session cache
  setSessionCache(city: string, propertyType: string, data: PropertyData[]): void {
    const key = this.getCacheKey(city, propertyType)
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      city,
      propertyType
    }
    this.sessionCache.set(key, entry)
  }

  // Set localStorage cache
  setLocalStorageCache(city: string, propertyType: string, data: PropertyData[]): void {
    try {
      const key = `properties-${this.getCacheKey(city, propertyType)}`
      const entry: CacheEntry = {
        data,
        timestamp: Date.now(),
        city,
        propertyType
      }
      localStorage.setItem(key, JSON.stringify(entry))
      console.log(`💾 Stored in localStorage: ${key} (${data.length} properties)`)
    } catch (error) {
      console.warn('Failed to write to localStorage:', error)
    }
  }

  // Set data in both caches
  setCacheData(city: string, propertyType: string, data: PropertyData[]): void {
    this.setSessionCache(city, propertyType, data)
    this.setLocalStorageCache(city, propertyType, data)
    this.lastRefreshTimes.set(this.getCacheKey(city, propertyType), Date.now())
  }

  // Check if data needs background refresh
  needsBackgroundRefresh(city: string, propertyType: string): boolean {
    const key = this.getCacheKey(city, propertyType)
    const lastRefresh = this.lastRefreshTimes.get(key) || 0
    return Date.now() - lastRefresh > CACHE_CONFIG.backgroundRefreshInterval
  }

  // Start background refresh for active city
  startBackgroundRefresh(
    city: string, 
    propertyType: string, 
    fetchFunction: () => Promise<PropertyData[]>
  ): void {
    if (this.backgroundRefreshTimer) {
      clearInterval(this.backgroundRefreshTimer)
    }

    this.backgroundRefreshTimer = setInterval(async () => {
      if (this.needsBackgroundRefresh(city, propertyType)) {
        try {
          console.log(`🔄 Background refresh for ${city} ${propertyType}`)
          const freshData = await fetchFunction()
          this.setCacheData(city, propertyType, freshData)
          
          // Emit event for UI to update
          window.dispatchEvent(new CustomEvent('propertyCacheUpdated', {
            detail: { city, propertyType, data: freshData }
          }))
        } catch (error) {
          console.warn('Background refresh failed:', error)
        }
      }
    }, CACHE_CONFIG.backgroundRefreshInterval)
  }

  // Stop background refresh
  stopBackgroundRefresh(): void {
    if (this.backgroundRefreshTimer) {
      clearInterval(this.backgroundRefreshTimer)
      this.backgroundRefreshTimer = null
    }
  }

  // Clear all caches
  clearAllCaches(): void {
    this.sessionCache.clear()
    this.lastRefreshTimes.clear()
    
    // Clear localStorage
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('properties-')) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn('Failed to clear localStorage:', error)
    }
  }

  // Clear cache for specific city/type
  clearCache(city: string, propertyType: string): void {
    const key = this.getCacheKey(city, propertyType)
    this.sessionCache.delete(key)
    this.lastRefreshTimes.delete(key)
    
    try {
      const localStorageKey = `properties-${key}`
      localStorage.removeItem(localStorageKey)
    } catch (error) {
      console.warn('Failed to clear localStorage:', error)
    }
  }

  // Get cache statistics (for debugging)
  getCacheStats(): {
    sessionCacheSize: number
    localStorageKeys: string[]
    lastRefreshTimes: Record<string, number>
  } {
    const localStorageKeys: string[] = []
    try {
      const keys = Object.keys(localStorage)
      localStorageKeys.push(...keys.filter(key => key.startsWith('properties-')))
    } catch (error) {
      console.warn('Failed to read localStorage keys:', error)
    }

    return {
      sessionCacheSize: this.sessionCache.size,
      localStorageKeys,
      lastRefreshTimes: Object.fromEntries(this.lastRefreshTimes)
    }
  }
}

// Export singleton instance
export const propertyCache = new PropertyCacheManager()

// Export types
export type { CacheEntry, CacheConfig }

