# Cleanup and Audit Plan - Listings Refactor

## Overview
This plan identifies dead code, verifies single source of truth, audits fetch lifecycle, and ensures SEO hygiene after the map-mode pagination refactor.

---

## Phase 2: Kill Dead Code and Split-Brain Leftovers

### Task 1: Remove Obsolete Cursor Pagination

**Status:** ⚠️ Cursor pagination code still exists but is marked unused

**Files to Audit:**
- `listings-client-content.tsx` (lines 89-92, 135-137, 151-152)
- `listings-client-wrapper.tsx` (lines 29-31, 40-42, 274-277)
- `page.tsx` (lines 21, 424-426)

**Actions:**
1. Verify `currentCursor` is never used in rendering logic
2. Remove cursor-related props from interfaces
3. Remove cursor deletion from URL params (lines 567, 601, 708, 742 in listings-client-content.tsx)
4. Remove comment on line 1371: `{/* Infinite scroll can still load next cursor, but Next link is server-rendered */}`
5. Remove `initialCursor`, `nextCursor`, `prevCursor` from all prop interfaces

**Verification:**
```bash
grep -r "cursor" app/\(public\)/\[lang\]/listings --exclude-dir=node_modules
# Should return 0 results after cleanup
```

---

### Task 2: Audit Data Sources (CRITICAL)

**Current State:**
- `initialProperties` → seeds `propertyCacheRef` on mount (line 85 in listings-client-wrapper.tsx)
- `propertyCacheRef` → single source of truth for both list and markers
- `filteredProperties` → derived from `propertyCacheRef` (line 149-159 in listings-client-wrapper.tsx)

**Files to Audit:**
- `listings-client-content.tsx` - verify no direct rendering from `initialProperties`
- `listings-client-wrapper.tsx` - verify `initialProperties` only seeds cache, never rendered

**Actions:**
1. Search for any `initialProperties.map()` or direct rendering
2. Verify `filteredProperties` is always derived from `propertyCacheRef.current.values()`
3. Check line 246-249 in listings-client-content.tsx - this fallback logic may be obsolete:
   ```typescript
   const sourceProperties = propertyCacheRef.current.size > 0 
     ? Array.from(propertyCacheRef.current.values())
     : filteredProperties
   ```
   If `filteredProperties` is always from `propertyCacheRef`, this fallback is dead code.

**Expected Flow:**
```
seoCityMode: SSR → initialProperties → propertyCacheRef (seed) → filteredProperties → render
mapMode: MapFetchController → propertyCacheRef (replace) → filteredProperties → render
```

**Verification Checklist:**
- [ ] No `initialProperties` in JSX/render logic
- [ ] `filteredProperties` always from `propertyCacheRef`
- [ ] Remove obsolete fallback logic (line 246-249)

---

### Task 3: Clean URL Logic Duplication

**Current Duplication:**
Mode detection logic exists in:
1. `page.tsx` (lines 330-332, 179-180, 55)
2. `listings-client-content.tsx` (lines 144-149, 545-548, 686-689)
3. `listings-client-wrapper.tsx` (implicit via searchParams)

**Actions:**
1. Create shared utility: `lib/listings-mode.ts`
   ```typescript
   export interface ListingsMode {
     isMapMode: boolean
     seoCityMode: boolean
     defaultLanding: boolean
     hasAllBounds: boolean
     cityParam: string | null
   }
   
   export function getListingsMode(searchParams: URLSearchParams): ListingsMode {
     const hasAllBounds = !!(searchParams.get('sw_lat') && searchParams.get('sw_lng') && 
       searchParams.get('ne_lat') && searchParams.get('ne_lng'))
     const isMapMode = searchParams.get('search_by_map') === 'true' || hasAllBounds
     const cityParam = searchParams.get('city') || searchParams.get('city_key')
     const seoCityMode = !!cityParam && !isMapMode
     const defaultLanding = !cityParam && !isMapMode
     
     return { isMapMode, seoCityMode, defaultLanding, hasAllBounds, cityParam }
   }
   ```

2. Replace all mode detection with `getListingsMode(searchParams)`
3. Update `page.tsx` to use shared utility
4. Update `listings-client-content.tsx` to use shared utility

**Files to Modify:**
- Create: `lib/listings-mode.ts`
- Update: `page.tsx`, `listings-client-content.tsx`

**Verification:**
- [ ] Single source of truth for mode detection
- [ ] All files use `getListingsMode()`
- [ ] No duplicate mode logic

