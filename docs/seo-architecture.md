# SEO Architecture (mrimot.com)

Long-term reference for indexation rules, sitemap contract, query-param taxonomy, and guardrails. Implementation order and phased plan live in **SEO_ARCHITECTURE_PLAN.md**.

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

**Current helper coverage:** `lib/seo-indexation.ts` covers listings (`page`, `type`, `city`/`city_key`, bounds, `search_by_map`), news (`page`), developers (`page`). Params such as `sort_by`, `q`, `category`, `tag` are not yet passed to the helper; when added to pages, add them here and to the helper.

---

## 2. Sitemap Contract (Never Break)

- **Projects sitemap** includes **only** projects with `Project.status == ACTIVE`.
- **Cities sitemap** includes **only** cities that have **≥ 1 ACTIVE** project.
- When a project becomes **PAUSED** or **DELETED**, it **drops out** of projects sitemap and city counts on **next sitemap generation** (no manual step).
- **Acceptance test**: Create one project → it appears in project sitemap; set it to PAUSED → it disappears from sitemap on next generation.

Backend: `mr-imot-backend/app/api/v1/sitemaps/routes.py` must keep using `Project.status == ProjectStatus.ACTIVE` in all sitemap queries (index count, projects sitemap, cities sitemap, projects count). Do not add a sitemap that includes non-ACTIVE projects.

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
