# Manual Testing Guide: Listing Status Flow (Active/Paused/Deleted)

## Overview
This guide covers testing the three-tier status system for listings: `active`, `paused`, and `deleted`.

---

## Prerequisites

1. **Backend API access** (admin or developer account)
2. **Database access** (optional, for direct status changes)
3. **Browser DevTools** (to inspect API responses and metadata)
4. **Google Search Console** (to verify SEO signals)

---

## Test Scenarios

### 1. **Active Listing (Baseline Test)**

**Purpose:** Verify normal listing behavior

**Steps:**
1. Create a new listing via developer dashboard
2. Visit the listing page: `https://mrimot.com/en/listings/{id}`
3. Verify:
   - ✅ Full listing details are displayed
   - ✅ Images, description, contact info visible
   - ✅ Page has proper SEO metadata (title, description, canonical)
   - ✅ **NO** `noindex` robots tag in `<head>`
   - ✅ JSON-LD Product schema is present
   - ✅ API returns full project object: `GET /api/v1/projects/{id}`

**Expected API Response:**
```json
{
  "id": "...",
  "title": "...",
  "description": "...",
  "status": "active",  // or omitted (defaults to active)
  // ... full project data
}
```

---

### 2. **Paused Listing (Subscription Expiration)**

**Purpose:** Verify paused listings don't leak data and have proper SEO

**Steps:**

#### Option A: Via Database (Direct)
```sql
UPDATE projects SET status = 'paused' WHERE id = '{project_id}';
```

#### Option B: Via Backend API (if endpoint exists)
```bash
# If you have an admin endpoint to pause listings
PATCH /api/v1/admin/projects/{id}/pause
```

#### Option C: Simulate Subscription Expiration
- Set developer subscription to expired in database
- Backend should automatically pause all developer's listings

**Testing:**
1. Change a listing status to `paused` in database
2. Visit the listing page: `https://mrimot.com/en/listings/{id}`
3. **Verify Frontend:**
   - ✅ Shows generic "Listing Temporarily Unavailable" page
   - ✅ **NO** project title, images, or description visible
   - ✅ Only shows: "Paused" badge, generic message, "Browse Other Projects" button
   - ✅ Page has `noindex, nofollow` robots tag
   - ✅ Generic metadata (no project-specific data)
   - ✅ **NO** JSON-LD Product schema

4. **Verify API Response:**
   ```bash
   curl https://api.mrimot.com/api/v1/projects/{id}
   ```
   **Expected:**
   ```json
   {
     "id": "{project_id}",
     "status": "paused"
   }
   ```
   - ✅ **ONLY** `id` and `status` fields
   - ✅ **NO** title, description, images, address, etc.

5. **Verify SEO:**
   - Check page source: `<meta name="robots" content="noindex, nofollow">`
   - Verify canonical URL points to listings page (not project-specific)
   - Check Google Search Console: page should not be indexed

---

### 3. **Deleted Listing (Soft Delete)**

**Purpose:** Verify deleted listings return proper status and SEO

**Steps:**

#### Option A: Via Developer Dashboard
1. Log in as developer
2. Go to "My Projects"
3. Delete a listing (should soft delete, not hard delete)

#### Option B: Via Admin Dashboard
1. Log in as admin
2. Find a listing
3. Delete it

#### Option C: Via Database (Direct)
```sql
UPDATE projects SET status = 'deleted', deleted_at = NOW() WHERE id = '{project_id}';
```

**Testing:**
1. Delete a listing (via dashboard or database)
2. Visit the listing page: `https://mrimot.com/en/listings/{id}`
3. **Verify Frontend:**
   - ✅ Shows generic "Listing Removed" page
   - ✅ **NO** project title, images, or description visible
   - ✅ Only shows: "Removed" badge, generic message, "Browse Other Projects" button
   - ✅ Page has `noindex, nofollow` robots tag
   - ✅ Generic metadata (no project-specific data)
   - ✅ **NO** JSON-LD Product schema

4. **Verify API Response:**
   ```bash
   curl https://api.mrimot.com/api/v1/projects/{id}
   ```
   **Expected:**
   ```json
   {
     "id": "{project_id}",
     "status": "deleted"
   }
   ```
   - ✅ **ONLY** `id` and `status` fields
   - ✅ **NO** title, description, images, address, etc.
   - ✅ Returns **200 OK** (not 404)

5. **Verify Database:**
   ```sql
   SELECT id, status, deleted_at FROM projects WHERE id = '{project_id}';
   ```
   - ✅ `status` = `'deleted'`
   - ✅ `deleted_at` timestamp is set
   - ✅ Record still exists (soft delete)

6. **Verify SEO:**
   - Check page source: `<meta name="robots" content="noindex, nofollow">`
   - Verify canonical URL points to listings page
   - Check Google Search Console: page should not be indexed

---

### 4. **Non-Existent Listing (Never Created)**

**Purpose:** Verify 404 handling for listings that never existed

**Steps:**
1. Visit a listing page with a random/invalid ID: `https://mrimot.com/en/listings/invalid-id-12345`
2. **Verify:**
   - ✅ Shows Next.js 404 page
   - ✅ API returns `404 Not Found`
   - ✅ Page has `noindex, nofollow` robots tag

**Expected API Response:**
```json
{
  "detail": "Project not found"
}
```
Status: `404 Not Found`

---

