/**
 * MapFetchController – Debounced, throttled, cancellation-aware map fetch controller
 *
 * Key features:
 * 1. Debounce: 600ms – waits for user to stop moving
 * 2. Throttle: max 1 request every 1500ms
 * 3. Abort: cancels previous in-flight request when new one starts
 * 4. Cache-first: checks boundsCache before network
 * 5. Metrics: tracks calls, cache hits/misses, durations
 */

import { boundsCache } from './property-cache'
import { getProjects } from './api'
import { PropertyData } from './marker-manager'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export type PropertyTypeFilter = 'all' | 'apartments' | 'houses'

export interface FetchMetrics {
  calls: number
  cacheHits: number
  cacheMisses: number
  aborted: number
  lastDurationMs: number
}

export interface MapFetchControllerConfig {
  debounceMs?: number      // default 600
  throttleMs?: number      // default 1500
  cacheTtlMs?: number      // default 30 * 60 * 1000 (30 min)
  onDataUpdate: (properties: PropertyData[], requestId?: number) => void
  onLoadingChange?: (isLoading: boolean) => void
  onError?: (err: Error) => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Controller
// ─────────────────────────────────────────────────────────────────────────────
export class MapFetchController {
  private debounceMs: number
  private throttleMs: number
  private cacheTtlMs: number

  private onDataUpdate: (properties: PropertyData[]) => void
  private onLoadingChange?: (isLoading: boolean) => void
  private onError?: (err: Error) => void

  private debounceTimer: ReturnType<typeof setTimeout> | null = null
  private lastFetchTime = 0
  private abortController: AbortController | null = null
  private pendingBounds: {
    sw_lat: number
    sw_lng: number
    ne_lat: number
    ne_lng: number
    propertyType: PropertyTypeFilter
    page?: number
    per_page?: number
  } | null = null
  
  // Hard deduplication: track last successful fetch and in-flight requests
  // Using normalized keys (toFixed(3)) to prevent jitter from creating "new" requests
  private lastKey: string | null = null
  private inFlightKey: string | null = null
  
  // Request ID counter for preventing stale overwrites
  private requestIdCounter = 0

  public metrics: FetchMetrics = {
    calls: 0,
    cacheHits: 0,
    cacheMisses: 0,
    aborted: 0,
    lastDurationMs: 0,
  }

  constructor(config: MapFetchControllerConfig) {
    this.debounceMs = config.debounceMs ?? 600
    this.throttleMs = config.throttleMs ?? 1500
    this.cacheTtlMs = config.cacheTtlMs ?? 30 * 60 * 1000
    this.onDataUpdate = config.onDataUpdate
    this.onLoadingChange = config.onLoadingChange
    this.onError = config.onError
  }

  /**
   * Schedule a fetch for given bounds + property type.
   * Debounced + throttled. Cache-first.
   */
  schedule(
    sw_lat: number,
    sw_lng: number,
    ne_lat: number,
    ne_lng: number,
    propertyType: PropertyTypeFilter,
    options?: { immediate?: boolean; page?: number; per_page?: number }
  ): void {
    // Guard: Reject zero-sized or invalid bounds (map not ready)
    const latDiff = Math.abs(ne_lat - sw_lat)
    const lngDiff = Math.abs(ne_lng - sw_lng)
    if (latDiff < 0.001 || lngDiff < 0.001) {
      return
    }

    // Store pending bounds with pagination
    this.pendingBounds = { 
      sw_lat, 
      sw_lng, 
      ne_lat, 
      ne_lng, 
      propertyType,
      page: options?.page,
      per_page: options?.per_page
    }

    // Clear existing debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }

    if (options?.immediate) {
      // Bypass throttle for immediate requests (city change, filter change)
      this.executeScheduled(true)
      return
    }

    // Debounce
    this.debounceTimer = setTimeout(() => {
      this.executeScheduled()
    }, this.debounceMs)
  }

  /**
   * Cancel any pending/in-flight requests
   */
  cancel(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
      this.metrics.aborted++
    }
    this.pendingBounds = null
  }

