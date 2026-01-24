# Analytics v2 - Frontend Integration Guide

## Overview

Analytics v2 provides accurate, privacy-friendly tracking of user engagement with property listings. The system uses client-side batching, session cookies, and server-side deduplication to ensure metrics reflect genuine user interest.

---

## Quick Start

### Where Tracking Happens

Analytics events are triggered in **2 places only**:

#### 1. Listing Detail Page
**File:** `app/(public)/[lang]/listings/[id]/listing-detail-client.tsx`

```typescript
const hasTrackedDetailView = useRef(false)

useEffect(() => {
  if (property && projectId && !hasTrackedDetailView.current) {
    trackDetailView(projectId)
    hasTrackedDetailView.current = true
  }
}, [property, projectId])
```

**When it fires:**
- Once per page load
- Guarded against React StrictMode double-mount

---

#### 2. Mobile Modal
**File:** `components/MobileListingModal.tsx`

```typescript
const hasTrackedModalView = useRef(false)

useEffect(() => {
  if (isOpen && property && !hasTrackedModalView.current) {
    trackDetailView(property.id)
    hasTrackedModalView.current = true
  }
  
  // Reset on close for next open
  if (!isOpen) {
    hasTrackedModalView.current = false
  }
}, [isOpen, property])
```

**When it fires:**
- Once per modal open
- Resets when modal closes (next open counts as new view)

---

### Where Tracking Does NOT Happen

✅ **No tracking on:**
- Listing cards in grids
- Listing cards scrolling into view
- Map markers
- Map popups
- Homepage sections

**Why:** We only track when user explicitly views full listing details (high-signal metric).

---

## Event Types

### 1. `detail_view`
User views full listing details (detail page or mobile modal)

**Usage:**
```typescript
import { trackDetailView } from '@/lib/analytics'

trackDetailView(projectId)
```

---

### 2. `click_phone`
User clicks phone number to call developer

**Usage:**
```typescript
import { trackClickPhone } from '@/lib/analytics'

<button onClick={() => trackClickPhone(projectId)}>
  Call Developer
</button>
```

---

### 3. `click_website`
User clicks website link to visit developer's site

**Usage:**
```typescript
import { trackClickWebsite } from '@/lib/analytics'

<a 
  href={website} 
  onClick={() => trackClickWebsite(projectId)}
  target="_blank"
>
  Visit Website
</a>
```

---

## How Batching Works

### The Queue System

**File:** `lib/analytics.ts`

```typescript
class AnalyticsQueue {
  private events: AnalyticsEvent[] = []
  private flushTimer: NodeJS.Timeout | null = null
  private readonly BATCH_SIZE = 20
  private readonly FLUSH_DELAY = 2000  // 2 seconds
  
  track(event: AnalyticsEvent) {
    this.events.push(event)
    
    // Flush immediately if batch is full
    if (this.events.length >= BATCH_SIZE) {
      this.flushNow()
    } else {
      // Schedule flush after 2 seconds
      this.scheduleFlush()
    }
  }
}
```

### When Events are Sent

Events are batched and sent to the backend when:
1. **Batch is full** (20 events) → immediate flush
2. **Timer expires** (2 seconds) → automatic flush
3. **Page unload** (user navigates away) → guaranteed delivery via `sendBeacon`

### Manual Flush

You can manually flush pending events:

```typescript
import { analyticsQueue } from '@/lib/analytics'

// Before navigation or critical action
analyticsQueue.flushNow()
```

**Example use case:**
```typescript
// Flush before programmatic navigation
const handleNavigate = () => {
  analyticsQueue.flushNow()
  router.push('/some-page')
}
```

---

## Session Cookie Logic

### Cookie Details

**Name:** `mrimot_sid`
**Format:** UUID v4 (e.g., `123e4567-e89b-12d3-a456-426614174000`)
**Expiry:** 1 year
**Path:** `/`
**SameSite:** `Lax`
**Secure:** `true` (production only)

### How Sessions Work