### 5. **Listings List Endpoint**

**Purpose:** Verify paused/deleted listings don't appear in public listings

**Steps:**
1. Create 3 listings:
   - Listing A: `status = 'active'`
   - Listing B: `status = 'paused'`
   - Listing C: `status = 'deleted'`

2. Call listings API:
   ```bash
   curl https://api.mrimot.com/api/v1/projects
   ```

3. **Verify:**
   - ✅ Only Listing A appears in results
   - ✅ Listings B and C are **NOT** in the response
   - ✅ Total count excludes paused/deleted listings

---

### 6. **Status Transition Flow**

**Purpose:** Test changing status from one state to another

**Steps:**
1. **Active → Paused:**
   - Set listing to `paused`
   - Verify paused page appears
   - Verify API returns `{id, status: "paused"}`

2. **Paused → Active:**
   - Set listing back to `active`
   - Verify full listing page appears
   - Verify API returns full project data

3. **Active → Deleted:**
   - Set listing to `deleted`
   - Verify deleted page appears
   - Verify API returns `{id, status: "deleted"}`

4. **Deleted → Active (Restore):**
   - Set listing back to `active`
   - Verify full listing page appears
   - Verify API returns full project data

---

### 7. **Security Test: Data Leakage Prevention**

**Purpose:** Ensure paused/deleted listings don't leak sensitive data

**Steps:**
1. Create a listing with sensitive data:
   - Developer contact info
   - Project address
   - Images
   - Description

2. Set status to `paused`

3. **Verify:**
   - ✅ API response contains **ONLY** `{id, status: "paused"}`
   - ✅ Frontend page source has **NO** project data in HTML
   - ✅ Browser DevTools Network tab shows minimal API response
   - ✅ No project images are loaded
   - ✅ No project-specific metadata in `<head>`

4. Repeat for `deleted` status

---

### 8. **SEO Verification**

**Purpose:** Verify search engines handle status changes correctly

**Steps:**

1. **For Active Listing:**
   - Check page source for `<meta name="robots">`
   - Should **NOT** have `noindex`
   - Verify canonical URL is project-specific
   - Verify JSON-LD schema is present

2. **For Paused Listing:**
   - Check page source: `<meta name="robots" content="noindex, nofollow">`
   - Verify canonical URL is generic (points to listings page)
   - Verify **NO** JSON-LD schema

3. **For Deleted Listing:**
   - Check page source: `<meta name="robots" content="noindex, nofollow">`
   - Verify canonical URL is generic
   - Verify **NO** JSON-LD schema

4. **Google Search Console:**
   - Request indexing for active listing (should index)
   - Request indexing for paused listing (should reject with noindex)
   - Request indexing for deleted listing (should reject with noindex)

---

## Quick Test Checklist

- [ ] Active listing displays full details
- [ ] Paused listing shows generic "unavailable" page
- [ ] Deleted listing shows generic "removed" page
- [ ] Paused API returns only `{id, status: "paused"}`
- [ ] Deleted API returns only `{id, status: "deleted"}`
- [ ] Paused/deleted listings don't appear in listings list
- [ ] Paused listing has `noindex` meta tag
- [ ] Deleted listing has `noindex` meta tag
- [ ] Active listing has no `noindex` tag
- [ ] No data leakage in paused/deleted API responses
- [ ] No data leakage in paused/deleted page HTML
- [ ] Status transitions work correctly (active ↔ paused ↔ deleted)
- [ ] Non-existent listing returns 404

---

## Common Issues to Watch For

1. **Data Leakage:** If paused/deleted API returns full project data → **CRITICAL BUG**
2. **Missing noindex:** If paused/deleted pages don't have `noindex` → SEO issue
3. **Wrong Status:** If API returns wrong status → Backend bug
4. **404 Instead of Status:** If deleted listing returns 404 instead of `{status: "deleted"}` → Wrong implementation
5. **Hard Delete:** If deleted listing is removed from database → Should be soft delete

---

## Database Queries for Testing

```sql
-- Check listing status
SELECT id, status, deleted_at, title FROM projects WHERE id = '{project_id}';

-- Set to paused
UPDATE projects SET status = 'paused' WHERE id = '{project_id}';

-- Set to deleted
UPDATE projects SET status = 'deleted', deleted_at = NOW() WHERE id = '{project_id}';

-- Set back to active
UPDATE projects SET status = 'active', deleted_at = NULL WHERE id = '{project_id}';

-- Verify soft delete (record should still exist)
SELECT COUNT(*) FROM projects WHERE id = '{project_id}'; -- Should return 1
```

---

## API Testing Commands

```bash
# Test active listing
curl https://api.mrimot.com/api/v1/projects/{active_id}

# Test paused listing
curl https://api.mrimot.com/api/v1/projects/{paused_id}

# Test deleted listing
curl https://api.mrimot.com/api/v1/projects/{deleted_id}

# Test non-existent listing
curl https://api.mrimot.com/api/v1/projects/invalid-id-12345

# Test listings list (should exclude paused/deleted)
curl https://api.mrimot.com/api/v1/projects
```

---

## Notes

- **Paused listings** are for subscription expiration scenarios
- **Deleted listings** are soft-deleted for SEO and audit trail
- Both return minimal responses to prevent data leakage
- Both use `noindex` to prevent search engine indexing
- Status changes should be reversible (paused → active, deleted → active)

