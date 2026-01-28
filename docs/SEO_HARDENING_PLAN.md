# SEO Hardening Plan — Phased PRs

Long-term architecture hardening after sitemap freshness, news canonical, ACTIVE-only public listings, and MoreFromDeveloper filtering. Small PRs, clear acceptance tests, and rollback strategy.

---

## Summary

| Phase | Scope | Risk | Rollback |
|-------|--------|------|----------|
| **1** | Developer filter contract (API: `developer_id` UUID only + `developer_slug`; resolve in API layer; remove from service) | Low | Revert API + service; frontend unchanged |
| **2** | SSR verification + doc (prove MoreFromDeveloper / SimilarListings in initial HTML) | None | Doc only |
| **3** | City status: always 200 with `city_exists`, `has_active_listings`, `active_count` | Low | Revert backend + frontend optional handling |
| **4** | Regression guardrails (extend smoke script + listing SSR checks) | Low | Remove new checks from script/CI |
| **5** | SEO helper coverage (params, TODOs, sort_by) | None | Code + doc |

---

## Phase 1 — Developer filter contract (remove ambiguity)

**Goal:** API contract explicit: `developer_id` = UUID only (422 if invalid), `developer_slug` = string; API layer resolves slug → UUID; service layer only receives UUID. Frontend already sends UUID.

### 1.1 Proposed endpoint signature

**GET /api/v1/projects**

| Param | Type | Validation | Behavior |
|-------|------|------------|----------|
| `developer_id` | string, optional | If present: must be valid UUID (RFC 4122); else **422 Unprocessable Entity** | Filter by `Project.developer_id == developer_id` |
| `developer_slug` | string, optional | Any string | Resolve `Developer.slug == developer_slug` → UUID; then filter by that UUID. If slug not found, return 0 projects. |
| (mutual exclusivity) | | If both `developer_id` and `developer_slug` provided → **422** | |

- Service layer: `ProjectSearch.developer_id` is **always** a UUID string or None. No slug resolution in service.
- Frontend: MoreFromDeveloper continues to send `developer_id={UUID}` from `project.developer_id ?? project.developer?.id`. No `developer_slug` from frontend.

### 1.2 Exact file diffs

**Backend**

1. **`app/api/v1/projects.py`**
   - Add query param: `developer_slug: str | None = Query(None, description="Filter by developer slug (e.g. tobo-grup-b0ab841d). Mutually exclusive with developer_id.")`.
   - Validate: if both `developer_id` and `developer_slug` set → raise HTTP 422.
   - If `developer_id` set: validate UUID (e.g. regex); if invalid → 422.
   - If `developer_slug` set: run a single query to resolve slug to UUID (e.g. `select(Developer.id).where(Developer.slug == developer_slug)`); if not found, pass a sentinel or `resolved_uuid = None` and then pass to search; service must treat “slug provided but not found” as 0 projects.
   - Build `effective_developer_id: str | None`: either validated `developer_id`, or resolved UUID from `developer_slug`, or None.
   - Pass `effective_developer_id` into `ProjectSearch(..., developer_id=effective_developer_id)`.

2. **`app/services/project_service.py`**
   - Remove `_resolve_developer_id` and `UUID_PATTERN`.
   - Remove `Developer` import and any slug lookup.
   - In `get_projects`: use `developer_id = getattr(params, "developer_id", None)` only. Remove `developer_id_raw`, `developer_id_requested_but_unknown`, and the `false()` branch; keep only `if developer_id: query = query.where(Project.developer_id == developer_id)`.
   - (If API layer passes None when slug not found, service already returns 0 projects by not applying developer filter and not adding a “no match” branch; but then we’d return all ACTIVE. So API layer must pass a sentinel or a dedicated flag. Simpler: API layer resolves slug → UUID; if not found, pass a UUID that doesn’t exist, e.g. call a small helper that returns a non-existent UUID so the filter returns 0 projects. Or: API layer passes `developer_id=None` when slug not found and also sets a flag that means “filter by developer but none found” — that would require a new param. Cleanest: when slug not found, pass a fake UUID that no project has, e.g. `00000000-0000-0000-0000-000000000000`, so the filter returns 0 projects. So API: if developer_slug set and lookup returns None, set effective_developer_id = "00000000-0000-0000-0000-000000000000". Then service stays dumb: just filter by developer_id.)

3. **`app/schemas/project.py`**
   - No change: `ProjectSearch.developer_id` remains `Optional[str]` (UUID).

**Frontend**

4. **`app/(public)/[lang]/listings/[id]/listing-page-content.tsx`**
   - Comment only: “MoreFromDeveloper must receive UUID (developer_id or developer.id). Backend accepts developer_id (UUID) or developer_slug; we only send developer_id.”

