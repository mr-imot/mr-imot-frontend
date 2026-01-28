# SEO Architecture (mrimot.com)

Long-term reference for indexation rules, sitemap contract, query-param taxonomy, and guardrails. Implementation order and phased plan live in **SEO_ARCHITECTURE_PLAN.md**.

---

## SEO Contract (summary)

- **Sitemap freshness**: `/sitemap.xml` must not be cached by the proxy (`Cache-Control: no-store` or `s-maxage=0`); index always reflects backend so crawlers never see a stale index.
- **City status**: `GET /cities/{city_key}/status` returns **404** for unknown `city_key`; **200** with `{ city_key, has_active_listings }` when city exists. Frontend treats non-OK (including 404) as no listings (noindex).
- **Public listing**: Only public unauthenticated `GET /projects` uses `public_listing=True` (ACTIVE only, e.g. MoreFromDeveloper). Sitemaps use ACTIVE-only queries directly; authenticated "my projects" do **not** use `public_listing` (ACTIVE+PAUSED).
- **MoreFromDeveloper / SimilarListings**: Listing detail API returns `developer_id` (UUID) and `developer.id` (UUID). MoreFromDeveloper must use `developer_id ?? developer.id` (UUID). Backend `GET /projects?developer_id=` accepts **UUID or developer slug** (resolves slug to UUID); when slug is not found, the API returns 0 projects. SimilarListings uses `project.city_key`; `GET /projects?city_key=` returns ACTIVE projects in that city. **Card limits**: MoreFromDeveloper shows max 6 cards (CTA to developer profile); SimilarListings shows max 12 cards (CTA to city hub). No pagination; canonical URLs only.

---

## 1. Query-Param Taxonomy

One central list of every search param and its indexation rule. When adding new params (e.g. `sort`, `q`, `price_min`/`price_max`), add them here and ensure the helper and `generateMetadata` logic cover them.

### Listings (`/listings` and `/[lang]/obiavi`, etc.)

| Param | Purpose | Indexable? | Canonical target | In sitemap? | Crawlable? |
|-------|---------|------------|------------------|-------------|------------|
| `page` | Pagination | **No** (page > 1) | Base listings or city hub (page 1) | No | Yes, but noindex |
| `type` | Property type filter (e.g. apartments) | **No** | Base listings or city hub | No | Yes, but noindex |
| `city` | Legacy city (may redirect) | — | Resolved to city_key or base | No | — |
| `city_key` | City slug (e.g. sofia-bg) | **Yes** (page 1, no bounds) | Same URL (page 1) or city hub base | No (city hub has its own URL in sitemap) | Yes |
| `ne_lat`, `sw_lat`, `ne_lng`, `sw_lng` | Map bounds | **No** | Base listings or city hub | No | Yes, but noindex |
| `search_by_map` | Map mode | **No** | Base listings | No | Yes, but noindex |
| `zoom` | Map zoom level | No (follows bounds) | — | No | Yes, noindex when with bounds |
| `sort_by` | Sort order (if/when exposed) | **No** | Base or city hub | No | Yes, but noindex |

**Summary**: Only the **base listings URL** (no params or only `city_key` with page 1 and no map bounds) is indexable. All pagination, type filters, and map/bounds variants are **noindex** with canonical pointing to the appropriate base.

---

### News (`/news` and `/[lang]/novini`, etc.)

| Param | Purpose | Indexable? | Canonical target | In sitemap? | Crawlable? |
|-------|---------|------------|------------------|-------------|------------|
| `page` | Pagination | **No** (page > 1) | Base news URL | No | Yes, but noindex |
| `q` | Search query | **No** | Base news URL | No | Yes, but noindex |
| `category` | Category filter | **No** | Base news URL | No | Yes, but noindex |
| `tag` | Tag filter | **No** | Base news URL | No | Yes, but noindex |

**Summary**: Only **page 1 with no filters** is indexable. All other variants are **noindex** with canonical to base news.

---

### Developers (`/developers` and `/[lang]/stroiteli`, etc.)

| Param | Purpose | Indexable? | Canonical target | In sitemap? | Crawlable? |
|-------|---------|------------|------------------|-------------|------------|
| `page` | Pagination | **No** (page > 1) | Base developers URL | No | Yes, but noindex |

**Summary**: Only **page 1** is indexable. Page 2+ is **noindex** with canonical to base developers.

---

### Helper coverage