  /**
   * Force flush any pending request (useful on unmount)
   */
  flush(): void {
    if (this.pendingBounds) {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer)
        this.debounceTimer = null
      }
      this.executeScheduled()
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Private
  // ───────────────────────────────────────────────────────────────────────────

  private async executeScheduled(skipThrottle: boolean = false): Promise<void> {
    if (!this.pendingBounds) return

    const { sw_lat, sw_lng, ne_lat, ne_lng, propertyType, page, per_page } = this.pendingBounds
    this.pendingBounds = null
    
    // Increment requestId for this fetch
    const currentRequestId = ++this.requestIdCounter

    // Throttle check (skip for immediate requests like city/filter changes)
    if (!skipThrottle) {
      const now = Date.now()
      const timeSinceLast = now - this.lastFetchTime
      if (timeSinceLast < this.throttleMs) {
        // Re-schedule after remaining throttle time
        this.pendingBounds = { sw_lat, sw_lng, ne_lat, ne_lng, propertyType }
        this.debounceTimer = setTimeout(() => {
          this.executeScheduled()
        }, this.throttleMs - timeSinceLast)
        return
      }
    }

    // ─── Check cache first ───────────────────────────────────────────────────
    // Note: Cache doesn't support pagination, so skip cache if page/per_page is specified
    if (!page && !per_page) {
      const cacheKey = `${sw_lat.toFixed(3)},${sw_lng.toFixed(3)},${ne_lat.toFixed(3)},${ne_lng.toFixed(3)},${propertyType}`
      const cached = boundsCache.getCachedData(sw_lat, sw_lng, ne_lat, ne_lng, propertyType)
      if (cached && cached.length > 0) {
        this.metrics.cacheHits++
        console.debug('[MapFetch]', { 
          bounds: { sw_lat, sw_lng, ne_lat, ne_lng }, 
          fromCache: true, 
          requestId: currentRequestId,
          propertyCount: cached.length
        })
        this.onDataUpdate(cached, currentRequestId)
        // Background refresh (fire and forget, don't block)
        this.backgroundFetch(sw_lat, sw_lng, ne_lat, ne_lng, propertyType, page, per_page)
        return
      }
    }

    this.metrics.cacheMisses++

    // ─── Network fetch ───────────────────────────────────────────────────────
    console.debug('[MapFetch]', { 
      bounds: { sw_lat, sw_lng, ne_lat, ne_lng }, 
      fromCache: false, 
      requestId: currentRequestId 
    })
    await this.networkFetch(sw_lat, sw_lng, ne_lat, ne_lng, propertyType, page, per_page, currentRequestId)
  }

  private async networkFetch(
    sw_lat: number,
    sw_lng: number,
    ne_lat: number,
    ne_lng: number,
    propertyType: PropertyTypeFilter,
    page?: number,
    per_page?: number,
    requestId?: number
  ): Promise<void> {
    // Hard deduplication: create normalized key to prevent duplicate requests
    // toFixed(3) prevents tiny bound jitter from creating "new" requests
    const key = `${sw_lat.toFixed(3)}:${sw_lng.toFixed(3)}:${ne_lat.toFixed(3)}:${ne_lng.toFixed(3)}:${propertyType}`
    
    // Skip if this is an exact duplicate of the last successful fetch
    if (key === this.lastKey) {
      return
    }
    
    // Skip if this request is already in flight
    if (key === this.inFlightKey) {
      return
    }
    
    // Mark this request as in-flight
    this.inFlightKey = key
    
    // Abort previous request (if different key)
    if (this.abortController) {
      this.abortController.abort()
      this.metrics.aborted++
    }
    this.abortController = new AbortController()
    const signal = this.abortController.signal

    this.metrics.calls++
    this.lastFetchTime = Date.now()
    this.onLoadingChange?.(true)

    const start = performance.now()

    try {
      const params: Record<string, unknown> = {
        per_page: per_page || 100,
        sw_lat,
        sw_lng,
        ne_lat,
        ne_lng,
      }
      if (page) {
        params.page = page
      }
      if (propertyType !== 'all') {
        params.project_type = propertyType === 'apartments' ? 'apartment_building' : 'house_complex'
      }

      // Note: getProjects doesn't currently support AbortSignal, but we track aborts internally
      const data: any = await getProjects(params)

      // Check if aborted while waiting
      if (signal.aborted) return

      const mapped = this.mapProjects(data.projects || [])

      // Store in cache (only if no pagination - cache is for full bounds results)
      if (!page && !per_page) {
        boundsCache.setCachedData(sw_lat, sw_lng, ne_lat, ne_lng, propertyType, mapped)
      }

      this.metrics.lastDurationMs = Math.round(performance.now() - start)
      this.onDataUpdate(mapped, requestId)
      
      // Mark this key as successfully fetched
      this.lastKey = key
    } catch (err: any) {
      if (err?.name === 'AbortError' || signal.aborted) {
        // Aborted, ignore
        return
      }
      console.error('[MapFetchController] Network fetch failed:', err)
      this.onError?.(err)
    } finally {
      this.onLoadingChange?.(false)
      // Clear in-flight key if this was the current request
      if (this.inFlightKey === key) {
        this.inFlightKey = null
      }
    }
  }