5. **`docs/seo-architecture.md`**
   - In “MoreFromDeveloper / SimilarListings” contract: “GET /projects accepts **developer_id** (UUID only; 422 if invalid) or **developer_slug** (resolved to UUID in API layer). MoreFromDeveloper sends **developer_id** (UUID) from listing payload. Service layer does not resolve slugs.”

### 1.3 Acceptance tests

- **Curl**
  - `GET /api/v1/projects?developer_id=invalid` → 422.
  - `GET /api/v1/projects?developer_id=<valid-uuid>` → 200, list of projects for that developer.
  - `GET /api/v1/projects?developer_slug=tobo-grup-b0ab841d` → 200, same count as by UUID (if slug exists).
  - `GET /api/v1/projects?developer_slug=nonexistent-slug` → 200, `projects: []`.
  - `GET /api/v1/projects?developer_id=<uuid>&developer_slug=foo` → 422.

- **Automated**
  - Backend test: request with invalid `developer_id` → 422; with valid UUID → 200; with `developer_slug` that exists → 200 and same developer’s projects.

### 1.4 Risks and rollback

- **Risk:** Clients (if any) sending `developer_id=<slug>` will break (422). Mitigation: announce that only UUID is accepted for `developer_id`; use `developer_slug` for slug.
- **Rollback:** Revert API and service to current behavior (service resolves slug); redeploy.

---

## Phase 2 — Prove MoreFromDeveloper and SimilarListings are SSR-visible

**Goal:** Confirm internal links are in the initial HTML for crawlers (no JS required).

### 2.1 Check

- **Are these sections in the initial HTML?**  
  Yes: `ListingPageContent` is a Server Component (default async function). It renders `MoreFromDeveloper` and `SimilarListings` as async server components (no `"use client"`). They are siblings of `ListingDetailClient` (client), not inside it. So they are server-rendered and should appear in the first response body.

- **If not, why?**  
  Possible causes: Suspense boundary that defers them (check for `<Suspense>` around these blocks); streaming that shows them only after client hydration (unlikely for Next App Router with no explicit Suspense here). No client boundary wraps them.

- **Ensure:** No `"use client"` on `MoreFromDeveloper` or `SimilarListings`; no `<Suspense>` that would strip them from initial HTML. Keep `next: { revalidate: 300 }` on their fetches so they remain cached.

### 2.2 View-source verification (deliverable)

- **Page 1:** A listing detail URL that has enough inventory (developer with ≥2 other ACTIVE projects, city with ≥3 ACTIVE projects). Example: `https://mrimot.com/bg/obiavi/p/khaidushka-gora-iii-oblast-sofiia-512baab2`.
- **Page 2:** Another listing (or same) with different locale if needed.

**Steps:**

1. Open the URL in a browser; “View Page Source” (no JS execution).
2. Search the raw HTML for:
   - `More from this developer` (or the translated aria-label / heading).
   - `Similar listings in this city` (or translated equivalent).
   - At least one `<a href=` that points to another listing (e.g. `/bg/obiavi/p/...` or `/listings/p/...`) and at least one link to a developer profile (e.g. `/bg/stroiteli/...`).

**Expected:** Both strings and such links appear in the source. If they do not, add a short “SSR checklist” in the doc and refactor plan: remove any Suspense that defers these sections, or move their data fetch earlier so they are in the first chunk.

### 2.3 Doc update

- In `docs/seo-architecture.md` (or `SEO_VERIFICATION_REPORT.md`): add a subsection “SSR visibility of internal links” stating that MoreFromDeveloper and SimilarListings are server components rendered in the initial HTML; view-source checks above confirm crawlers see the links without JS.

### 2.4 Risks and rollback

- No code change required if view-source confirms. Rollback N/A.

---

## Phase 3 — City status endpoint contract (always 200)

**Goal:** One long-term contract: always 200 with a deterministic body. Frontend no longer branches on 404.

### 3.1 Choice: Option A — Always 200 with `city_exists`, `has_active_listings`, `active_count`

- **Response:** `{ city_key: string, city_exists: boolean, has_active_listings: boolean, active_count: number }`.
- **Semantics:**  
  - If `city_key` is in `City` table: `city_exists: true`, `has_active_listings: (count >= 1)`, `active_count: N`.  
  - If `city_key` is not in `City` table: `city_exists: false`, `has_active_listings: false`, `active_count: 0`.
- **Frontend:** Use `has_active_listings` for noindex; optionally use `active_count` for UI. No 404 handling.

### 3.2 Exact file diffs

**Backend**