The shared SEO helper (e.g. `lib/seo-listings.ts` or `lib/seo-indexation.ts`) must implement:

- **Listings**: `page`, `type`, `city_key`, bounds (`ne_lat`, `sw_lat`, `ne_lng`, `sw_lng`), `search_by_map`. If new params are added (e.g. `sort_by`, `q`, `price_min`/`price_max`), add them to this taxonomy and to the helper.
- **News**: `page`, `q`, `category`, `tag`.
- **Developers**: `page`.

Any param that affects indexation must be in this table and in the helper.

**Current helper coverage:** `lib/seo-indexation.ts` covers listings (`page`, `type`, `city`/`city_key`, bounds, `search_by_map`), news (`page` only), developers (`page`). News indexation currently uses only `page`; `q`, `category`, `tag` are in the taxonomy for future use and are not yet passed to the helper—when added to pages, add them here and to the helper. Params such as `sort_by` (listings) are in taxonomy but not yet in pages.

**Single source of truth:** Listings page uses `getListingsIndexation` for index/canonical. News and developers index pages must keep their index/canonical logic in sync with `getNewsIndexation` and `getDevelopersIndexation` (page 1 indexable, canonical to base). Prefer wiring those pages to the helpers when touching metadata.

### Frontend data caching

| Data | Strategy | Rationale |
|------|----------|-----------|
| Listing detail (project) | `revalidate: 60` | Fast page loads; 1 min stale acceptable. |
| MoreFromDeveloper / SimilarListings | `revalidate: 300` | 5 min cache; internal links stay fresh enough. |
| Developer profile | `cache: 'no-store'`, URL includes `lang` | Fresh project count; locale in URL avoids cache key cross-locale reuse. |
| Sitemap proxy | Response `Cache-Control: no-store`; backend fetch `revalidate: 60` | Index must never be cached by proxy; backend index changes reflected quickly. |
| Listings index, city hub, modal | `revalidate: 60` | Balance freshness and speed. |

No experimental or ad-hoc caching: all fetch caching is intentional and documented here.

### Locale and fetch cache key (avoid "redirect to EN" confusion)

When Next.js caches `fetch()` responses, the **cache key is derived from the request URL** (and optionally headers). If the same URL is used for every locale:

- A response first created under `/developers/...` (EN) can be **reused** when serving `/bg/stroiteli/...` (BG), because the fetch URL is identical and the cache key does not vary by locale.
- Result: page renders in BG (route/UI) but the **data** was fetched/cached in an EN context → looks like a "redirect to EN" or language mismatch. This is **cache key contamination**, not routing logic.

**Rule:** For any server fetch that drives locale-specific or locale-relevant content (e.g. developer profile, listings by locale), include **locale in the request** so the cache key varies by locale:

- Add `lang` (or equivalent) as a **query parameter** to the fetch URL (e.g. `...?per_page=12&lang=bg`). The backend may ignore it; the goal is to make the Next.js cache key per-locale.
- Alternatively use `cache: 'no-store'` for that fetch if freshness is more important than caching; if caching is re-enabled later, the URL must still include locale.

**Implementation:** Developer detail page `getDeveloperData(identifier, lang)` uses `?per_page=12&lang=${lang}` in the URL and `cache: 'no-store'`. Any other locale-specific data fetches (e.g. developers list, news) should follow the same pattern: URL includes locale so cache keys do not cross locales.

---

## 2. Sitemap Contract (Never Break)

- **Projects sitemap** includes **only** projects with `Project.status == ACTIVE`.
- **Cities sitemap** includes **only** cities that have **≥ 1 ACTIVE** project.
- When a project becomes **PAUSED** or **DELETED**, it **drops out** of projects sitemap and city counts on **next sitemap generation** (no manual step).
- **Acceptance test**: Create one project → it appears in project sitemap; set it to PAUSED → it disappears from sitemap on next generation.

Backend: `mr-imot-backend/app/api/v1/sitemaps/routes.py` must keep using `Project.status == ProjectStatus.ACTIVE` in all sitemap queries (index count, projects sitemap, cities sitemap, projects count). Do not add a sitemap that includes non-ACTIVE projects.

### Sitemap freshness (proxy)

- **Policy**: `/sitemap.xml` (frontend proxy to backend index) must **not** be cached by the proxy: use `Cache-Control: no-store` (or `s-maxage=0`).
- **Rationale**: The index must always reflect the backend so crawlers never see a stale index (e.g. missing static.xml, news.xml, or new project chunks). Backend index generation is cheap; crawl frequency is low.
- **Child sitemaps**: Backend endpoints (e.g. `/api/v1/sitemaps/...`) may keep their own caching; only the index is no-store.