```typescript
function getSessionId(): string {
  let sessionId = getCookie('mrimot_sid')
  
  if (!sessionId) {
    // Generate new session ID on first visit
    sessionId = crypto.randomUUID()
    
    setCookie('mrimot_sid', sessionId, {
      maxAge: 365 * 24 * 60 * 60,  // 1 year
      path: '/',
      sameSite: 'Lax',
      secure: isProduction,
    })
  }
  
  return sessionId
}
```

### Session Lifecycle

1. **First Visit:** Cookie created with new UUID
2. **Return Visit:** Existing cookie used (same session)
3. **After 1 Year:** Cookie expires, new session created on next visit
4. **Cleared Cookies:** New session created immediately

**Why 1 year?**
- Tracks repeat visitors over time
- Enables deduplication across multiple days
- Balances privacy (no personal data) with accuracy

---

## Guaranteed Delivery on Page Unload

### The Challenge
When user navigates away, standard `fetch` requests may be cancelled before completing.

### The Solution

```typescript
// Page unload handler
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => {
    analyticsQueue.flushNow()
  })
}
```

**In `flushNow()`:**
```typescript
// Try sendBeacon first (guaranteed delivery)
if (navigator.sendBeacon) {
  const blob = new Blob([payload], { type: 'application/json' })
  navigator.sendBeacon(endpoint, blob)
} else {
  // Fallback: fetch with keepalive
  fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,  // Ensures request completes even after page closes
  })
}
```

**Why `pagehide` instead of `unload`?**
- ✅ `pagehide` fires before page is frozen
- ✅ Compatible with browser back/forward cache (bfcache)
- ❌ `unload` is ignored by modern browsers for bfcache

---

## Testing Locally

### 1. Enable DevTools Network Logging

1. Open DevTools → Network tab
2. Filter for "analytics" or "events"
3. Perform actions (open listing, click phone, etc.)
4. Check for `POST /api/v1/analytics/events` requests

### 2. Inspect Request Payload

**Expected format:**
```json
{
  "session_id": "123e4567-e89b-12d3-a456-426614174000",
  "events": [
    {
      "project_id": "abc-def-...",
      "type": "detail_view",
      "ts": "2026-01-24T10:15:30.123Z"
    }
  ]
}
```

### 3. Inspect Response

**Success response:**
```json
{
  "ok": true,
  "received": 1,
  "accepted": 1,
  "dropped_dedupe": 0,
  "dropped_rate_limited": 0,
  "dropped_invalid": 0
}
```

**Deduplication response (refresh page):**
```json
{
  "ok": true,
  "received": 1,
  "accepted": 0,
  "dropped_dedupe": 1,
  "dropped_rate_limited": 0,
  "dropped_invalid": 0
}
```

### 4. Verify Session Cookie

**Browser Console:**
```javascript
document.cookie.split('; ').find(c => c.startsWith('mrimot_sid='))
// Should return: "mrimot_sid=123e4567-e89b-12d3-a456-426614174000"
```

**DevTools:**
1. Application tab → Cookies
2. Find `mrimot_sid`
3. Value should be a UUID

### 5. Test Deduplication

**Scenario:** Open same listing multiple times

1. Open listing → Check Network tab: `"accepted": 1`
2. Refresh page → Check Network tab: `"accepted": 0, "dropped_dedupe": 1`
3. Wait 30 minutes → Refresh page → Check: `"accepted": 1` (new time bucket)

**Or manually clear Redis key (backend):**
```bash
# Connect to Redis
redis-cli -u $UPSTASH_REDIS_REST_URL

# Delete dedupe key
DEL dv:{session_id}:{project_uuid}:{bucket}

# Next request will count as new view
```

### 6. Test Batching

**Scenario:** Rapid-fire events

```typescript
// In console or test file
import { analyticsQueue, trackDetailView } from '@/lib/analytics'

// Trigger 5 events rapidly
for (let i = 0; i < 5; i++) {
  trackDetailView('some-project-id')
}

// Should see 1 network request with 5 events in payload
```