1. **`app/api/v1/cities.py`**
   - Extend `CityStatusResponse`: add `city_exists: bool`, `active_count: int`.
   - In `get_city_status`: do not raise 404. Always return 200. If city not in DB: `city_exists=False`, `has_active_listings=False`, `active_count=0`. If city in DB: run existing count query; set `city_exists=True`, `has_active_listings=(count >= 1)`, `active_count=count`.

**Frontend**

2. **`app/(public)/[lang]/listings/c/[cityKey]/page.tsx`**
   - `fetchCityStatus`: on non-OK still treat as no listings (defensive). On 200, use `data.has_active_listings` and optionally `data.active_count`. No special 404 handling.
   - Comment: “City status contract: 200 with city_exists, has_active_listings, active_count; unknown city → city_exists false.”

**Docs**

3. **`docs/seo-architecture.md`**
   - “City status endpoint”: “GET /cities/{city_key}/status returns **200** always. Body: city_key, **city_exists**, has_active_listings, **active_count**. Frontend noindex when has_active_listings is false.”

### 3.3 Acceptance tests

- **Curl**
  - `GET /api/v1/cities/sofia-bg/status` → 200, `city_exists: true`, `has_active_listings: true`, `active_count: N` (N ≥ 1 if any ACTIVE).
  - `GET /api/v1/cities/nonexistent-city-key/status` → 200, `city_exists: false`, `has_active_listings: false`, `active_count: 0`.

- **Automated**
  - Backend test: unknown city_key → 200 and body with city_exists false; known city_key → 200 and city_exists true and active_count ≥ 0.

### 3.4 Risks and rollback

- **Risk:** Any consumer that relied on 404 for “city unknown” will see 200 instead. Mitigation: document and optionally add a deprecation header for one release.
- **Rollback:** Revert backend to 404 for unknown city; revert frontend to treating non-OK as no listings.

---

## Phase 4 — Regression guardrails (CI)

**Goal:** Automated checks that fail CI if we regress: sitemap index entries, canonicals, noindex, and SSR presence of MoreFromDeveloper / SimilarListings.

### 4.1 Extend existing smoke script

**File:** `scripts/seo-smoke-test.sh` (or equivalent; Windows may need a Node script that uses `fetch` + regex).

- **Already covered:**  
  - Sitemap index contains `static.xml` and `news.xml`.  
  - /listings?page=2 noindex + canonical.  
  - /news?page=2 noindex + canonical.

- **Add or tighten:**
  1. **/news?page=2 canonical must be base (no query)**  
     Assert the canonical link href does **not** contain `?page=2` (e.g. `grep -oE 'href="[^"]*canonical[^"]*"'` or similar; then check the URL does not include `page=2`).
  2. **/listings?page=2**  
     Already checks noindex + canonical; optionally assert canonical URL has no `page=2`.

### 4.2 Listing detail SSR checks

- **Option A — Same shell script:**  
  - Require an env var e.g. `LISTING_DETAIL_URL=https://mrimot.com/bg/obiavi/p/<slug>` (a known listing with enough inventory).  
  - `curl -sS "$LISTING_DETAIL_URL"` and assert:
    - HTML contains the string `More from this developer` (or localized equivalent; can use a short substring).
    - HTML contains the string `Similar listings in this city` (or localized).
    - HTML contains at least one `<a href=` that matches `/obiavi/p/` or `/listings/p/` (another listing).
  - If `LISTING_DETAIL_URL` is unset, skip these checks (so CI can run without a known seed URL).

- **Option B — Playwright:**  
  - One test: navigate to a listing detail URL (from env or fixture), get `page.content()`, then assert the above strings and link presence. No click/hydration needed.

Recommendation: start with **Option A** in the existing bash script to avoid new deps; add Playwright later if needed.

### 4.3 CI integration

- Run the smoke script in CI (e.g. `scripts/seo-smoke-test.sh`) after deploy or against a staging URL. If running against production, use `BASE=https://mrimot.com`; for staging, set `BASE` and optionally `LISTING_DETAIL_URL`.

### 4.4 Exact changes

- **`scripts/seo-smoke-test.sh`**
  - In `check_news_page2`: add assertion that the canonical link does not contain `?page=2` (e.g. parse meta/link and fail if canonical includes `page=2`).
  - Add `check_listing_ssr` (optional, when `LISTING_DETAIL_URL` set): curl listing URL; grep for “More from this developer” and “Similar listings in this city” and at least one listing link.

### 4.5 Risks and rollback

- **Risk:** Flaky if production listing is removed or locale changes. Mitigation: use a stable seed URL or skip when env unset.
- **Rollback:** Remove the new assertions or the listing SSR check from the script.