Implementation: `mr-imot-frontend/app/sitemap.xml/route.ts` sets `Cache-Control: no-store` on all responses.

### Public listing (ACTIVE-only) contract

- **Who sets `public_listing=True`**: Only **public unauthenticated** `GET /projects` (e.g. `mr-imot-backend/app/api/v1/projects.py`) passes `ProjectSearch(..., public_listing=True)` → ACTIVE only (e.g. MoreFromDeveloper on listing page).
- **Authenticated "my projects"**: Developer endpoints (e.g. `app/api/v1/developers.py`) use a **dict** for search params and do **not** set `public_listing` → ACTIVE+PAUSED.
- **Sitemaps**: Do **not** use `ProjectSearch`; they query `Project.status == ACTIVE` directly. No change.

### City status endpoint

- **Backend**: `GET /cities/{city_key}/status` returns **404** when `city_key` is not in the `City` table; returns **200** with `{ city_key, has_active_listings }` when city exists.
- **Frontend**: On non-OK response (including 404), treat as "no active listings" (noindex); do not distinguish 404 from 200 with `has_active_listings: false`.

### Production sitemap verification

Use these checks to verify sitemap correctness in production.

**A) Backend index (source of truth)**

```bash
curl -sS "https://api.mrimot.com/api/v1/sitemaps/index.xml" | head -80
```

**Expected**: XML sitemap index containing `<loc>https://mrimot.com/sitemaps/static.xml</loc>` and `<loc>https://mrimot.com/sitemaps/news.xml</loc>`, plus per-locale entries (e.g. `.../sitemaps/en/cities.xml`, `.../en/developers.xml`, `.../en/projects/1.xml`) for en, bg, ru, gr.

**B) Frontend proxy index (must match backend within policy)**

```bash
curl -sS "https://mrimot.com/sitemap.xml" | head -80
```

**Expected**: Same set of `<loc>` entries as backend. Response headers should include `Cache-Control: no-store` (or s-maxage=0).

**C) Static sitemap**

```bash
curl -sS "https://mrimot.com/sitemaps/static.xml" | head -120
```

**Expected**: Valid `<urlset>` with `<url><loc>...</loc></url>` entries for key hubs in all locales: e.g. `https://mrimot.com/`, `https://mrimot.com/listings`, `https://mrimot.com/developers`, `https://mrimot.com/news`, about, contact, and locale variants (/bg/obiavi, /bg/stroiteli, /bg/novini, etc.).

**D) News sitemap**

```bash
curl -sS "https://mrimot.com/sitemaps/news.xml" | head -80
```

**Expected**: Non-empty `<urlset>` with real article URLs (e.g. `https://mrimot.com/news/...` or locale paths).

---

## 3. JSON-LD and Locale

- **Listing structured data**: Developer URL must use **locale-aware** route (e.g. `developerHref(lang, slug)`). Do not hardcode `/developers/...` (English path only).
- **Other JSON-LD**: Audit any block that outputs URLs; use route helpers (`listingHref`, `developerHref`, `cityListingsHref`, etc.) with the page locale so hreflang and canonical stay consistent.

---

## 4. Do Not (Guardrails)

- Do not add a sitemap entry for a URL that includes query params (pagination, filters, bounds). Sitemap URLs are canonical bases only.
- Do not index pagination pages (page > 1) for listings, news, or developers; use noindex and canonical to page 1.
- Do not index filter variants (e.g. `?type=apartments`, `?q=...`, `?category=...`) as primary; use noindex and canonical to the base.
- Do not index map/bounds variants; use noindex and canonical to base or city hub.
- Do not include non-ACTIVE projects in any public sitemap or in city “has listings” logic.
- Do not hardcode English paths in JSON-LD; use locale-aware route helpers.
- Do not allow city hub pages to be indexable when the city has zero active listings; use status endpoint and set noindex when `has_active_listings === false`.

---

## 5. References

- **Implementation plan and phased order**: `docs/SEO_ARCHITECTURE_PLAN.md`
- **Codebase SEO briefing**: repo root `CODEBASE_SEO_BRIEFING.md`
- **Route helpers**: `lib/routes.ts` (`listingsHref`, `cityListingsHref`, `listingHref`, `developerHref`, `newsHref`, etc.)