### 7. Test Page Unload Flush

**Scenario:** Events sent before navigation

1. Open listing (1 event queued)
2. **Immediately** click browser back button
3. Check Network tab → Should see `POST` request with `sendBeacon` or `keepalive`

**Without unload handler:** Event would be lost ❌
**With unload handler:** Event is sent before page closes ✅

---

## Common Issues

### Issue 1: Events Not Firing

**Symptoms:**
- No network requests in DevTools
- Dashboard shows zero views

**Checks:**
1. ✅ Is `trackDetailView()` called? (Add `console.log` before call)
2. ✅ Is `projectId` defined? (Check `property?.id`)
3. ✅ Is `useRef` guard working? (Check `hasTracked.current` value)
4. ✅ Is backend endpoint correct? (Check `NEXT_PUBLIC_API_URL` env var)

**Fix:**
```typescript
// Add debugging
useEffect(() => {
  console.log('Effect ran:', { property, projectId, hasTracked: hasTracked.current })
  
  if (property && projectId && !hasTracked.current) {
    console.log('Tracking detail view:', projectId)
    trackDetailView(projectId)
    hasTracked.current = true
  }
}, [property, projectId])
```

---

### Issue 2: Double Counting in Development

**Symptoms:**
- Events fire twice in dev mode
- Only happens with React StrictMode enabled

**Cause:**
React StrictMode intentionally double-invokes effects to catch side effects.

**Fix (already implemented):**
```typescript
const hasTracked = useRef(false)

useEffect(() => {
  // useRef persists across StrictMode re-runs
  if (!hasTracked.current) {
    trackDetailView(projectId)
    hasTracked.current = true  // Prevents second call
  }
}, [projectId])
```

**Why it works:**
- First StrictMode call: `hasTracked.current = false` → track → set to `true`
- Second StrictMode call: `hasTracked.current = true` → skip tracking

---

### Issue 3: Session Cookie Not Created

**Symptoms:**
- `mrimot_sid` cookie missing in DevTools
- Backend rejects events (400 error: "session_id required")

**Causes:**
1. Browser privacy settings blocking cookies
2. Incorrect domain setting in production
3. Secure flag in development (should be `false`)

**Fix:**
```typescript
const isProduction = 
  typeof window !== 'undefined' && 
  window.location.hostname !== 'localhost'

setCookie('mrimot_sid', sessionId, {
  maxAge: 365 * 24 * 60 * 60,
  path: '/',
  sameSite: 'Lax',
  secure: isProduction,  // false in dev, true in prod
})
```

---

### Issue 4: Events Not Batching

**Symptoms:**
- Every event triggers separate network request
- Expected batching not happening

**Cause:**
Timer not being scheduled correctly, or `BATCH_SIZE` too small.

**Debug:**
```typescript
// In analytics.ts
track(event: AnalyticsEvent) {
  console.log('Event added to queue:', this.events.length + 1)
  this.events.push(event)
  
  if (this.events.length >= this.BATCH_SIZE) {
    console.log('Batch full, flushing immediately')
    this.flushNow()
  } else {
    console.log('Scheduling flush in 2 seconds')
    this.scheduleFlush()
  }
}
```

---

### Issue 5: Modal Not Resetting View Count

**Symptoms:**
- Opening modal multiple times only counts as 1 view total
- Expected: Each open = 1 view

**Cause:**
Missing reset logic when modal closes.

**Fix:**
```typescript
useEffect(() => {
  if (isOpen && property && !hasTrackedModalView.current) {
    trackDetailView(property.id)
    hasTrackedModalView.current = true
  }
  
  // CRITICAL: Reset on close
  if (!isOpen) {
    hasTrackedModalView.current = false
  }
}, [isOpen, property])
```

---

## Environment Variables

### Required

**`NEXT_PUBLIC_API_URL`**
- **Development:** `http://localhost:8000`
- **Production:** `https://api.mrimot.com`
- **Usage:** Backend API base URL

