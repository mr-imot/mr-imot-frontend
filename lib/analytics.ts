/**
 * Analytics v2 - Event queue system with batching and session tracking
 * 
 * Features:
 * - Batches events (20 max, or flush every 2 seconds)
 * - Session cookie management (1 year expiry)
 * - Guaranteed delivery on page unload (sendBeacon / fetch keepalive)
 * - Public flushNow() for manual flushing
 */

interface AnalyticsEvent {
  project_id: string
  type: 'detail_view' | 'click_phone' | 'click_website'
  ts: string  // ISO8601
}

class AnalyticsQueue {
  private events: AnalyticsEvent[] = []
  private flushTimer: NodeJS.Timeout | null = null
  private readonly BATCH_SIZE = 20
  private readonly FLUSH_DELAY = 2000  // 2 seconds
  
  track(event: AnalyticsEvent) {
    this.events.push(event)
    
    if (this.events.length >= this.BATCH_SIZE) {
      this.flushNow()
    } else {
      this.scheduleFlush()
    }
  }
  
  private scheduleFlush() {
    if (this.flushTimer) clearTimeout(this.flushTimer)
    this.flushTimer = setTimeout(() => this.flushNow(), this.FLUSH_DELAY)
  }
  
  // Public method for manual flush (e.g., before navigation)
  public flushNow() {
    if (this.events.length === 0) return
    
    const batch = [...this.events]
    this.events = []
    if (this.flushTimer) {
      clearTimeout(this.flushTimer)
      this.flushTimer = null
    }
    
    const session_id = getSessionId()
    const payload = JSON.stringify({ session_id, events: batch })
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const endpoint = `${apiUrl}/api/v1/analytics/events`
    
    try {
      // Use sendBeacon for guaranteed delivery on page unload
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' })
        navigator.sendBeacon(endpoint, blob)
      } else if (typeof fetch !== 'undefined') {
        // Fallback: fetch with keepalive
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(err => console.warn('Analytics flush failed:', err))
      }
    } catch (error) {
      console.warn('Analytics flush failed:', error)
    }
  }
}

// Session management functions
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null
  }
  return null
}

function setCookie(name: string, value: string, options: {
  maxAge?: number
  path?: string
  sameSite?: 'Strict' | 'Lax' | 'None'
  secure?: boolean
}) {
  if (typeof document === 'undefined') return
  
  let cookie = `${name}=${value}`
  
  if (options.maxAge) {
    cookie += `; Max-Age=${options.maxAge}`
  }
  if (options.path) {
    cookie += `; Path=${options.path}`
  }
  if (options.sameSite) {
    cookie += `; SameSite=${options.sameSite}`
  }
  if (options.secure) {
    cookie += '; Secure'
  }
  
  document.cookie = cookie
}

function getSessionId(): string {
  const COOKIE_NAME = 'mrimot_sid'
  let sessionId = getCookie(COOKIE_NAME)
  
  if (!sessionId) {
    // Generate new session ID
    sessionId = crypto.randomUUID()
    const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    
    setCookie(COOKIE_NAME, sessionId, {
      maxAge: 365 * 24 * 60 * 60,  // 1 year
      path: '/',
      sameSite: 'Lax',
      secure: isProduction,
    })
  }
  
  return sessionId
}

// Singleton instance
export const analyticsQueue = new AnalyticsQueue()

// Convenience functions
export const trackDetailView = (projectId: string) => {
  analyticsQueue.track({
    project_id: projectId,
    type: 'detail_view',
    ts: new Date().toISOString(),
  })
}

export const trackClickPhone = (projectId: string) => {
  analyticsQueue.track({
    project_id: projectId,
    type: 'click_phone',
    ts: new Date().toISOString(),
  })
}

export const trackClickWebsite = (projectId: string) => {
  analyticsQueue.track({
    project_id: projectId,
    type: 'click_website',
    ts: new Date().toISOString(),
  })
}

// Flush on page unload (use sendBeacon or fetch keepalive)
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => {
    analyticsQueue.flushNow()
  })
}