---

## Phase 3: Map & Performance Audit

### Task 4: Fetch Lifecycle Audit

**Files to Audit:**
- `lib/map-fetch-controller.ts`
- `listings-client-wrapper.tsx` (onDataUpdate callback)

**Actions:**
1. Verify `requestId` guards:
   - Check `requestIdCounter` increments on each fetch
   - Verify `onDataUpdate` receives `requestId`
   - Check `latestRequestIdRef` in wrapper prevents stale updates

2. Verify abort handling:
   - Check `abortController.abort()` is called on new fetch
   - Verify aborted fetches don't call `onDataUpdate`

3. Verify `boundsCache` usage:
   - Check `boundsCache.get()` is called before network fetch
   - Verify cache hits skip network request
   - Add debug log: `console.debug('[MapFetch]', { bounds, fromCache, requestId })`
   - Remove debug log after verification

4. Check for race conditions:
   - Verify only latest `requestId` updates state
   - Check `latestRequestIdRef.current` comparison in wrapper

**Verification Checklist:**
- [ ] Every fetch has unique `requestId`
- [ ] Stale requests are rejected
- [ ] Aborted requests never update state
- [ ] `boundsCache` is checked before network
- [ ] Cache hits are logged and verified

---

### Task 5: Clustering Behavior Check

**Files to Audit:**
- `lib/marker-manager.ts` (renderMarkers, shouldCluster logic)

**Actions:**
1. Verify clustering logic:
   - `zoom < 12 && properties.length > 20` → clusters
   - `zoom >= 12` → individual markers

2. Test scenarios:
   - Zoom in from cluster → markers appear individually
   - Zoom out → markers cluster
   - Click cluster → zooms correctly
   - List order doesn't change unexpectedly

3. Check for ordering issues:
   - Verify `filteredProperties` order is stable
   - Check if clustering affects list rendering order
   - Document if clustering intentionally changes order

**Verification Checklist:**
- [ ] Clustering works at zoom < 12
- [ ] Individual markers at zoom >= 12
- [ ] Cluster clicks zoom correctly
- [ ] List order is stable
- [ ] No unexpected reordering

---

## Phase 4: SEO Hygiene Pass

### Task 6: Canonical + noindex Verification

**Files to Audit:**
- `page.tsx` (generateMetadata function)

**Actions:**
1. Test all URL variants via `curl` or view-source:

| URL | Expected robots | Expected canonical |
|-----|----------------|-------------------|
| `/bg/obiavi` | `index: true` | `/bg/obiavi` |
| `/bg/obiavi?city=sofia-bg` | `index: true` | `/bg/obiavi?city=sofia-bg` |
| `/bg/obiavi?city=sofia-bg&page=2` | `index: true` | `/bg/obiavi?city=sofia-bg&page=2` |
| `/bg/obiavi?search_by_map=true&...` | `index: false` | `/bg/obiavi` or `/bg/obiavi?city=...` |
| `/bg/obiavi?sw_lat=...&page=2` | `index: false` | `/bg/obiavi` or `/bg/obiavi?city=...` |

2. Verify canonical logic:
   - MapMode URLs canonicalize back to base or city hub
   - City page 1 has no `page` param in canonical
   - City page > 1 includes `page` param

3. Fix any violations:
   - If mapMode URL is indexable → add `noindex: true`
   - If canonical is wrong → fix logic in `generateMetadata`

**Verification Commands:**
```bash
# Test base URL
curl -s "http://localhost:3000/bg/obiavi" | grep -E "(robots|canonical)"

# Test city hub
curl -s "http://localhost:3000/bg/obiavi?city=sofia-bg" | grep -E "(robots|canonical)"

# Test mapMode (should be noindex)
curl -s "http://localhost:3000/bg/obiavi?search_by_map=true&sw_lat=42.5" | grep -E "(robots|canonical)"
```

**Verification Checklist:**
- [ ] Base URL is indexable
- [ ] City hubs are indexable
- [ ] City pagination is indexable
- [ ] MapMode URLs are noindex
- [ ] Canonicals are correct

---

### Task 7: Sitemap Validation

**Files to Audit:**
- `app/sitemap.ts`

**Actions:**
1. Verify sitemap contains:
   - ✅ Base listings URLs (`/[lang]/obiavi`)
   - ✅ City hub URLs (`/[lang]/obiavi?city=<city_key>`)
   - ❌ NO pagination URLs (`?page=2`)
   - ❌ NO mapMode URLs (`?search_by_map=true`)