---

## Phase 5 — SEO helper coverage (seo-indexation)

**Goal:** Helper and docs cover all params used today; TODOs and assertion for future q/category/tag; sort_by ready when it lands.

### 5.1 Current coverage

- **Listings:** Helper has `page`, `type`, `city_key`, `city`, bounds, `search_by_map`. Used in listings page. **sort_by:** in taxonomy and used in API; not in URL/searchParams on main listings page yet (only in internal fetch params). When sort_by appears in URL, add to helper and taxonomy.
- **News:** Helper has `page` only. Page uses `q`, `category`, `tag` in component; generateMetadata does **not** set noindex for q/category/tag (only for page > 1). Taxonomy already says “only page 1 with no filters” and “q, category, tag → noindex”.
- **Developers:** Helper has `page`. Covered.

### 5.2 Changes

1. **`lib/seo-indexation.ts`**
   - Add **sort_by** to `ListingsIndexationParams` and in `getListingsIndexation`: if `params.sort_by` is present and not empty, set index = false and canonicalPath = base (same as type filter). So when sort_by lands in URL, it’s already handled.
   - In **News**: add optional `q?`, `category?`, `tag?` to `NewsIndexationParams`. In `getNewsIndexation`: if any of q/category/tag present → index = false, canonicalPath = baseNewsPath. (So “once implemented” we already have the behavior; no TODO in code, just doc.)
   - Add a short comment or JSDoc: “When news filter params (q, category, tag) are used in generateMetadata, pass them here; they force noindex + canonical to base.”

2. **`docs/seo-architecture.md`**
   - Under “Helper coverage”: “News indexation: currently only `page` is passed from generateMetadata. Params q, category, tag are in taxonomy and in the helper interface; when wired in generateMetadata, they must force noindex and canonical to base. sort_by (listings): in helper; when in URL, noindex + canonical to base.”

3. **Assertion / test**
   - In `lib/seo-indexation.test.ts`: add a test that `getNewsIndexation` with `page: '1'` and `category: 'real-estate'` returns `index: false` and `canonicalPath: baseNews`. Add test for `getListingsIndexation` with `sort_by: 'created_at'` → noindex and canonical base (when you add sort_by to the helper).

### 5.3 TODOs

- In code or doc: “When news page wires q/category/tag into generateMetadata, pass them to getNewsIndexation so filter pages are noindex with canonical to base.”
- “When listings expose sort_by in URL, ensure getListingsIndexation receives it and keeps noindex + canonical to base.”

### 5.4 Risks and rollback

- Low risk. Rollback: revert helper changes and tests.

---

## Deliverables checklist

- [ ] **Phase 1:** API signature with `developer_id` (UUID only) + `developer_slug`; resolution in API; service dumb; frontend unchanged; docs updated. Curl + backend test.
- [ ] **Phase 2:** View-source verification on 2 listing pages; doc “SSR visibility of internal links”.
- [ ] **Phase 3:** City status always 200 with `city_exists`, `has_active_listings`, `active_count`; frontend + docs updated. Curl + backend test.
- [ ] **Phase 4:** Smoke script: canonical /news?page=2 without query; optional listing SSR check. CI runs script.
- [ ] **Phase 5:** Helper: sort_by (listings), q/category/tag (news); tests; docs and TODOs.

---

## Acceptance tests summary

| Check | Curl / manual | Automated |
|-------|----------------|-----------|
| developer_id invalid → 422 | `curl ...?developer_id=invalid` | Backend test |
| developer_id UUID → 200 | `curl ...?developer_id=<uuid>` | Backend test |
| developer_slug → 200, 0 or more projects | `curl ...?developer_slug=...` | Backend test |
| Both developer_id + developer_slug → 422 | `curl ...?developer_id=...&developer_slug=...` | Backend test |
| Sitemap index has static.xml + news.xml | Already in script | `seo-smoke-test.sh` |
| /news?page=2 canonical base (no query) | View source | New assertion in script |
| /listings?page=2 noindex + canonical base | Already in script | `seo-smoke-test.sh` |
| Listing detail: MoreFromDeveloper + SimilarListings in HTML | View source (2 pages) | Optional: script or Playwright when LISTING_DETAIL_URL set |
| City status unknown → 200, city_exists false | `curl .../cities/fake/status` | Backend test |
| City status known → 200, city_exists true, active_count | `curl .../cities/sofia-bg/status` | Backend test |
| News getNewsIndexation(q/category/tag) → noindex | — | `seo-indexation.test.ts` |
| Listings getListingsIndexation(sort_by) → noindex | — | `seo-indexation.test.ts` (when sort_by in helper) |