  private async backgroundFetch(
    sw_lat: number,
    sw_lng: number,
    ne_lat: number,
    ne_lng: number,
    propertyType: PropertyTypeFilter,
    page?: number,
    per_page?: number
  ): Promise<void> {
    // Lightweight background refresh — no loading state, no abort tracking
    try {
      const params: Record<string, unknown> = {
        per_page: per_page || 100,
        sw_lat,
        sw_lng,
        ne_lat,
        ne_lng,
      }
      if (page) {
        params.page = page
      }
      if (propertyType !== 'all') {
        params.project_type = propertyType === 'apartments' ? 'apartment_building' : 'house_complex'
      }

      const data: any = await getProjects(params)
      const mapped = this.mapProjects(data.projects || [])

      // Update cache silently (only if no pagination)
      if (!page && !per_page) {
        boundsCache.setCachedData(sw_lat, sw_lng, ne_lat, ne_lng, propertyType, mapped)
      }

      // Update UI (no requestId for background refresh - it's fire and forget)
      this.onDataUpdate(mapped)
    } catch (err) {
      // Fail silently for background refresh
      console.warn('[MapFetchController] Background refresh failed:', err)
    }
  }

  private mapProjects(projects: any[]): PropertyData[] {
    return projects.map((project: any) => {
      const fullSlug = project.slug ? String(project.slug) : String(project.id)
      return {
        id: String(project.id),
        slug: fullSlug,
        title: project.title || project.name || 'Project',
        priceRange: project.price_label ? `${project.price_label}` : 'Price on request',
        shortPrice: project.price_label || 'Request price',
        location: project.neighborhood ? `${project.neighborhood}, ${project.city}` : project.city,
        image: project.cover_image_url || '/placeholder.svg?height=300&width=400',
        images: Array.isArray(project.images)
          ? project.images.map((img: any) => img?.urls?.card || img?.image_url).filter(Boolean)
          : [],
        description: project.description || '',
        lat: typeof project.latitude === 'number' ? project.latitude : 42.6977,
        lng: typeof project.longitude === 'number' ? project.longitude : 23.3219,
        color: 'from-blue-500 to-blue-700',
        type: project.project_type === 'apartment_building' ? 'Apartment Complex' : 'Residential Houses',
        status: 'Under Construction',
        developer: project.developer?.company_name || 'Unknown Developer',
        completionDate: project.expected_completion_date
          ? new Date(project.expected_completion_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
            })
          : 'TBD',
        features:
          project.amenities_list && project.amenities_list.length > 0
            ? project.amenities_list
            : ['Modern Design', 'Quality Construction'],
        originalPrice: undefined,
      }
    })
  }

  /**
   * Get a summary of fetch metrics (for debug panel)
   */
  getMetricsSummary(): string {
    const { calls, cacheHits, cacheMisses, aborted, lastDurationMs } = this.metrics
    const hitRate = calls > 0 ? Math.round((cacheHits / (cacheHits + cacheMisses)) * 100) : 0
    return `Calls: ${calls} | Hits: ${cacheHits} | Misses: ${cacheMisses} | Aborted: ${aborted} | Last: ${lastDurationMs}ms | HitRate: ${hitRate}%`
  }
}