**Example `.env.local`:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**How it's used:**
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const endpoint = `${apiUrl}/api/v1/analytics/events`
```

---

## Best Practices

### 1. Always Use `useRef` Guards
```typescript
// ✅ Good
const hasTracked = useRef(false)

useEffect(() => {
  if (!hasTracked.current) {
    trackDetailView(projectId)
    hasTracked.current = true
  }
}, [projectId])

// ❌ Bad (fires on every render)
useEffect(() => {
  trackDetailView(projectId)
}, [projectId])
```

---

### 2. Reset Guards When Necessary
```typescript
// ✅ Good (modal resets on close)
useEffect(() => {
  if (isOpen && !hasTracked.current) {
    trackDetailView(projectId)
    hasTracked.current = true
  }
  
  if (!isOpen) {
    hasTracked.current = false  // Reset for next open
  }
}, [isOpen, projectId])

// ❌ Bad (modal only tracks once ever)
useEffect(() => {
  if (isOpen && !hasTracked.current) {
    trackDetailView(projectId)
    hasTracked.current = true
    // Missing reset!
  }
}, [isOpen, projectId])
```

---

### 3. Don't Track on Card Visibility
```typescript
// ❌ Bad (inflates metrics)
<IntersectionObserver onChange={isVisible => {
  if (isVisible) trackDetailView(listing.id)
}} />

// ✅ Good (only on actual detail view)
// No tracking on cards at all!
```

---

### 4. Flush Before Critical Navigation
```typescript
// ✅ Good (ensures events are sent)
const handleCheckout = () => {
  analyticsQueue.flushNow()
  router.push('/checkout')
}

// ⚠️ Risky (events might be lost if user navigates quickly)
const handleCheckout = () => {
  router.push('/checkout')
}
```

---

### 5. Use Type-Safe Helpers
```typescript
// ✅ Good (type-safe, consistent)
import { trackDetailView, trackClickPhone } from '@/lib/analytics'

trackDetailView(projectId)
trackClickPhone(projectId)

// ❌ Bad (easy to make typos)
analyticsQueue.track({
  project_id: projectId,
  type: 'detail_veiw',  // Typo! Backend will reject
  ts: new Date().toISOString(),
})
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User Action (opens listing, clicks button)                │
│           ↓                                                 │
│  ┌──────────────────────┐                                  │
│  │   trackDetailView()  │ ← Import from lib/analytics      │
│  │   trackClickPhone()  │                                  │
│  │   trackClickWebsite()│                                  │
│  └──────────────────────┘                                  │
│           ↓                                                 │
│  ┌──────────────────────┐                                  │
│  │   analyticsQueue     │ Singleton queue                  │
│  │   (batches events)   │ - Max 20 events                  │
│  │                      │ - Flush after 2s                 │
│  │                      │ - Flush on unload                │
│  └──────────────────────┘                                  │
│           ↓                                                 │
│  POST /api/v1/analytics/events                             │
│  {                                                          │
│    session_id: "uuid",                                      │
│    events: [...]                                            │
│  }                                                          │
│           ↓                                                 │
└───────────┼─────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  analytics_v2.py                                            │
│  ├─ Validate request                                        │
│  ├─ Rate limit (Redis)                                      │
│  ├─ Bot filtering                                           │
│  ├─ Resolve project IDs (bulk)                             │
│  ├─ Deduplicate detail_view (Redis)                        │
│  ├─ Atomic DB upserts (Postgres)                           │
│  └─ Log all events (audit trail)                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  project_stats_daily  → Time-series for charts             │
│  project_stats_total  → All-time totals (fast queries)     │
│  analytics_events     → Full audit log                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Related Documentation
- [Backend Analytics v2](../../mr-imot-backend/docs/ANALYTICS_V2.md)
- [Analytics Retention Policy](../../mr-imot-backend/docs/ANALYTICS_RETENTION.md)

---

## Support
For questions or issues, contact the development team or file an issue in the project repository.