2. Verify city eligibility:
   - Only cities with `min_projects >= 5` are included
   - Check `getCities({ min_projects: 5 })` is used

3. Test sitemap generation:
   ```bash
   curl http://localhost:3000/sitemap.xml | grep obiavi
   ```

4. Verify lastModified dates:
   - City hubs have `lastModified` from API
   - Format is valid ISO 8601

**Verification Checklist:**
- [ ] Base listings in sitemap
- [ ] City hubs in sitemap (>= min_projects)
- [ ] No pagination URLs
- [ ] No mapMode URLs
- [ ] lastModified dates present

---

## Phase 5: Delete "Just in Case" Code

### Task 8: Remove Defensive Hacks

**Files to Audit:**
- `listings-client-content.tsx` (lines 181-182, 537-538, 678-679)

**Actions:**
1. Evaluate `skipNextMobileIdleFetchRef` and `skipNextDesktopIdleFetchRef`:
   - **Question:** Are these still needed after refactor?
   - **Check:** Do they prevent duplicate fetches on initial load?
   - **Decision:** If SSR data is loaded, first idle should skip fetch. If not needed, remove.

2. Search for "temporary" comments:
   ```bash
   grep -r "temporary\|TEMP\|FIXME\|HACK" app/\(public\)/\[lang\]/listings
   ```

3. Remove obsolete guards:
   - If guard only existed for split-brain bug, remove it
   - If guard prevents valid behavior, remove it

4. Check for duplicated debounce logic:
   - Verify single debounce mechanism (MapFetchController)
   - Remove any duplicate debounce timers

**Verification Checklist:**
- [ ] `skipNextIdleFetchRef` evaluated and removed if obsolete
- [ ] No "temporary" comments
- [ ] No obsolete guards
- [ ] Single debounce mechanism

---

### Task 9: Final Refactor Checkpoint

**Question for each file:** "Can a new dev explain this file in 5 minutes?"

**Files to Review:**
1. `listings-client-content.tsx` (~1400 lines)
2. `listings-client-wrapper.tsx` (~280 lines)
3. `page.tsx` (~440 lines)
4. `pagination-nav.tsx` (~110 lines)
5. `lib/map-fetch-controller.ts` (~390 lines)
6. `lib/marker-manager.ts`

**Actions:**
1. **Rename unclear variables:**
   - `skipNextMobileIdleFetchRef` → `skipInitialMobileIdleFetch` (if kept)
   - `pendingPlaceSelectionRef` → `pendingCitySelectionRef` (clearer)

2. **Collapse conditionals:**
   - Extract mode detection to shared utility (Task 3)
   - Simplify nested if/else chains

3. **Add high-signal comments:**
   - Document why `propertyCacheRef` is replaced (not accumulated)
   - Document why map center only changes via user actions
   - Document why mapMode pagination is client-side only

4. **Remove verbose comments:**
   - Delete obvious comments like `// Set state`
   - Keep only non-obvious logic explanations

**Verification Checklist:**
- [ ] Variable names are clear
- [ ] Conditionals are simplified
- [ ] Comments explain "why", not "what"
- [ ] File structure is logical

---

## Implementation Order

1. **Phase 2 Tasks 1-3** (Dead code removal, data source audit, URL logic deduplication)
2. **Phase 3 Tasks 4-5** (Fetch lifecycle, clustering)
3. **Phase 4 Tasks 6-7** (SEO verification, sitemap)
4. **Phase 5 Tasks 8-9** (Defensive hacks, final checkpoint)

---

## Risk Assessment

**High Risk:**
- Task 2 (Data source audit) - Removing fallback logic could break edge cases
- Task 4 (Fetch lifecycle) - Race conditions could cause stale data

**Medium Risk:**
- Task 1 (Cursor removal) - May break if cursor is used elsewhere
- Task 3 (URL logic deduplication) - Shared utility must be tested thoroughly

**Low Risk:**
- Task 5 (Clustering) - Visual verification only
- Task 6-7 (SEO) - Verification and fixes
- Task 8-9 (Cleanup) - Code quality improvements

---

## Success Criteria

✅ No cursor pagination code remains  
✅ Single source of truth verified (propertyCacheRef)  
✅ Mode detection logic is shared utility  
✅ All fetches have requestId guards  
✅ MapMode URLs are noindex  
✅ Sitemap contains only indexable URLs  
✅ No obsolete defensive code  
✅ Code is maintainable for new devs
